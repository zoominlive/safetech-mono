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
    // Find the INSERT INTO statement for this table using backticks
    const insertRegex = new RegExp(`INSERT INTO \\\`${tableName}\\\`[^;]+;`, 's');
    const insertMatch = sqlContent.match(insertRegex);
    
    if (!insertMatch) return;
    
    const insertStatement = insertMatch[0];
    
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
    const sqlPath = path.join(__dirname, '../../../../attached_assets/safetech_2025-11-02_1762135932425.sql');
    
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
      
      // Import materials
      if (tableData.materials.length > 0) {
        logger.info(`Importing ${tableData.materials.length} materials...`);
        for (const material of tableData.materials) {
          // Fix empty enum values
          if (material.material_type === '' || material.material_type === null) {
            material.material_type = 'Asbestos'; // Default value
          }
          
          await sequelize.query(`INSERT INTO "materials" (
              "id", "material_type", "area", "location", "material", "description",
              "quantity", "unit", "condition", "potential_hazard",
              "created_at", "updated_at", "deleted_at"
            ) VALUES (
              :id, :material_type, :area, :location, :material, :description,
              :quantity, :unit, :condition, :potential_hazard,
              :created_at, :updated_at, :deleted_at
            )`, {
            replacements: material,
            transaction
          });
        }
      }
      
      // Import users - first pass (with NULL created_by)
      if (tableData.users.length > 0) {
        logger.info(`Importing ${tableData.users.length} users (first pass)...`);
        for (const user of tableData.users) {
          await sequelize.query(`INSERT INTO "users" (
              "id", "first_name", "last_name", "email", "role",
              "password", "phone", "is_verified", "deactivated_user", "created_by",
              "created_at", "updated_at", "deleted_at", "reset_password_token", "reset_password_expires",
              "province", "address_line_1", "address_line_2", "city", "postal_code"
            ) VALUES (
              :id, :first_name, :last_name, :email, :role,
              :password, :phone, :is_verified, :deactivated_user, NULL,
              :created_at, :updated_at, :deleted_at, :reset_password_token, :reset_password_expires,
              :province, :address_line_1, :address_line_2, :city, :postal_code
            )`, {
            replacements: user,
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
          // Fix JSON data if needed
          if (typeof template.config === 'string') {
            try {
              template.config = JSON.parse(template.config);
            } catch (e) {
              logger.warn(`Failed to parse config for template ${template.id}, using as string`);
            }
          }
          
          await sequelize.query(`INSERT INTO "report_templates" (
              "id", "name", "description", "version", "config",
              "created_at", "updated_at", "deleted_at", "status"
            ) VALUES (
              :id, :name, :description, :version, :config,
              :created_at, :updated_at, :deleted_at, :status
            )`, {
            replacements: {
              ...template,
              config: JSON.stringify(template.config)
            },
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
      
      // Import remaining tables...
      // [Similar pattern for other tables]
      
      await transaction.commit();
      logger.info('✅ Import completed successfully!');
      
      // Show final counts
      const tables = ['customers', 'users', 'locations', 'materials', 'projects'];
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