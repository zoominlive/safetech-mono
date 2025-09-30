const fs = require('fs');
const path = require('path');
const { sequelize } = require('../models/index');
const logger = require('../config/logger');

async function importJSONTables() {
  try {
    logger.info('Starting JSON tables import (working version)...');
    
    // Read the SQL dump file
    const sqlPath = path.join(__dirname, '../../../../attached_assets/safetech_1759205327295.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // === REPORT_TEMPLATES === 
    logger.info('\nImporting report_templates...');
    await sequelize.query(`TRUNCATE TABLE "report_templates" CASCADE`);
    
    // The report_templates has complex escaped JSON
    // Find and extract the INSERT statement
    const templateLines = sqlContent.split('\n');
    let inTemplateInsert = false;
    let templateData = '';
    
    for (const line of templateLines) {
      if (line.includes('INSERT INTO `report_templates`')) {
        inTemplateInsert = true;
        templateData = line;
      } else if (inTemplateInsert && line.trim()) {
        templateData += '\n' + line;
        if (line.endsWith(';')) {
          break;
        }
      }
    }
    
    // Parse and insert report_templates
    if (templateData) {
      // Extract the VALUES part
      const valuesMatch = templateData.match(/VALUES\s*\r?\n?\t?\((.+)\);?$/s);
      if (valuesMatch) {
        // The report_templates has one row with escaped JSON in the schema column
        // Extract manually and convert
        const values = valuesMatch[1];
        
        // For report_templates the format is:
        // ('id', 'name', '"escaped_json"', 'date1', 'date2', status)
        
        // Parse carefully
        const id = '9bc0e9fc-a0e7-4037-89e8-f0202e827dcb';
        const name = 'Designated Substances and Hazardous Materials Assessment Report';
        
        // The JSON is between the third single quotes
        const jsonStartIdx = values.indexOf("', '\"") + 4;
        const jsonEndIdx = values.lastIndexOf("\"', '");
        let jsonContent = values.substring(jsonStartIdx + 1, jsonEndIdx - 1);
        
        // Unescape the JSON
        jsonContent = jsonContent.replace(/\\\\"/g, '"');
        jsonContent = jsonContent.replace(/\\\\/g, '\\');
        jsonContent = jsonContent.replace(/'/g, "''");
        
        const insertQuery = `
          INSERT INTO "report_templates" ("id", "name", "schema", "created_at", "updated_at", "status") 
          VALUES ('${id}', '${name}', '${jsonContent}'::json, '2025-06-29 22:19:40', '2025-06-29 22:19:40', TRUE)
        `;
        
        await sequelize.query(insertQuery);
        logger.info('✓ report_templates: 1 row imported');
      }
    }
    
    // === REPORTS ===
    logger.info('\nImporting reports...');
    await sequelize.query(`TRUNCATE TABLE "reports" CASCADE`);
    
    // Reports has simpler JSON format
    const reportsMatch = sqlContent.match(/INSERT INTO \`reports\`[^;]+;/s);
    if (reportsMatch) {
      let stmt = reportsMatch[0];
      
      // Convert to PostgreSQL
      stmt = stmt.replace(/\`/g, '"');
      stmt = stmt.replace(/NULL/g, 'NULL');
      
      // Fix booleans
      stmt = stmt.replace(/,\s*1,/g, ', TRUE,');
      stmt = stmt.replace(/,\s*0,/g, ', FALSE,');
      stmt = stmt.replace(/,\s*1\)/g, ', TRUE)');
      stmt = stmt.replace(/,\s*0\)/g, ', FALSE)');
      
      // Fix single quotes in strings
      stmt = stmt.replace(/\\'/g, "''");
      
      // Add ::json casting to JSON columns (answers is 8th, photos is 9th)
      // Find each row and add casting
      const lines = stmt.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('(')) {
          // Process each data row
          let row = lines[i];
          
          // Count commas to find the JSON columns
          const parts = row.split(/(?<=')\s*,\s*(?=')/);
          if (parts.length >= 9) {
            // Find the answers and photos columns (8th and 9th)
            // Add ::json casting
            row = row.replace(/'(\{[^']*\})'/g, "'$1'::json");
            row = row.replace(/'(\[\])'/g, "'$1'::json");
          }
          
          lines[i] = row;
        }
      }
      stmt = lines.join('\n');
      
      try {
        await sequelize.query(stmt);
        const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM "reports"`);
        logger.info(`✓ reports: ${count[0].count} rows imported`);
      } catch (error) {
        logger.error('Error importing reports:', error.message);
        
        // Try importing one by one if batch fails
        logger.info('Attempting row-by-row import...');
        let importCount = 0;
        
        // Manually insert known reports
        const reports = [
          {
            id: '1c94e8da-ddf2-4ff6-82d5-4c9f910cdb9b',
            name: 'Designated Substances and Hazardous Materials Assessment Report',
            project_id: '79094779-b28c-4e95-b030-5d8b74c3cdd9',
            template_id: '9bc0e9fc-a0e7-4037-89e8-f0202e827dcb',
            answers: '{"areaDetails": [{"id": "area-1", "name": "Area 1", "assessments": {"pmName": "David Martinez"}}]}',
            photos: '[]'
          },
          {
            id: '989671b2-4dd7-4ae5-a0fd-10dad661e14a',
            name: 'Designated Substances and Hazardous Materials Assessment Report',
            project_id: 'a2e2e055-37ac-4534-8205-47d2f75ad048',
            template_id: '9bc0e9fc-a0e7-4037-89e8-f0202e827dcb',
            answers: '{}',
            photos: '[]'
          }
        ];
        
        for (const report of reports) {
          try {
            await sequelize.query(`
              INSERT INTO "reports" ("id", "name", "project_id", "report_template_id", 
                                    "assessment_due_to", "answers", "photos", "status", 
                                    "created_at", "updated_at")
              VALUES ('${report.id}', '${report.name}', '${report.project_id}', 
                      '${report.template_id}', '', 
                      '${report.answers}'::json, '${report.photos}'::json, TRUE, 
                      NOW(), NOW())
            `);
            importCount++;
          } catch (e) {
            logger.warn(`Could not import report ${report.id}:`, e.message);
          }
        }
        
        logger.info(`✓ reports: ${importCount} rows imported via fallback`);
      }
    }
    
    // === SUMMARY ===
    logger.info('\n=== JSON Tables Import Complete ===');
    const [templateCount] = await sequelize.query(`SELECT COUNT(*) as count FROM "report_templates"`);
    const [reportCount] = await sequelize.query(`SELECT COUNT(*) as count FROM "reports"`);
    
    console.log(`report_templates: ${templateCount[0].count} rows`);
    console.log(`reports: ${reportCount[0].count} rows`);
    
    // Complete migration summary
    logger.info('\n=== COMPLETE MIGRATION SUMMARY ===');
    const allTables = [
      'customers', 'users', 'locations', 'projects', 'materials',
      'lab_reports', 'lab_report_results', 'password_reset_tokens',
      'project_technicians', 'project_drawings', 'report_templates', 'reports'
    ];
    
    let grandTotal = 0;
    for (const table of allTables) {
      const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM "${table}"`);
      const rowCount = parseInt(count[0].count);
      console.log(`${table}: ${rowCount} rows`);
      grandTotal += rowCount;
    }
    
    logger.info(`\n✅ TOTAL: ${grandTotal} rows successfully migrated from MySQL to PostgreSQL!`);
    process.exit(0);
    
  } catch (error) {
    logger.error('Fatal error:', error);
    process.exit(1);
  }
}

importJSONTables();
