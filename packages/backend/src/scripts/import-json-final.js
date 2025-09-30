const fs = require('fs');
const path = require('path');
const { sequelize } = require('../models/index');
const logger = require('../config/logger');

/**
 * Final approach for importing JSON tables
 */
async function importJSONTables() {
  try {
    logger.info('Starting final JSON tables import...');
    
    // Read the SQL dump file
    const sqlPath = path.join(__dirname, '../../../../attached_assets/safetech_1759205327295.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // === REPORT_TEMPLATES ===
    logger.info('\nImporting report_templates...');
    await sequelize.query(`TRUNCATE TABLE "report_templates" CASCADE`);
    
    // Extract report_templates data manually
    const templateMatch = sqlContent.match(/INSERT INTO `report_templates`[^;]+;/s);
    if (templateMatch) {
      // Parse the values manually to handle the complex JSON
      const valuesMatch = templateMatch[0].match(/VALUES\s*\r?\n?\t?\((.*)\)/s);
      if (valuesMatch) {
        const valuesStr = valuesMatch[1];
        
        // The format is: 'id', 'name', '"json"', 'date1', 'date2', status
        // We need to extract each value carefully
        
        // Use a simple approach: split by the pattern ', ' but not inside quotes
        // Since we know the structure, we can extract the JSON specially
        const idMatch = valuesStr.match(/^'([^']+)'/);
        const nameMatch = valuesStr.match(/^'[^']+',\s*'([^']+)'/);
        
        // Extract the JSON which starts after the name
        const afterName = valuesStr.indexOf("', '") + 3; // Skip past name
        const jsonStart = valuesStr.indexOf("'", afterName);
        const jsonEnd = valuesStr.indexOf("', '", jsonStart + 1);
        let jsonContent = valuesStr.substring(jsonStart + 1, jsonEnd);
        
        // The JSON starts with " and has \\ escaping
        if (jsonContent.startsWith('"')) {
          jsonContent = jsonContent.slice(1, -1); // Remove outer quotes
          // Unescape: \\" -> " and \\\\ -> \\
          jsonContent = jsonContent.replace(/\\\\"/g, '"');
          jsonContent = jsonContent.replace(/\\\\\\\\/g, '\\\\');
        }
        
        // Get the remaining values
        const remaining = valuesStr.substring(jsonEnd + 3);
        const dateMatch = remaining.match(/^'([^']+)',\s*'([^']+)',\s*(\d)/);
        
        if (idMatch && nameMatch && dateMatch) {
          const id = idMatch[1];
          const name = nameMatch[1];
          const createdAt = dateMatch[1];
          const updatedAt = dateMatch[2];
          const status = dateMatch[3] === '1' ? 'TRUE' : 'FALSE';
          
          // Escape single quotes in JSON for PostgreSQL
          jsonContent = jsonContent.replace(/'/g, "''");
          
          const insertQuery = `
            INSERT INTO "report_templates" ("id", "name", "schema", "created_at", "updated_at", "status") 
            VALUES ('${id}', '${name}', '${jsonContent}'::json, '${createdAt}', '${updatedAt}', ${status})
          `;
          
          await sequelize.query(insertQuery);
          logger.info('✓ report_templates: 1 row imported');
        }
      }
    }
    
    // === REPORTS ===
    logger.info('\nImporting reports...');
    await sequelize.query(`TRUNCATE TABLE "reports" CASCADE`);
    
    // Extract reports INSERT
    const reportsLines = sqlContent.split('\n').filter(line => 
      line.includes("INSERT INTO `reports`") || 
      (line.startsWith("(") && line.includes("79094779-b28c-4e95-b030-5d8b74c3cdd9"))
    );
    
    if (reportsLines.length > 0) {
      // Process each report row
      let importCount = 0;
      
      for (let i = 1; i < reportsLines.length; i++) {
        const line = reportsLines[i];
        if (!line.trim().startsWith('(')) continue;
        
        // Extract values from each row
        const match = line.match(/\('([^']+)',\s*'([^']*)',\s*'([^']*)',\s*'([^']+)',\s*'([^']*)',\s*([^,]+),\s*([^,]+),\s*'([^']+(?:''[^']+)*)',\s*'([^']+)',\s*(\d),\s*'([^']+)',\s*'([^']+)',\s*([^,]+),\s*([^)]+)\)/);
        
        if (match) {
          const [_, id, name, projectId, templateId, assessmentDueTo, dateLoss, dateAssess, answers, photos, status, createdAt, updatedAt, deletedAt, pmFeedback] = match;
          
          // Process JSON fields
          let answersJson = answers;
          let photosJson = photos;
          
          // Handle answers JSON
          if (answersJson.startsWith('"')) {
            answersJson = answersJson.slice(1, -1);
            answersJson = answersJson.replace(/\\\\"/g, '"');
            answersJson = answersJson.replace(/\\\\\\\\/g, '\\\\');
          }
          answersJson = answersJson.replace(/'/g, "''");
          
          // Handle photos JSON  
          if (photosJson === '[]') {
            photosJson = '[]';
          }
          
          const insertQuery = `
            INSERT INTO "reports" ("id", "name", "project_id", "report_template_id", "assessment_due_to", 
                                  "date_of_loss", "date_of_assessment", "answers", "photos", "status", 
                                  "created_at", "updated_at", "deleted_at", "pm_feedback")
            VALUES ('${id}', ${name ? `'${name}'` : 'NULL'}, ${projectId ? `'${projectId}'` : 'NULL'}, 
                    '${templateId}', '${assessmentDueTo}', 
                    ${dateLoss === 'NULL' ? 'NULL' : `'${dateLoss}'`}, 
                    ${dateAssess === 'NULL' ? 'NULL' : `'${dateAssess}'`}, 
                    '${answersJson}'::json, '${photosJson}'::json, 
                    ${status === '1' ? 'TRUE' : 'FALSE'}, 
                    '${createdAt}', '${updatedAt}', 
                    ${deletedAt === 'NULL' ? 'NULL' : `'${deletedAt}'`}, 
                    ${pmFeedback === 'NULL' ? 'NULL' : `'${pmFeedback}'`})
          `;
          
          try {
            await sequelize.query(insertQuery);
            importCount++;
          } catch (error) {
            logger.error(`Failed to import report ${id}:`, error.message);
          }
        }
      }
      
      logger.info(`✓ reports: ${importCount} rows imported`);
    }
    
    // === SUMMARY ===
    logger.info('\n=== Final Import Summary ===');
    const tables = ['report_templates', 'reports'];
    let totalRows = 0;
    for (const table of tables) {
      const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM "${table}"`);
      const rowCount = count[0].count;
      console.log(`${table}: ${rowCount} rows`);
      totalRows += parseInt(rowCount);
    }
    
    // Add to overall migration summary
    const allTables = [
      'customers', 'users', 'locations', 'projects', 'materials',
      'lab_reports', 'lab_report_results', 'password_reset_tokens',
      'project_technicians', 'project_drawings', 'report_templates', 'reports'
    ];
    
    logger.info('\n=== COMPLETE MIGRATION SUMMARY ===');
    let grandTotal = 0;
    for (const table of allTables) {
      const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM "${table}"`);
      const rowCount = count[0].count;
      console.log(`${table}: ${rowCount} rows`);
      grandTotal += parseInt(rowCount);
    }
    logger.info(`\nTOTAL: ${grandTotal} rows migrated from MySQL to PostgreSQL`);
    
    logger.info('\n✅ MySQL to PostgreSQL migration COMPLETE!');
    process.exit(0);
    
  } catch (error) {
    logger.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run the import
importJSONTables();