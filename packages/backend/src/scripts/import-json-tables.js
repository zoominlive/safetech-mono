const fs = require('fs');
const path = require('path');
const { sequelize } = require('../models/index');
const logger = require('../config/logger');

/**
 * Convert MySQL JSON format to PostgreSQL JSON format
 * MySQL exports JSON as an escaped string: '"{\\"key\\":\\"value\\"}"'
 * PostgreSQL needs it as: '{"key":"value"}'
 */
function convertMySQLJSONToPostgres(jsonString) {
  if (!jsonString || jsonString === 'NULL' || jsonString === 'null') {
    return 'NULL';
  }
  
  // First, remove the outer double quotes if present
  let cleaned = jsonString;
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1);
  }
  
  // Unescape the JSON string
  cleaned = cleaned.replace(/\\"/g, '"');  // Unescape double quotes
  cleaned = cleaned.replace(/\\\\/g, '\\'); // Unescape backslashes
  
  // Ensure proper single quote escaping for PostgreSQL
  cleaned = cleaned.replace(/'/g, "''");
  
  return `'${cleaned}'`;
}

/**
 * Convert MySQL INSERT statement to PostgreSQL format for JSON tables
 */
function convertMySQLToPostgresJSON(line, tableName) {
  // Remove backticks
  let converted = line.replace(/`/g, '"');
  
  // Find and convert JSON columns based on table
  if (tableName === 'report_templates') {
    // The schema column contains JSON
    // Pattern: ...., '"{...}"', ...
    converted = converted.replace(/('"\{.*?\}"')/g, (match) => {
      return convertMySQLJSONToPostgres(match.slice(1, -1)); // Remove outer quotes from match
    });
  } else if (tableName === 'reports') {
    // The answers and photos columns contain JSON
    // Need to handle both columns carefully
    const parts = converted.split(/(?<=\)),(?=\s*\()/); // Split multiple value sets
    
    converted = parts.map(part => {
      // Process each INSERT value set
      let processed = part;
      
      // Find JSON-like patterns and convert them
      // Pattern 1: '"{...}"' - escaped JSON
      processed = processed.replace(/'("\{[^']*\}")'/g, (match) => {
        return convertMySQLJSONToPostgres(match.slice(1, -1));
      });
      
      // Pattern 2: '[]' - empty JSON array
      processed = processed.replace(/'(\[\])'/g, "'$1'");
      
      // Pattern 3: '{}' - empty JSON object
      processed = processed.replace(/'(\{\})'/g, "'$1'");
      
      return processed;
    }).join(',');
  }
  
  // Convert boolean values
  converted = converted.replace(/([,\(]\s*)(0|1)(\s*[,\)])/g, (match, before, value, after) => {
    const boolValue = value === '1' ? 'TRUE' : 'FALSE';
    return `${before}${boolValue}${after}`;
  });
  
  // Convert datetime NULLs
  converted = converted.replace(/NULL/g, 'NULL');
  
  // Fix escaped single quotes
  converted = converted.replace(/\\'/g, "''");
  
  return converted;
}

/**
 * Extract INSERT statements for a specific table
 */
function extractInserts(sqlContent, tableName) {
  const lines = sqlContent.split('\n');
  const inserts = [];
  let collectingInserts = false;
  let currentInsert = '';
  
  for (let line of lines) {
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
        collectingInserts = false;
      }
    }
  }
  
  return inserts;
}

/**
 * Import JSON tables
 */
async function importJSONTables() {
  try {
    logger.info('Starting JSON tables import (report_templates and reports)...');
    
    // Read the SQL dump file
    const sqlPath = path.join(__dirname, '../../../../attached_assets/safetech_1759205327295.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    const jsonTables = ['report_templates', 'reports'];
    
    for (const tableName of jsonTables) {
      logger.info(`\nImporting ${tableName}...`);
      
      // Clear existing data
      await sequelize.query(`TRUNCATE TABLE "${tableName}" CASCADE`);
      
      // Extract INSERT statements
      const inserts = extractInserts(sqlContent, tableName);
      
      if (inserts.length === 0) {
        logger.info(`No data found for ${tableName}`);
        continue;
      }
      
      logger.info(`Found ${inserts.length} INSERT statement(s) for ${tableName}`);
      
      // Process each INSERT
      for (let i = 0; i < inserts.length; i++) {
        const insert = inserts[i];
        try {
          // Convert to PostgreSQL format
          const pgInsert = convertMySQLToPostgresJSON(insert, tableName);
          
          // Log preview of first INSERT for debugging
          if (i === 0) {
            logger.info(`First INSERT preview (first 500 chars): ${pgInsert.substring(0, 500)}...`);
          }
          
          // Execute the insert
          await sequelize.query(pgInsert);
          
        } catch (error) {
          console.error(`\n!!! Error inserting into ${tableName}:`, error.message);
          console.error('Original error:', error.original);
          
          // Try to show more helpful debugging info
          if (error.message.includes('JSON')) {
            console.error('This appears to be a JSON format error.');
            console.error('First 1000 chars of problematic INSERT:', insert.substring(0, 1000));
          }
          
          throw error;
        }
      }
      
      // Get row count
      const [results] = await sequelize.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
      logger.info(`✓ ${tableName}: ${results[0].count} rows imported`);
    }
    
    logger.info('\n=== JSON Tables Import Summary ===');
    for (const tableName of jsonTables) {
      const [results] = await sequelize.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
      console.log(`${tableName}: ${results[0].count} rows`);
    }
    
    // Verify a sample JSON was imported correctly
    logger.info('\nVerifying JSON data integrity...');
    const [templateSample] = await sequelize.query(`SELECT id, name, schema FROM "report_templates" LIMIT 1`);
    if (templateSample.length > 0) {
      const schema = templateSample[0].schema;
      if (typeof schema === 'object' || (typeof schema === 'string' && schema.startsWith('{'))) {
        logger.info('✓ report_templates JSON data looks valid');
      } else {
        logger.warn('⚠ report_templates JSON might need review');
      }
    }
    
    const [reportSample] = await sequelize.query(`SELECT id, name, answers, photos FROM "reports" LIMIT 1`);
    if (reportSample.length > 0) {
      const answers = reportSample[0].answers;
      if (typeof answers === 'object' || (typeof answers === 'string' && (answers === '{}' || answers.startsWith('{')))) {
        logger.info('✓ reports JSON data looks valid');
      } else {
        logger.warn('⚠ reports JSON might need review');
      }
    }
    
    logger.info('\nJSON tables import completed successfully!');
    process.exit(0);
    
  } catch (error) {
    logger.error('Error during JSON tables import:', error);
    process.exit(1);
  }
}

// Run the import
importJSONTables();