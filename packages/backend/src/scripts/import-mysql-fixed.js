#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { sequelize } = require('../models/index');
const logger = require('../config/logger');

/**
 * Convert MySQL hexadecimal UUID to PostgreSQL format
 * MySQL: X'30303833623233382D333639622D343733392D393564392D373366663834393365386435'
 * This is hex-encoded ASCII, so we decode it
 */
function convertHexToUUID(hexValue) {
  // Remove the X'' wrapper
  const hex = hexValue.replace(/^X'|'$/g, '');
  
  // Convert hex pairs to ASCII characters
  let uuid = '';
  for (let i = 0; i < hex.length; i += 2) {
    const hexPair = hex.substring(i, i + 2);
    uuid += String.fromCharCode(parseInt(hexPair, 16));
  }
  
  return uuid;
}

/**
 * Parse individual values from a row, handling quotes and special characters
 */
function parseValues(valuesString) {
  const values = [];
  let current = '';
  let inString = false;
  let stringChar = '';
  let i = 0;
  
  while (i < valuesString.length) {
    const char = valuesString[i];
    const nextChar = valuesString[i + 1];
    
    if (!inString) {
      if (char === "'" || char === '"') {
        inString = true;
        stringChar = char;
        current += char;
      } else if (char === 'X' && nextChar === "'") {
        // Handle hex values - find the closing quote
        let hexEnd = i + 2;
        while (hexEnd < valuesString.length && valuesString[hexEnd] !== "'") {
          hexEnd++;
        }
        current = valuesString.substring(i, hexEnd + 1);
        i = hexEnd;
      } else if (char === ',') {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    } else {
      current += char;
      if (char === stringChar) {
        // Check if it's an escaped quote
        if (nextChar === stringChar) {
          current += nextChar;
          i++;
        } else {
          inString = false;
          stringChar = '';
        }
      } else if (char === '\\' && nextChar) {
        // Handle escaped characters
        current += nextChar;
        i++;
      }
    }
    
    i++;
  }
  
  if (current) {
    values.push(current.trim());
  }
  
  return values;
}

/**
 * Extract complete INSERT statement for a table, respecting quotes and nested structures
 */
function extractInsertStatement(sqlContent, tableName) {
  // Find the start of the INSERT statement
  const startPattern = `INSERT INTO \`${tableName}\``;
  const startIndex = sqlContent.indexOf(startPattern);
  
  if (startIndex === -1) return null;
  
  // State machine to find the ending semicolon
  let i = startIndex;
  let inString = false;
  let stringChar = '';
  let depth = 0;
  
  while (i < sqlContent.length) {
    const char = sqlContent[i];
    const prevChar = i > 0 ? sqlContent[i - 1] : '';
    
    // Handle escape sequences
    if (prevChar === '\\') {
      i++;
      continue;
    }
    
    // Track string state
    if ((char === "'" || char === '"') && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
    }
    
    if (!inString) {
      // Track parentheses depth
      if (char === '(') depth++;
      else if (char === ')') depth--;
      
      // Found the ending semicolon
      if (char === ';' && depth === 0 && i > startIndex + startPattern.length) {
        return sqlContent.substring(startIndex, i + 1);
      }
    }
    
    i++;
  }
  
  return null;
}

/**
 * Parse and extract table data from SQL dump
 */
function extractTableData(sqlContent) {
  const tables = {
    SequelizeMeta: [],
    customers: [],
    lab_report_results: [],
    lab_reports: [],
    locations: [],
    materials: [],
    password_reset_tokens: [],
    project_drawings: [],
    project_technicians: [],
    projects: [],
    report_templates: [],
    reports: [],
    users: []
  };

  // Extract INSERT statements for each table
  Object.keys(tables).forEach(tableName => {
    // Use state-machine parser to extract complete INSERT statement
    const insertStatement = extractInsertStatement(sqlContent, tableName);
    
    if (!insertStatement) return;
    
    // Extract column names
    const columnsMatch = insertStatement.match(/\(`[^)]+`\)\s+VALUES/);
    if (!columnsMatch) return;
    
    const columnsPart = columnsMatch[0];
    const columns = columnsPart.match(/`([^`]+)`/g).map(c => c.replace(/`/g, ''));
    
    // Extract VALUES section
    const valuesIndex = insertStatement.indexOf('VALUES');
    if (valuesIndex === -1) return;
    
    const valuesSection = insertStatement.substring(valuesIndex + 6).trim();
    
    // Parse all value rows
    let inString = false;
    let stringChar = '';
    let parenDepth = 0;
    let currentRecord = '';
    let recordCount = 0;
    
    for (let i = 0; i < valuesSection.length; i++) {
      const char = valuesSection[i];
      const nextChar = valuesSection[i + 1];
      const prevChar = i > 0 ? valuesSection[i - 1] : '';
      
      if (!inString) {
        if ((char === "'" || char === '"') && prevChar !== '\\') {
          inString = true;
          stringChar = char;
          currentRecord += char;
        } else if (char === '(') {
          if (parenDepth === 0) {
            // Starting a new record
            currentRecord = '(';
          } else {
            currentRecord += char;
          }
          parenDepth++;
        } else if (char === ')') {
          parenDepth--;
          currentRecord += char;
          
          if (parenDepth === 0 && currentRecord.startsWith('(')) {
            // Complete record found
            recordCount++;
            const rawValues = currentRecord.slice(1, -1); // Remove outer parens
            const values = parseValues(rawValues);
            
            if (values.length === columns.length) {
              const record = {};
              columns.forEach((col, idx) => {
                let value = values[idx];
                
                // Convert hex UUIDs
                if (value && value.startsWith("X'")) {
                  value = convertHexToUUID(value);
                }
                
                // Convert boolean values
                if (value === '0') value = false;
                if (value === '1') value = true;
                
                // Handle NULL
                if (value === 'NULL' || value === null) value = null;
                
                // Remove quotes from strings
                if (typeof value === 'string' && value.startsWith("'") && value.endsWith("'")) {
                  value = value.slice(1, -1)
                    .replace(/''/g, "'")
                    .replace(/\\'/g, "'")
                    .replace(/\\"/g, '"')
                    .replace(/\\\\/g, '\\');
                }
                
                record[col] = value;
              });
              
              tables[tableName].push(record);
            }
            
            currentRecord = '';
          }
        } else if (parenDepth > 0) {
          // Inside a record
          currentRecord += char;
        }
        // Skip commas and whitespace between records when parenDepth is 0
      } else {
        // Inside a string
        currentRecord += char;
        
        if (char === stringChar && prevChar !== '\\') {
          // Check if it's an escaped quote (double quotes)
          if (nextChar === stringChar) {
            currentRecord += nextChar;
            i++; // Skip the next quote
          } else {
            inString = false;
            stringChar = '';
          }
        } else if (char === '\\' && nextChar) {
          // Handle escape sequences
          currentRecord += nextChar;
          i++;
        }
      }
    }
    
    logger.info(`Extracted ${tables[tableName].length} ${tableName} records`);
  });
  
  return tables;
}

async function importData() {
  try {
    logger.info('Starting MySQL to PostgreSQL import (Fixed Parser)...');
    
    // Read the SQL dump file
    const sqlPath = path.join(__dirname, '../../../../attached_assets/safetech_14-11.sql');
    
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`SQL dump file not found at ${sqlPath}`);
    }
    
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    logger.info('SQL dump file loaded successfully');
    
    logger.info('Parsing MySQL dump...');
    const tableData = extractTableData(sqlContent);
    
    // Log summary of extracted data
    logger.info('Data extraction summary:');
    Object.keys(tableData).forEach(table => {
      if (tableData[table].length > 0) {
        logger.info(`  ${table}: ${tableData[table].length} records`);
      }
    });
    
    // Validate critical data
    if (tableData.customers.length === 0) {
      throw new Error('No customer records found in dump!');
    }
    
    // Start transaction
    const transaction = await sequelize.transaction();
    
    try {
      // Disable foreign key checks temporarily
      await sequelize.query('SET CONSTRAINTS ALL DEFERRED', { transaction });
      
      // Clear existing data (in order to avoid foreign key issues)
      logger.info('Clearing existing data...');
      const tablesToClear = [
        'lab_report_results',
        'project_drawings',
        'project_technicians',
        'reports',
        'projects',
        'lab_reports',
        'locations',
        'password_reset_tokens',
        'users',
        'customers',
        'materials',
        'report_templates',
        'SequelizeMeta'
      ];
      
      for (const table of tablesToClear) {
        await sequelize.query(`TRUNCATE TABLE "${table}" CASCADE`, { transaction });
      }
      
      // Import SequelizeMeta
      if (tableData.SequelizeMeta.length > 0) {
        logger.info(`Importing ${tableData.SequelizeMeta.length} SequelizeMeta records...`);
        for (const record of tableData.SequelizeMeta) {
          await sequelize.query(`INSERT INTO "SequelizeMeta" ("name") VALUES (:name)`, {
            replacements: { name: record.name },
            transaction
          });
        }
      }
      
      // Import customers
      if (tableData.customers.length > 0) {
        logger.info(`Importing ${tableData.customers.length} customers...`);
        for (const customer of tableData.customers) {
          await sequelize.query(`INSERT INTO "customers" (
              "id", "first_name", "last_name", "email", "phone",
              "address_line_1", "address_line_2", "city", "province", "postal_code",
              "status", "created_at", "updated_at", "deleted_at", "company_name"
            ) VALUES (
              :id, :first_name, :last_name, :email, :phone,
              :address_line_1, :address_line_2, :city, :province, :postal_code,
              :status, :created_at, :updated_at, :deleted_at, :company_name
            )`, {
            replacements: customer,
            transaction
          });
        }
      }
      
      // Import users - first pass (with NULL created_by)
      if (tableData.users.length > 0) {
        logger.info(`Importing ${tableData.users.length} users (first pass)...`);
        for (const user of tableData.users) {
          // Map MySQL columns to PostgreSQL columns
          const userRecord = {
            id: user.id,
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            profile_picture: user.profile_picture || null,
            technician_signature: user.technician_signature || null,
            role: user.role || 'Technician',
            email: user.email,
            phone: user.phone || null,
            status: user.status || 'active',
            activation_token: user.activation_token || null,
            activation_token_expires: user.activation_token_expires || null,
            last_login: user.last_login || null,
            is_verified: user.is_verified === 1 || user.is_verified === true,
            deactivated_user: user.deactivated_user === 1 || user.deactivated_user === true,
            password: user.password || '',
            created_at: user.created_at,
            updated_at: user.updated_at,
            deleted_at: user.deleted_at,
            created_by: null // Will be updated in second pass
          };
          
          await sequelize.query(`INSERT INTO "users" (
              "id", "first_name", "last_name", "profile_picture", "technician_signature",
              "role", "email", "phone", "status", "activation_token",
              "activation_token_expires", "last_login", "is_verified", "deactivated_user",
              "password", "created_at", "updated_at", "deleted_at", "created_by"
            ) VALUES (
              :id, :first_name, :last_name, :profile_picture, :technician_signature,
              :role, :email, :phone, :status, :activation_token,
              :activation_token_expires, :last_login, :is_verified, :deactivated_user,
              :password, :created_at, :updated_at, :deleted_at, :created_by
            )`, {
            replacements: userRecord,
            transaction
          });
        }
        
        // Second pass - update created_by references
        logger.info('Updating user created_by references...');
        for (const user of tableData.users) {
          if (user.created_by) {
            await sequelize.query(`UPDATE "users" SET "created_by" = :created_by WHERE "id" = :id`, {
              replacements: { id: user.id, created_by: user.created_by },
              transaction
            });
          }
        }
      }
      
      // Import materials (after users since it has created_by FK)
      if (tableData.materials.length > 0) {
        logger.info(`Importing ${tableData.materials.length} materials...`);
        
        // Get a default user for created_by if missing
        const [defaultUser] = await sequelize.query(
          `SELECT id FROM "users" WHERE deleted_at IS NULL LIMIT 1`,
          { transaction }
        );
        const defaultUserId = defaultUser[0]?.id;
        
        for (const material of tableData.materials) {
          // Ensure created_by is valid
          if (!material.created_by) {
            material.created_by = defaultUserId;
          }
          
          // Check if the created_by user exists
          const [userExists] = await sequelize.query(
            `SELECT 1 FROM "users" WHERE id = :id`,
            { replacements: { id: material.created_by }, transaction }
          );
          
          if (!userExists.length && defaultUserId) {
            material.created_by = defaultUserId;
          }
          
          // Fix empty type values - default to 'custom'
          if (!material.type || material.type === '') {
            material.type = 'custom';
          }
          
          await sequelize.query(`INSERT INTO "materials" (
              "id", "name", "type", "created_by", 
              "created_at", "updated_at", "is_active"
            ) VALUES (
              :id, :name, :type, :created_by,
              :created_at, :updated_at, :is_active
            )`, {
            replacements: material,
            transaction
          });
        }
      }
      
      // Import locations
      if (tableData.locations.length > 0) {
        logger.info(`Importing ${tableData.locations.length} locations...`);
        for (const location of tableData.locations) {
          await sequelize.query(`INSERT INTO "locations" (
              "id", "name", "address_line_1", "address_line_2",
              "city", "province", "postal_code", "customer_id", "active",
              "created_at", "updated_at", "deleted_at"
            ) VALUES (
              :id, :name, :address_line_1, :address_line_2,
              :city, :province, :postal_code, :customer_id, :active,
              :created_at, :updated_at, :deleted_at
            )`, {
            replacements: location,
            transaction
          });
        }
      }
      
      // Import report templates
      if (tableData.report_templates.length > 0) {
        logger.info(`Importing ${tableData.report_templates.length} report templates...`);
        for (const template of tableData.report_templates) {
          // Map MySQL schema field to PostgreSQL schema field
          const templateRecord = {
            id: template.id,
            name: template.name || 'Unnamed Template',
            schema: template.schema || template.config || '{}',
            status: template.status || 'active',
            created_at: template.created_at,
            updated_at: template.updated_at
          };
          
          // Parse JSON if it's a string
          if (typeof templateRecord.schema === 'string') {
            try {
              // Validate it's JSON
              JSON.parse(templateRecord.schema);
            } catch (e) {
              logger.warn(`Invalid JSON in template ${template.id}, using empty object`);
              templateRecord.schema = '{}';
            }
          } else {
            templateRecord.schema = JSON.stringify(templateRecord.schema);
          }
          
          await sequelize.query(`INSERT INTO "report_templates" (
              "id", "name", "schema", "status",
              "created_at", "updated_at"
            ) VALUES (
              :id, :name, :schema, :status,
              :created_at, :updated_at
            )`, {
            replacements: templateRecord,
            transaction
          });
        }
      }
      
      // Import projects
      if (tableData.projects.length > 0) {
        logger.info(`Importing ${tableData.projects.length} projects...`);
        
        // Get default user IDs for missing references
        const [adminUsers] = await sequelize.query(
          `SELECT id FROM "users" WHERE role = 'Admin' AND deleted_at IS NULL LIMIT 1`,
          { transaction }
        );
        const defaultUserId = adminUsers[0]?.id || tableData.users[0]?.id;
        
        // Get default template if available
        const [templates] = await sequelize.query(
          `SELECT id FROM "report_templates" LIMIT 1`,
          { transaction }
        );
        const defaultTemplateId = templates[0]?.id;
        
        for (const project of tableData.projects) {
          // Validate foreign keys
          if (project.pm_id) {
            const [pmExists] = await sequelize.query(
              `SELECT 1 FROM "users" WHERE id = :id`,
              { replacements: { id: project.pm_id }, transaction }
            );
            if (!pmExists.length) {
              logger.warn(`PM ${project.pm_id} not found, using default`);
              project.pm_id = defaultUserId;
            }
          }
          
          if (project.technician_id) {
            const [techExists] = await sequelize.query(
              `SELECT 1 FROM "users" WHERE id = :id`,
              { replacements: { id: project.technician_id }, transaction }
            );
            if (!techExists.length) {
              logger.warn(`Technician ${project.technician_id} not found, using default`);
              project.technician_id = defaultUserId;
            }
          }
          
          // Validate report_template_id
          if (project.report_template_id) {
            const [templateExists] = await sequelize.query(
              `SELECT 1 FROM "report_templates" WHERE id = :id`,
              { replacements: { id: project.report_template_id }, transaction }
            );
            if (!templateExists.length) {
              logger.warn(`Template ${project.report_template_id} not found, using ${defaultTemplateId ? 'default' : 'NULL'}`);
              project.report_template_id = defaultTemplateId || null;
            }
          }
          
          // Validate location_id
          if (project.location_id) {
            const [locationExists] = await sequelize.query(
              `SELECT 1 FROM "locations" WHERE id = :id`,
              { replacements: { id: project.location_id }, transaction }
            );
            if (!locationExists.length) {
              logger.warn(`Location ${project.location_id} not found, setting to NULL`);
              project.location_id = null;
            }
          }
          
          // Validate customer_id
          if (project.customer_id) {
            const [customerExists] = await sequelize.query(
              `SELECT 1 FROM "customers" WHERE id = :id`,
              { replacements: { id: project.customer_id }, transaction }
            );
            if (!customerExists.length) {
              logger.warn(`Customer ${project.customer_id} not found, setting to NULL`);
              project.customer_id = null;
            }
          }
          
          await sequelize.query(`INSERT INTO "projects" (
              "id", "project_no", "name", "site_name", "site_contact_name",
              "site_contact_title", "project_type", "site_email", "status",
              "report_template_id", "location_id", "specific_location",
              "pm_id", "technician_id", "customer_id",
              "start_date", "end_date", "created_at", "updated_at", "deleted_at"
            ) VALUES (
              :id, :project_no, :name, :site_name, :site_contact_name,
              :site_contact_title, :project_type, :site_email, :status,
              :report_template_id, :location_id, :specific_location,
              :pm_id, :technician_id, :customer_id,
              :start_date, :end_date, :created_at, :updated_at, :deleted_at
            )`, {
            replacements: project,
            transaction
          });
        }
      }
      
      // Import project_technicians (junction table)
      if (tableData.project_technicians.length > 0) {
        logger.info(`Importing ${tableData.project_technicians.length} project_technicians...`);
        for (const pt of tableData.project_technicians) {
          // Validate project exists
          const [projectExists] = await sequelize.query(
            `SELECT 1 FROM "projects" WHERE id = :id`,
            { replacements: { id: pt.project_id }, transaction }
          );
          if (!projectExists.length) {
            logger.warn(`Project ${pt.project_id} not found, skipping project_technician`);
            continue;
          }
          
          // Validate user exists
          const [userExists] = await sequelize.query(
            `SELECT 1 FROM "users" WHERE id = :id`,
            { replacements: { id: pt.user_id }, transaction }
          );
          if (!userExists.length) {
            logger.warn(`User ${pt.user_id} not found, skipping project_technician`);
            continue;
          }
          
          await sequelize.query(`INSERT INTO "project_technicians" (
              "project_id", "user_id", "created_at", "updated_at"
            ) VALUES (
              :project_id, :user_id, :created_at, :updated_at
            )`, {
            replacements: pt,
            transaction
          });
        }
      }
      
      // Import project_drawings
      if (tableData.project_drawings.length > 0) {
        logger.info(`Importing ${tableData.project_drawings.length} project_drawings...`);
        for (const drawing of tableData.project_drawings) {
          // Validate project exists
          const [projectExists] = await sequelize.query(
            `SELECT 1 FROM "projects" WHERE id = :id`,
            { replacements: { id: drawing.project_id }, transaction }
          );
          if (!projectExists.length) {
            logger.warn(`Project ${drawing.project_id} not found, skipping drawing`);
            continue;
          }
          
          // Validate created_by user exists if present
          if (drawing.created_by) {
            const [userExists] = await sequelize.query(
              `SELECT 1 FROM "users" WHERE id = :id`,
              { replacements: { id: drawing.created_by }, transaction }
            );
            if (!userExists.length) {
              logger.warn(`User ${drawing.created_by} not found, setting created_by to NULL`);
              drawing.created_by = null;
            }
          }
          
          await sequelize.query(`INSERT INTO "project_drawings" (
              "id", "project_id", "file_name", "file_url", "is_marked",
              "created_by", "created_at", "updated_at", "deleted_at"
            ) VALUES (
              :id, :project_id, :file_name, :file_url, :is_marked,
              :created_by, :created_at, :updated_at, :deleted_at
            )`, {
            replacements: drawing,
            transaction
          });
        }
      }
      
      // Import reports
      if (tableData.reports.length > 0) {
        logger.info(`Importing ${tableData.reports.length} reports...`);
        for (const report of tableData.reports) {
          // Validate project exists
          const [projectExists] = await sequelize.query(
            `SELECT 1 FROM "projects" WHERE id = :id`,
            { replacements: { id: report.project_id }, transaction }
          );
          if (!projectExists.length) {
            logger.warn(`Project ${report.project_id} not found, skipping report ${report.id}`);
            continue;
          }
          
          // Validate report_template exists
          const [templateExists] = await sequelize.query(
            `SELECT 1 FROM "report_templates" WHERE id = :id`,
            { replacements: { id: report.report_template_id }, transaction }
          );
          if (!templateExists.length) {
            logger.warn(`Report template ${report.report_template_id} not found, skipping report ${report.id}`);
            continue;
          }
          
          // Ensure JSON fields are properly formatted
          let answers = report.answers;
          let photos = report.photos;
          
          if (typeof answers === 'string') {
            try {
              JSON.parse(answers);
            } catch (e) {
              logger.warn(`Invalid JSON in report ${report.id} answers, using empty object`);
              answers = '{}';
            }
          } else if (answers) {
            answers = JSON.stringify(answers);
          }
          
          if (typeof photos === 'string') {
            try {
              JSON.parse(photos);
            } catch (e) {
              logger.warn(`Invalid JSON in report ${report.id} photos, using empty array`);
              photos = '[]';
            }
          } else if (photos) {
            photos = JSON.stringify(photos);
          }
          
          await sequelize.query(`INSERT INTO "reports" (
              "id", "name", "project_id", "report_template_id",
              "assessment_due_to", "date_of_loss", "date_of_assessment",
              "answers", "photos", "status", "pm_feedback",
              "created_at", "updated_at", "deleted_at"
            ) VALUES (
              :id, :name, :project_id, :report_template_id,
              :assessment_due_to, :date_of_loss, :date_of_assessment,
              :answers, :photos, :status, :pm_feedback,
              :created_at, :updated_at, :deleted_at
            )`, {
            replacements: {
              ...report,
              answers,
              photos
            },
            transaction
          });
        }
      }
      
      await transaction.commit();
      logger.info('✅ Import completed successfully!');
      
      // Show final counts
      const tables = ['customers', 'users', 'locations', 'materials', 'projects', 'project_technicians', 'project_drawings', 'reports'];
      for (const table of tables) {
        const [result] = await sequelize.query(`SELECT COUNT(*) as count FROM "${table}"`);
        logger.info(`  ${table}: ${result[0].count} records`);
      }
      
    } catch (error) {
      await transaction.rollback();
      logger.error('Import failed, transaction rolled back:', error);
      throw error;
    }
    
  } catch (error) {
    console.error(error);
    logger.error('Fatal error during import:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run import
importData();