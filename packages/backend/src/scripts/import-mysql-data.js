const fs = require('fs');
const path = require('path');
const { sequelize } = require('../models/index');
const logger = require('../config/logger');

/**
 * Convert MySQL INSERT statement to PostgreSQL format
 */
function convertMySQLToPostgres(line) {
  // Remove backticks
  let converted = line.replace(/`/g, '"');
  
  // Fix JSON escaping: MySQL dumps JSON columns as escaped strings
  // Pattern: '"{...}"' needs to become '{...}'
  // Step 1: Remove the extra layer of double quotes around JSON objects FIRST
  // This handles: , '"{...}"', or ( '"{...}"',  or , '"{...}")
  converted = converted.replace(/'"\{/g, "'{");  // Remove leading "{ -> {
  converted = converted.replace(/\}"/g, "}");     // Remove trailing }" -> }
  
  // Step 2: NOW unescape the double quotes inside JSON
  converted = converted.replace(/\\"/g, '"');
  
  // Convert escaped single quotes from MySQL (\') to PostgreSQL ('')
  converted = converted.replace(/\\'/g, "''");
  
  // Convert boolean values - Need to cast integer values to boolean
  // Replace ALL standalone 0 and 1 that are likely booleans
  // Pattern: (comma or open paren) + optional whitespace + 0 or 1 + optional whitespace + (comma or close paren)
  
  // Keep replacing until no more matches (handles all booleans)
  let previousLength = 0;
  while (previousLength !== converted.length) {
    previousLength = converted.length;
    converted = converted.replace(/([,\(]\s*)(0|1)(\s*[,\)])/g, (match, before, value, after) => {
      const boolValue = value === '1' ? 'TRUE' : 'FALSE';
      return `${before}${boolValue}${after}`;
    });
  }
  
  return converted;
}

/**
 * Extract INSERT statements from MySQL dump for a specific table
 */
function extractInserts(sqlContent, tableName) {
  const lines = sqlContent.split('\n');
  const inserts = [];
  let collectingInserts = false;
  let currentInsert = '';
  
  for (let line of lines) {
    // Check if we're at the INSERT section for this table
    if (line.includes(`INSERT INTO \`${tableName}\``)) {
      collectingInserts = true;
      currentInsert = line;
      continue;
    }
    
    if (collectingInserts) {
      if (line.trim().endsWith(';')) {
        currentInsert += '\n' + line;
        inserts.push(currentInsert);
        collectingInserts = false;
        currentInsert = '';
      } else if (line.trim()) {
        currentInsert += '\n' + line;
      } else {
        // Empty line might indicate end of inserts
        collectingInserts = false;
      }
    }
  }
  
  return inserts;
}

/**
 * Import data in order respecting foreign keys
 */
async function importData() {
  try {
    logger.info('Starting MySQL to PostgreSQL data import...');
    
    // Read the SQL dump file
    const sqlPath = path.join(__dirname, '../../../../attached_assets/safetech_1759205327295.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Define import order (tables with dependencies come after their parents)
    // Skip tables with complex JSON for now
    const importOrder = [
      'customers',
      'users',           // users before locations because created_by FK
      'locations',
      // 'report_templates',  // Has JSON, handle separately
      'projects',
      // 'reports',          // Has JSON, handle separately
      'materials',
      'lab_reports',
      'lab_report_results',
      'password_reset_tokens',
      'project_technicians',
      'project_drawings'
    ];
    
    const jsonTables = ['report_templates', 'reports'];
    
    // Clear existing data in reverse order to respect foreign keys
    logger.info('Clearing existing data...');
    for (const tableName of [...importOrder].reverse()) {
      await sequelize.query(`TRUNCATE TABLE "${tableName}" CASCADE`);
    }
    
    for (const tableName of importOrder) {
      logger.info(`Importing ${tableName}...`);
      
      // Extract INSERT statements for this table
      const inserts = extractInserts(sqlContent, tableName);
      
      if (inserts.length === 0) {
        logger.info(`No data found for ${tableName}`);
        continue;
      }
      
      logger.info(`Found ${inserts.length} INSERT statement(s) for ${tableName}`);
      
      // Process each INSERT statement
      for (let i = 0; i < inserts.length; i++) {
        const insert = inserts[i];
        try {
          // Convert MySQL syntax to PostgreSQL
          const pgInsert = convertMySQLToPostgres(insert);
          
          // Log first 200 chars of first INSERT for debugging
          if (i === 0) {
            logger.info(`First INSERT preview: ${pgInsert.substring(0, 200)}...`);
          }
          
          // Execute the insert
          await sequelize.query(pgInsert);
        } catch (error) {
          console.error(`\n!!! Error inserting into ${tableName}:`, error.message);
          console.error('Original error:', error.original);
          console.error('Problematic INSERT (first 500 chars):', insert.substring(0, 500));
          throw error;  // Stop on first error to diagnose
        }
      }
      
      // Get row count
      const [results] = await sequelize.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
      logger.info(`✓ ${tableName}: ${results[0].count} rows`);
    }
    
    logger.info('Data import completed successfully!');
    
    // Print summary
    logger.info('\n=== Import Summary ===');
    for (const tableName of importOrder) {
      const [results] = await sequelize.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
      console.log(`${tableName}: ${results[0].count} rows`);
    }
    
    process.exit(0);
  } catch (error) {
    logger.error('Error during import:', error);
    process.exit(1);
  }
}

// Run the import
importData();
