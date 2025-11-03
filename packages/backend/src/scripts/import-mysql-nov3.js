#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { sequelize } = require('../models/index');
const logger = require('../config/logger');

/**
 * Convert MySQL hexadecimal UUID to PostgreSQL format
 * MySQL: X'30303833623233382D333639622D343733392D393564392D373366663834393365386435'
 * Needs to be converted to actual UUID string
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
 * Convert MySQL dump syntax to PostgreSQL
 */
function convertMySQLToPostgreSQL(sqlContent) {
  let converted = sqlContent;
  
  // Remove MySQL-specific comments and settings
  converted = converted.replace(/^#.*$/gm, '');
  converted = converted.replace(/^\/\*!.*\*\/;?$/gm, '');
  converted = converted.replace(/^SET .*$/gm, '');
  converted = converted.replace(/^LOCK TABLES.*$/gm, '');
  converted = converted.replace(/^UNLOCK TABLES.*$/gm, '');
  converted = converted.replace(/^DROP TABLE IF EXISTS.*$/gm, '');
  
  // Convert backticks to double quotes
  converted = converted.replace(/`/g, '"');
  
  // Convert MySQL UUID hex format to PostgreSQL
  converted = converted.replace(/X'([0-9A-F]+)'/gi, (match, hex) => {
    const uuid = convertHexToUUID(match);
    return `'${uuid}'`;
  });
  
  // Convert TINYINT(1) to BOOLEAN
  converted = converted.replace(/\btinyint\(1\)/gi, 'BOOLEAN');
  
  // Convert datetime to timestamp
  converted = converted.replace(/\bdatetime\b/gi, 'TIMESTAMP');
  
  // Convert MySQL booleans (0/1) to PostgreSQL (FALSE/TRUE)
  // Be careful to only convert when they're actual boolean values
  converted = converted.replace(/,\s*0\s*,/g, ', FALSE,');
  converted = converted.replace(/,\s*1\s*,/g, ', TRUE,');
  converted = converted.replace(/,\s*0\s*\)/g, ', FALSE)');
  converted = converted.replace(/,\s*1\s*\)/g, ', TRUE)');
  
  // Remove MySQL-specific table options
  converted = converted.replace(/ENGINE=.*$/gm, '');
  converted = converted.replace(/DEFAULT CHARSET=.*$/gm, '');
  converted = converted.replace(/COLLATE=.*$/gm, '');
  converted = converted.replace(/CHARACTER SET.*COLLATE.*?(?=\s|,|$)/gi, '');
  
  // Convert AUTO_INCREMENT to SERIAL
  converted = converted.replace(/AUTO_INCREMENT/gi, '');
  
  // Remove KEY definitions (PostgreSQL will handle indexes differently)
  converted = converted.replace(/^\s*KEY\s+.*$/gm, '');
  converted = converted.replace(/^\s*UNIQUE KEY\s+.*$/gm, '');
  
  // Fix DEFAULT values
  converted = converted.replace(/DEFAULT\s+\(uuid\(\)\)/gi, "DEFAULT gen_random_uuid()");
  converted = converted.replace(/DEFAULT CURRENT_TIMESTAMP/gi, 'DEFAULT CURRENT_TIMESTAMP');
  
  // Clean up any double commas from removed lines
  converted = converted.replace(/,\s*,/g, ',');
  converted = converted.replace(/,\s*\)/g, ')');
  
  // Remove trailing commas before closing parentheses
  converted = converted.replace(/,(\s*\))/g, '$1');
  
  return converted;
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
    // Find the INSERT INTO statement for this table
    const startPattern = new RegExp(`INSERT INTO \\\`${tableName}\\\``, 'gi');
    const startMatches = [...sqlContent.matchAll(startPattern)];
    
    if (startMatches.length > 0) {
      for (const startMatch of startMatches) {
        const startIndex = startMatch.index;
        
        // Find the end of this INSERT statement (next SQL statement or end of file)
        const afterInsert = sqlContent.substring(startIndex);
        const endMatch = afterInsert.match(/\n\n(?=\/\*|#|INSERT|DROP|LOCK|UNLOCK|CREATE|ALTER|$)/);
        const endIndex = endMatch ? endMatch.index : afterInsert.length;
        
        const insertStatement = afterInsert.substring(0, endIndex);
        
        // Extract column names
        const columnsMatch = insertStatement.match(/\(([\s\S]+?)\)\s+VALUES/);
        const columns = columnsMatch ? columnsMatch[1].replace(/`/g, '').split(',').map(c => c.trim()) : [];
        
        // Extract values section
        const valuesIndex = insertStatement.indexOf('VALUES');
        if (valuesIndex === -1) continue;
        
        const valuesSection = insertStatement.substring(valuesIndex + 6);
        
        // Parse individual value rows using a simpler approach
        let currentRow = '';
        let inString = false;
        let stringChar = '';
        let parenDepth = 0;
        
        for (let i = 0; i < valuesSection.length; i++) {
          const char = valuesSection[i];
          const nextChar = valuesSection[i + 1];
          
          if (!inString) {
            if (char === "'" || char === '"') {
              inString = true;
              stringChar = char;
              currentRow += char;
            } else if (char === '(') {
              parenDepth++;
              currentRow += char;
            } else if (char === ')') {
              parenDepth--;
              currentRow += char;
              
              // If we've closed all parens, we have a complete row
              if (parenDepth === 0 && currentRow.trim().startsWith('(')) {
                const rawValues = currentRow.slice(1, -1); // Remove outer parens
                const values = parseValues(rawValues);
                
                if (columns.length > 0 && values.length === columns.length) {
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
                      value = value.slice(1, -1).replace(/''/g, "'");
                    }
                    
                    record[col] = value;
                  });
                  
                  tables[tableName].push(record);
                }
                
                currentRow = '';
              }
            } else {
              currentRow += char;
            }
          } else {
            currentRow += char;
            if (char === stringChar) {
              // Check if it's an escaped quote
              if (nextChar === stringChar) {
                currentRow += nextChar;
                i++;
              } else {
                inString = false;
                stringChar = '';
              }
            } else if (char === '\\' && nextChar) {
              // Handle escaped characters
              currentRow += nextChar;
              i++;
            }
          }
        }
      }
    }
  });
  
  return tables;
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
        // Handle hex values
        let hexEnd = valuesString.indexOf("'", i + 2);
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
      }
    }
    
    i++;
  }
  
  if (current) {
    values.push(current.trim());
  }
  
  return values;
}

async function importData() {
  try {
    logger.info('Starting MySQL to PostgreSQL import (Nov 3 dump)...');
    
    // Read the SQL dump file
    const sqlPath = path.join(__dirname, '../../../../attached_assets/safetech_2025-11-02_1762135932425.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    logger.info('Parsing MySQL dump...');
    const tableData = extractTableData(sqlContent);
    
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
          await sequelize.query(
            `INSERT INTO "SequelizeMeta" ("name") VALUES (:name)`,
            { replacements: record, transaction }
          );
        }
      }
      
      // Import customers
      if (tableData.customers.length > 0) {
        logger.info(`Importing ${tableData.customers.length} customers...`);
        for (const record of tableData.customers) {
          await sequelize.query(
            `INSERT INTO "customers" (
              "id", "first_name", "last_name", "email", "phone",
              "address_line_1", "address_line_2", "city", "province", "postal_code",
              "status", "created_at", "updated_at", "deleted_at", "company_name"
            ) VALUES (
              :id, :first_name, :last_name, :email, :phone,
              :address_line_1, :address_line_2, :city, :province, :postal_code,
              :status, :created_at, :updated_at, :deleted_at, :company_name
            )`,
            { replacements: record, transaction }
          );
        }
      }
      
      // Import locations
      if (tableData.locations.length > 0) {
        logger.info(`Importing ${tableData.locations.length} locations...`);
        for (const record of tableData.locations) {
          await sequelize.query(
            `INSERT INTO "locations" (
              "id", "name", "address_line_1", "address_line_2",
              "city", "province", "postal_code", "customer_id", "active",
              "created_at", "updated_at", "deleted_at"
            ) VALUES (
              :id, :name, :address_line_1, :address_line_2,
              :city, :province, :postal_code, :customer_id, :active,
              :created_at, :updated_at, :deleted_at
            )`,
            { replacements: record, transaction }
          );
        }
      }
      
      // Import users in two passes due to self-referential created_by
      if (tableData.users.length > 0) {
        logger.info(`Importing ${tableData.users.length} users (two-pass for created_by)...`);
        
        // First pass: Insert all users with created_by = NULL
        const userCreatorMap = new Map();
        for (const record of tableData.users) {
          // Store the original created_by for later update
          if (record.created_by) {
            userCreatorMap.set(record.id, record.created_by);
          }
          
          // Map status from MySQL enum to PostgreSQL enum
          const userStatus = record.status || 'invited';
          
          const userRecord = {
            id: record.id,
            first_name: record.first_name,
            last_name: record.last_name,
            profile_picture: record.profile_picture,
            role: record.role,
            email: record.email,
            phone: record.phone,
            last_login: record.last_login,
            is_verified: record.is_verified !== undefined ? record.is_verified : false,
            deactivated_user: record.deactivated_user !== undefined ? record.deactivated_user : false,
            password: record.password,
            created_by: null, // Always NULL in first pass
            status: userStatus,
            activation_token: record.activation_token || null,
            activation_token_expires: record.activation_token_expires || null,
            technician_signature: record.technician_signature || null,
            created_at: record.created_at,
            updated_at: record.updated_at,
            deleted_at: record.deleted_at
          };
          
          await sequelize.query(
            `INSERT INTO "users" (
              "id", "first_name", "last_name", "profile_picture", "role", "email", "phone",
              "last_login", "is_verified", "deactivated_user", "password", 
              "created_by", "status", "activation_token", "activation_token_expires",
              "technician_signature", "created_at", "updated_at", "deleted_at"
            ) VALUES (
              :id, :first_name, :last_name, :profile_picture, :role, :email, :phone,
              :last_login, :is_verified, :deactivated_user, :password,
              :created_by, :status, :activation_token, :activation_token_expires,
              :technician_signature, :created_at, :updated_at, :deleted_at
            )`,
            { replacements: userRecord, transaction }
          );
        }
        
        // Second pass: Update created_by references
        if (userCreatorMap.size > 0) {
          logger.info(`  Updating ${userCreatorMap.size} user created_by references...`);
          for (const [userId, creatorId] of userCreatorMap.entries()) {
            await sequelize.query(
              `UPDATE "users" SET "created_by" = :creatorId WHERE "id" = :userId`,
              { replacements: { userId, creatorId }, transaction }
            );
          }
        }
      }
      
      // Import materials (after users since they reference users via created_by)
      if (tableData.materials.length > 0) {
        logger.info(`Importing ${tableData.materials.length} materials...`);
        for (const record of tableData.materials) {
          // Handle empty enum values - default to 'standard' if empty
          let materialType = record.type;
          if (!materialType || materialType === '') {
            materialType = 'standard';
            logger.info(`  Material ${record.name} has empty type, defaulting to 'standard'`);
          }
          
          // Materials table in new dump has additional fields
          const materialRecord = {
            id: record.id,
            name: record.name,
            type: materialType,
            created_by: record.created_by || null, // This should work now that users are imported
            is_active: record.is_active !== undefined ? record.is_active : true,
            created_at: record.created_at,
            updated_at: record.updated_at
          };
          
          await sequelize.query(
            `INSERT INTO "materials" (
              "id", "name", "type", "created_by", "is_active", 
              "created_at", "updated_at"
            ) VALUES (
              :id, :name, :type, :created_by, :is_active,
              :created_at, :updated_at
            )`,
            { replacements: materialRecord, transaction }
          );
        }
      }
      
      // Import report_templates
      if (tableData.report_templates.length > 0) {
        logger.info(`Importing ${tableData.report_templates.length} report templates...`);
        for (const record of tableData.report_templates) {
          // Handle JSON schema field - fix escaped quotes and validate JSON
          let schema = record.schema || '{}';
          
          // If it's a string, try to clean it
          if (typeof schema === 'string') {
            // Replace escaped quotes that might have been double-escaped
            schema = schema.replace(/\\"/g, '"');
            schema = schema.replace(/\\\\/g, '\\');
            
            // Try to parse and re-stringify to ensure valid JSON
            try {
              const parsed = JSON.parse(schema);
              schema = JSON.stringify(parsed);
            } catch (e) {
              logger.warn(`  Report template ${record.name} has invalid JSON schema, using empty object`);
              schema = '{}';
            }
          } else {
            schema = JSON.stringify(schema);
          }
          
          await sequelize.query(
            `INSERT INTO "report_templates" (
              "id", "name", "schema", "created_at", "updated_at", "status"
            ) VALUES (
              :id, :name, :schema::json, :created_at, :updated_at, :status
            )`,
            { 
              replacements: {
                ...record,
                schema: schema
              },
              transaction 
            }
          );
        }
      }
      
      // Import projects
      if (tableData.projects.length > 0) {
        logger.info(`Importing ${tableData.projects.length} projects...`);
        
        // Get list of valid user IDs for validation
        const [userIds] = await sequelize.query(
          `SELECT id, role FROM "users" WHERE deleted_at IS NULL`,
          { transaction }
        );
        const validUserIds = new Set(userIds.map(u => u.id));
        
        // Find default PM and Technician for missing references
        const defaultPm = userIds.find(u => u.role === 'Project Manager') || userIds[0];
        const defaultTech = userIds.find(u => u.role === 'Technician') || userIds[0];
        
        if (!defaultPm || !defaultTech) {
          throw new Error('No users available to use as default PM/Technician');
        }
        
        logger.info(`  Using default PM: ${defaultPm.id}, default Tech: ${defaultTech.id} for missing references`);
        
        // Get list of valid location IDs
        const [locationIds] = await sequelize.query(
          `SELECT id FROM "locations"`,
          { transaction }
        );
        const validLocationIds = new Set(locationIds.map(l => l.id));
        
        for (const record of tableData.projects) {
          // Validate foreign keys and use defaults if invalid (pm_id and technician_id cannot be NULL)
          const projectRecord = {
            ...record,
            pm_id: record.pm_id && validUserIds.has(record.pm_id) ? record.pm_id : defaultPm.id,
            technician_id: record.technician_id && validUserIds.has(record.technician_id) ? record.technician_id : defaultTech.id,
            location_id: record.location_id && validLocationIds.has(record.location_id) ? record.location_id : null
          };
          
          if (record.pm_id && !validUserIds.has(record.pm_id)) {
            logger.warn(`  Project ${record.name}: pm_id ${record.pm_id} not found in users, using default ${defaultPm.id}`);
          }
          if (record.technician_id && !validUserIds.has(record.technician_id)) {
            logger.warn(`  Project ${record.name}: technician_id ${record.technician_id} not found in users, using default ${defaultTech.id}`);
          }
          if (record.location_id && !validLocationIds.has(record.location_id)) {
            logger.warn(`  Project ${record.name}: location_id ${record.location_id} not found in locations, setting to NULL`);
          }
          
          await sequelize.query(
            `INSERT INTO "projects" (
              "id", "project_no", "name", "site_name", "site_contact_name",
              "site_contact_title", "project_type", "site_email", "status",
              "report_template_id", "location_id", "specific_location",
              "pm_id", "technician_id", "customer_id", "start_date", "end_date",
              "created_at", "updated_at", "deleted_at"
            ) VALUES (
              :id, :project_no, :name, :site_name, :site_contact_name,
              :site_contact_title, :project_type, :site_email, :status,
              :report_template_id, :location_id, :specific_location,
              :pm_id, :technician_id, :customer_id, :start_date, :end_date,
              :created_at, :updated_at, :deleted_at
            )`,
            { replacements: projectRecord, transaction }
          );
        }
      }
      
      // Import lab_reports
      if (tableData.lab_reports.length > 0) {
        logger.info(`Importing ${tableData.lab_reports.length} lab reports...`);
        for (const record of tableData.lab_reports) {
          await sequelize.query(
            `INSERT INTO "lab_reports" (
              "id", "project_id", "lab_name", "sample_id", "sample_date",
              "analysis_date", "created_at", "updated_at", "deleted_at"
            ) VALUES (
              :id, :project_id, :lab_name, :sample_id, :sample_date,
              :analysis_date, :created_at, :updated_at, :deleted_at
            )`,
            { replacements: record, transaction }
          );
        }
      }
      
      // Import lab_report_results
      if (tableData.lab_report_results.length > 0) {
        logger.info(`Importing ${tableData.lab_report_results.length} lab report results...`);
        for (const record of tableData.lab_report_results) {
          await sequelize.query(
            `INSERT INTO "lab_report_results" (
              "id", "lab_report_id", "parameter", "units", "mrl", "value",
              "created_at", "updated_at", "deleted_at"
            ) VALUES (
              :id, :lab_report_id, :parameter, :units, :mrl, :value,
              :created_at, :updated_at, :deleted_at
            )`,
            { replacements: record, transaction }
          );
        }
      }
      
      // Import reports
      if (tableData.reports.length > 0) {
        logger.info(`Importing ${tableData.reports.length} reports...`);
        for (const record of tableData.reports) {
          // Handle JSON fields
          const answers = record.answers ? 
            (typeof record.answers === 'string' ? record.answers : JSON.stringify(record.answers)) :
            '{}';
          const photos = record.photos ? 
            (typeof record.photos === 'string' ? record.photos : JSON.stringify(record.photos)) :
            '[]';
          const pmFeedback = record.pm_feedback ? 
            (typeof record.pm_feedback === 'string' ? record.pm_feedback : JSON.stringify(record.pm_feedback)) :
            null;
          
          await sequelize.query(
            `INSERT INTO "reports" (
              "id", "name", "project_id", "report_template_id",
              "assessment_due_to", "answers", "photos", "status",
              "pm_feedback", "created_at", "updated_at", "deleted_at"
            ) VALUES (
              :id, :name, :project_id, :report_template_id,
              :assessment_due_to, :answers::json, :photos::json, :status,
              :pm_feedback::json, :created_at, :updated_at, :deleted_at
            )`,
            { 
              replacements: {
                ...record,
                answers: answers,
                photos: photos,
                pm_feedback: pmFeedback
              },
              transaction 
            }
          );
        }
      }
      
      // Import project_technicians
      if (tableData.project_technicians.length > 0) {
        logger.info(`Importing ${tableData.project_technicians.length} project technicians...`);
        for (const record of tableData.project_technicians) {
          await sequelize.query(
            `INSERT INTO "project_technicians" (
              "project_id", "user_id", "created_at", "updated_at", "deleted_at"
            ) VALUES (
              :project_id, :user_id, :created_at, :updated_at, :deleted_at
            )`,
            { replacements: record, transaction }
          );
        }
      }
      
      // Import project_drawings
      if (tableData.project_drawings.length > 0) {
        logger.info(`Importing ${tableData.project_drawings.length} project drawings...`);
        for (const record of tableData.project_drawings) {
          await sequelize.query(
            `INSERT INTO "project_drawings" (
              "id", "project_id", "name", "url", "type",
              "created_at", "updated_at", "deleted_at"
            ) VALUES (
              :id, :project_id, :name, :url, :type,
              :created_at, :updated_at, :deleted_at
            )`,
            { replacements: record, transaction }
          );
        }
      }
      
      // Import password_reset_tokens
      if (tableData.password_reset_tokens.length > 0) {
        logger.info(`Importing ${tableData.password_reset_tokens.length} password reset tokens...`);
        for (const record of tableData.password_reset_tokens) {
          await sequelize.query(
            `INSERT INTO "password_reset_tokens" (
              "id", "user_id", "token", "expires_at", "is_used",
              "created_at", "updated_at", "deleted_at"
            ) VALUES (
              :id, :user_id, :token, :expires_at, :is_used,
              :created_at, :updated_at, :deleted_at
            )`,
            { replacements: record, transaction }
          );
        }
      }
      
      // Commit transaction
      await transaction.commit();
      
      // Get final counts
      const counts = {};
      for (const table of Object.keys(tableData)) {
        const [result] = await sequelize.query(`SELECT COUNT(*) as count FROM "${table}"`);
        counts[table] = result[0].count;
      }
      
      logger.info('\n✅ Import completed successfully!');
      logger.info('\nImported records:');
      Object.entries(counts).forEach(([table, count]) => {
        logger.info(`  ${table}: ${count} records`);
      });
      
      // Calculate total
      const total = Object.values(counts).reduce((sum, count) => sum + parseInt(count), 0);
      logger.info(`\n🎉 Total: ${total} records imported successfully!`);
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    
    process.exit(0);
    
  } catch (error) {
    logger.error('Import failed:', error);
    logger.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the import
importData();