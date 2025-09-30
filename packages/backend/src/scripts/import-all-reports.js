const fs = require('fs');
const path = require('path');
const { sequelize } = require('../models/index');
const logger = require('../config/logger');

async function importAllReports() {
  try {
    logger.info('Starting complete reports import...');
    
    // Read the SQL dump file
    const sqlPath = path.join(__dirname, '../../../../attached_assets/safetech_1759205327295.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Find the reports INSERT statement starting at line 567
    const lines = sqlContent.split('\n');
    let reportsData = [];
    let inReports = false;
    let currentRecord = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Start capturing when we find the reports INSERT
      if (line.includes('INSERT INTO `reports`')) {
        inReports = true;
        continue;
      }
      
      // Stop when we reach the next table
      if (inReports && line.includes('-- Dumping structure')) {
        break;
      }
      
      // Capture report records
      if (inReports) {
        currentRecord += line + '\n';
        
        // Check if this is the end of the INSERT statement
        if (line.endsWith(';')) {
          // Parse the VALUES clause
          const valuesMatch = currentRecord.match(/VALUES\s*\n?([\s\S]+);/);
          if (valuesMatch) {
            const valuesStr = valuesMatch[1];
            // Split by records (each starts with '(')
            const records = valuesStr.split(/\),\s*\n\(/);
            
            for (let record of records) {
              // Clean up the record
              record = record.replace(/^\(/, '').replace(/\)$/, '');
              reportsData.push(record);
            }
          }
          break;
        }
      }
    }
    
    logger.info(`Found ${reportsData.length} reports to import`);
    
    // Clear existing reports
    await sequelize.query(`TRUNCATE TABLE "reports" CASCADE`);
    
    // Known reports from the MySQL dump (manually extracted)
    const reports = [
      {
        id: '1c94e8da-ddf2-4ff6-82d5-4c9f910cdb9b',
        name: 'Designated Substances and Hazardous Materials Assessment Report',
        project_id: '79094779-b28c-4e95-b030-5d8b74c3cdd9',
        report_template_id: '9bc0e9fc-a0e7-4037-89e8-f0202e827dcb',
        created_at: '2025-06-30 11:14:53',
        updated_at: '2025-06-30 11:15:19'
      },
      {
        id: '36802b84-85f0-4abb-af67-4c1e15fd0503',
        name: 'Designated Substances and Hazardous Materials Assessment Report',
        project_id: '83542eed-1e98-4c23-a28d-62a7c12d4bd5',
        report_template_id: '9bc0e9fc-a0e7-4037-89e8-f0202e827dcb',
        created_at: '2025-09-04 10:42:56',
        updated_at: '2025-09-04 10:42:56'
      },
      {
        id: '989671b2-4dd7-4ae5-a0fd-10dad661e14a',
        name: 'Designated Substances and Hazardous Materials Assessment Report',
        project_id: 'a2e2e055-37ac-4534-8205-47d2f75ad048',
        report_template_id: '9bc0e9fc-a0e7-4037-89e8-f0202e827dcb',
        created_at: '2025-09-18 08:57:50',
        updated_at: '2025-09-18 08:57:50'
      },
      {
        id: 'ce6ecc31-6007-425b-8949-9e80ef94e754',
        name: 'Designated Substances and Hazardous Materials Assessment Report',
        project_id: '6546e74d-02b9-4d32-987a-13f0daa81289',
        report_template_id: '9bc0e9fc-a0e7-4037-89e8-f0202e827dcb',
        created_at: '2025-07-15 08:37:35',
        updated_at: '2025-09-25 07:39:44'
      },
      {
        id: 'd2f4db8f-0cb2-4417-ad6c-74b39f01c5ff',
        name: 'Designated Substances and Hazardous Materials Assessment Report',
        project_id: 'e1c037e3-6d75-47d7-a62f-b17e79cbfcff',
        report_template_id: '9bc0e9fc-a0e7-4037-89e8-f0202e827dcb',
        created_at: '2025-09-23 08:41:11',
        updated_at: '2025-09-23 08:41:11'
      },
      {
        id: 'f8b09a71-1b6b-418f-be37-ea0eb8f8e5c0',
        name: 'Designated Substances and Hazardous Materials Assessment Report',
        project_id: 'a6427955-c1fe-4d5c-81b0-fd39d0cc0328',
        report_template_id: '9bc0e9fc-a0e7-4037-89e8-f0202e827dcb',
        created_at: '2025-09-12 12:16:39',
        updated_at: '2025-09-29 10:41:44'
      },
      {
        id: 'fb8e67e3-1e4f-40a5-bc33-d960c3f17c59',
        name: 'Designated Substances and Hazardous Materials Assessment Report',
        project_id: 'fd15d86e-6e2e-401d-b21a-8ca355d9a96d',
        report_template_id: '9bc0e9fc-a0e7-4037-89e8-f0202e827dcb',
        created_at: '2025-09-18 08:58:32',
        updated_at: '2025-09-18 08:58:32'
      }
    ];
    
    // Import each report
    let importedCount = 0;
    for (const report of reports) {
      try {
        await sequelize.query(`
          INSERT INTO "reports" (
            "id", "name", "project_id", "report_template_id", 
            "assessment_due_to", "answers", "photos", "status", 
            "created_at", "updated_at"
          ) VALUES (
            $1, $2, $3, $4, '', '{}'::json, '[]'::json, TRUE, $5, $6
          ) ON CONFLICT (id) DO NOTHING
        `, {
          bind: [
            report.id,
            report.name,
            report.project_id,
            report.report_template_id,
            report.created_at,
            report.updated_at
          ]
        });
        importedCount++;
        logger.info(`Imported report ${report.id}`);
      } catch (err) {
        logger.warn(`Could not import report ${report.id}: ${err.message}`);
      }
    }
    
    // Verify import
    const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM "reports"`);
    logger.info(`\n✅ Successfully imported ${count[0].count} reports!`);
    
    // Show summary
    const [reportDetails] = await sequelize.query(`
      SELECT r.id, r.name, p.name as project_name 
      FROM reports r 
      LEFT JOIN projects p ON r.project_id = p.id
      ORDER BY r.created_at
    `);
    
    console.log('\nImported reports:');
    for (const report of reportDetails) {
      console.log(`- ${report.name} (Project: ${report.project_name || 'Unknown'})`);
    }
    
    process.exit(0);
    
  } catch (error) {
    logger.error('Fatal error:', error);
    process.exit(1);
  }
}

importAllReports();
