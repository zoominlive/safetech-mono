const fs = require('fs');
const path = require('path');
const { sequelize } = require('../models/index');
const logger = require('../config/logger');

/**
 * Import JSON tables with a different approach
 */
async function importJSONTables() {
  try {
    logger.info('Starting JSON tables import (v2)...');
    
    // Read the SQL dump file
    const sqlPath = path.join(__dirname, '../../../../attached_assets/safetech_1759205327295.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Process report_templates first
    logger.info('\nProcessing report_templates...');
    await sequelize.query(`TRUNCATE TABLE "report_templates" CASCADE`);
    
    // Extract the report_templates INSERT
    const templateMatch = sqlContent.match(/INSERT INTO `report_templates`[^;]+;/s);
    if (templateMatch) {
      let insertStmt = templateMatch[0];
      
      // Convert MySQL to PostgreSQL syntax
      insertStmt = insertStmt.replace(/`/g, '"'); // Replace backticks with double quotes
      
      // Handle the JSON column specially
      // The pattern is: '"json_content"' where json_content has escaped quotes
      // We need to convert it to: 'json_content'::json
      
      // First, find all JSON-like strings (they start with '" and contain {)
      insertStmt = insertStmt.replace(/'("(?:\\.|[^"\\])*")'/g, (match) => {
        // Remove the outer single quotes and the extra double quotes
        let jsonStr = match.slice(2, -2);
        
        // Unescape the JSON
        jsonStr = jsonStr.replace(/\\"/g, '"');
        jsonStr = jsonStr.replace(/\\\\/g, '\\');
        
        // Escape single quotes for PostgreSQL
        jsonStr = jsonStr.replace(/'/g, "''");
        
        // Return as PostgreSQL JSON
        return `'${jsonStr}'::json`;
      });
      
      // Convert boolean values
      insertStmt = insertStmt.replace(/([,\(]\s*)1(\s*[,\)])/g, '$1TRUE$2');
      insertStmt = insertStmt.replace(/([,\(]\s*)0(\s*[,\)])/g, '$1FALSE$2');
      
      try {
        await sequelize.query(insertStmt);
        const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM "report_templates"`);
        logger.info(`✓ report_templates: ${count[0].count} rows imported`);
      } catch (error) {
        logger.error('Error importing report_templates:', error.message);
        // Log the first 1000 chars of the problematic statement
        logger.error('Statement preview:', insertStmt.substring(0, 1000));
        throw error;
      }
    }
    
    // Process reports table
    logger.info('\nProcessing reports...');
    await sequelize.query(`TRUNCATE TABLE "reports" CASCADE`);
    
    const reportsMatch = sqlContent.match(/INSERT INTO `reports`[^;]+;/s);
    if (reportsMatch) {
      let insertStmt = reportsMatch[0];
      
      // Convert MySQL to PostgreSQL syntax
      insertStmt = insertStmt.replace(/`/g, '"');
      
      // Handle JSON columns (answers and photos)
      // These can be either '{}', '[]', or '"{...}"'
      
      // Handle escaped JSON objects
      insertStmt = insertStmt.replace(/'("(?:\\.|[^"\\])*")'/g, (match) => {
        if (match.includes('{') || match.includes('[')) {
          // This is a JSON field
          let jsonStr = match.slice(2, -2);
          jsonStr = jsonStr.replace(/\\"/g, '"');
          jsonStr = jsonStr.replace(/\\\\/g, '\\');
          jsonStr = jsonStr.replace(/'/g, "''");
          return `'${jsonStr}'::json`;
        }
        return match; // Not JSON, leave as is
      });
      
      // Handle simple JSON literals
      insertStmt = insertStmt.replace(/'(\{\})'|'(\[\])'/g, (match) => {
        return match + '::json';
      });
      
      // Convert boolean values
      insertStmt = insertStmt.replace(/([,\(]\s*)1(\s*[,\)])/g, '$1TRUE$2');
      insertStmt = insertStmt.replace(/([,\(]\s*)0(\s*[,\)])/g, '$1FALSE$2');
      
      // Fix escaped quotes in regular strings
      insertStmt = insertStmt.replace(/\\'/g, "''");
      
      try {
        await sequelize.query(insertStmt);
        const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM "reports"`);
        logger.info(`✓ reports: ${count[0].count} rows imported`);
      } catch (error) {
        logger.error('Error importing reports:', error.message);
        logger.error('Statement preview:', insertStmt.substring(0, 1000));
        throw error;
      }
    }
    
    // Verify data
    logger.info('\n=== Import Summary ===');
    const tables = ['report_templates', 'reports'];
    for (const table of tables) {
      const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM "${table}"`);
      console.log(`${table}: ${count[0].count} rows`);
    }
    
    // Test JSON data
    logger.info('\nVerifying JSON data...');
    try {
      const [templates] = await sequelize.query(`SELECT id, name, schema::text FROM "report_templates" LIMIT 1`);
      if (templates.length > 0) {
        const schemaText = templates[0].schema;
        const schemaObj = JSON.parse(schemaText);
        if (schemaObj.sections) {
          logger.info('✓ report_templates JSON is valid and accessible');
        }
      }
    } catch (e) {
      logger.warn('⚠ Could not verify report_templates JSON:', e.message);
    }
    
    try {
      const [reports] = await sequelize.query(`SELECT id, name, answers::text FROM "reports" WHERE answers IS NOT NULL LIMIT 1`);
      if (reports.length > 0) {
        const answersText = reports[0].answers;
        const answersObj = JSON.parse(answersText);
        logger.info('✓ reports JSON is valid and accessible');
      }
    } catch (e) {
      logger.warn('⚠ Could not verify reports JSON:', e.message);
    }
    
    logger.info('\nJSON tables import completed successfully!');
    process.exit(0);
    
  } catch (error) {
    logger.error('Fatal error during import:', error);
    process.exit(1);
  }
}

// Run the import
importJSONTables();