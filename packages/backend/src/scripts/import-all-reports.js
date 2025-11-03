const fs = require('fs');
const db = require('../models');
const Report = db.Report;

// Parse SQL INSERT statement for reports
function parseReportsSQL(sqlContent) {
  const insertMatch = sqlContent.match(/INSERT INTO `reports`[^;]+;/s);
  if (!insertMatch) {
    throw new Error('Could not find reports INSERT statement');
  }

  const insertStatement = insertMatch[0];
  
  // Extract the VALUES part
  const valuesMatch = insertStatement.match(/VALUES\s+(.*);$/s);
  if (!valuesMatch) {
    throw new Error('Could not extract VALUES from INSERT statement');
  }

  const valuesString = valuesMatch[1].trim();
  
  // Parse individual report records
  // Each record starts with ( and we need to find matching )
  const reports = [];
  let depth = 0;
  let currentRecord = '';
  let inString = false;
  let escapeNext = false;
  
  for (let i = 0; i < valuesString.length; i++) {
    const char = valuesString[i];
    const prevChar = i > 0 ? valuesString[i - 1] : '';
    
    if (escapeNext) {
      currentRecord += char;
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      currentRecord += char;
      escapeNext = true;
      continue;
    }
    
    if (char === "'" && prevChar !== '\\') {
      inString = !inString;
      currentRecord += char;
      continue;
    }
    
    if (!inString) {
      if (char === '(') {
        depth++;
        if (depth === 1 && currentRecord.trim() === '') {
          // Start of new record
          continue;
        }
      } else if (char === ')') {
        depth--;
        if (depth === 0) {
          // End of record
          reports.push(currentRecord.trim());
          currentRecord = '';
          // Skip the comma and whitespace after )
          while (i + 1 < valuesString.length && (valuesString[i + 1] === ',' || valuesString[i + 1] === ' ' || valuesString[i + 1] === '\n' || valuesString[i + 1] === '\t')) {
            i++;
          }
          continue;
        }
      }
    }
    
    currentRecord += char;
  }
  
  return reports;
}

// Parse a single report record
function parseReportRecord(recordString) {
  // Split by commas, but respect quotes and nested structures
  const values = [];
  let current = '';
  let depth = 0;
  let inString = false;
  let escapeNext = false;
  
  for (let i = 0; i < recordString.length; i++) {
    const char = recordString[i];
    const prevChar = i > 0 ? recordString[i - 1] : '';
    
    if (escapeNext) {
      current += char;
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      current += char;
      escapeNext = true;
      continue;
    }
    
    if (char === "'" && prevChar !== '\\') {
      inString = !inString;
      current += char;
      continue;
    }
    
    if (!inString) {
      if (char === '{' || char === '[') {
        depth++;
      } else if (char === '}' || char === ']') {
        depth--;
      }
      
      if (char === ',' && depth === 0) {
        values.push(current.trim());
        current = '';
        continue;
      }
    }
    
    current += char;
  }
  
  if (current.trim()) {
    values.push(current.trim());
  }
  
  return values;
}

// Clean and parse a value
function cleanValue(value) {
  if (value === 'NULL') return null;
  
  // Remove surrounding quotes
  if (value.startsWith("'") && value.endsWith("'")) {
    // Unescape the string
    let unescaped = value.slice(1, -1);
    unescaped = unescaped.replace(/\\'/g, "'");
    unescaped = unescaped.replace(/\\\\/g, "\\");
    unescaped = unescaped.replace(/\\n/g, "\n");
    unescaped = unescaped.replace(/\\r/g, "\r");
    unescaped = unescaped.replace(/\\t/g, "\t");
    return unescaped;
  }
  
  return value;
}

async function importAllReports() {
  try {
    console.log('📊 Starting complete reports data import...\n');

    // Read the SQL file
    const path = require('path');
    const sqlPath = path.join(process.cwd(), '../../attached_assets/safetech_03-11_1762161140451.sql');
    console.log('Reading SQL file:', sqlPath);
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Parse reports
    console.log('Parsing reports SQL...');
    const reportRecords = parseReportsSQL(sqlContent);
    console.log(`Found ${reportRecords.length} report records\n`);

    // Column order: id, name, project_id, report_template_id, assessment_due_to, date_of_loss, 
    //               date_of_assessment, answers, photos, status, created_at, updated_at, deleted_at, pm_feedback

    let imported = 0;
    let skipped = 0;

    for (const record of reportRecords) {
      try {
        const values = parseReportRecord(record);
        
        if (values.length < 14) {
          console.log(`⚠️ Skipping record with insufficient values (${values.length})`);
          skipped++;
          continue;
        }

        const id = cleanValue(values[0]);
        const name = cleanValue(values[1]);
        const project_id = cleanValue(values[2]);
        const report_template_id = cleanValue(values[3]);
        const assessment_due_to = cleanValue(values[4]);
        const date_of_loss = cleanValue(values[5]);
        const date_of_assessment = cleanValue(values[6]);
        const answersStr = cleanValue(values[7]);
        const photosStr = cleanValue(values[8]);
        const status = cleanValue(values[9]);
        const created_at = cleanValue(values[10]);
        const updated_at = cleanValue(values[11]);
        const deleted_at = cleanValue(values[12]);
        const pm_feedback = cleanValue(values[13]);

        // Parse JSON fields
        let answers = {};
        let photos = [];
        
        if (answersStr && answersStr !== 'NULL') {
          try {
            answers = JSON.parse(answersStr);
          } catch (e) {
            console.log(`⚠️ Could not parse answers JSON for report ${id}:`, e.message);
          }
        }
        
        if (photosStr && photosStr !== 'NULL') {
          try {
            photos = JSON.parse(photosStr);
          } catch (e) {
            console.log(`⚠️ Could not parse photos JSON for report ${id}:`, e.message);
          }
        }

        // Create the report
        await Report.create({
          id,
          name,
          project_id,
          report_template_id,
          assessment_due_to: assessment_due_to || '',
          date_of_loss,
          date_of_assessment,
          answers,
          photos,
          status: status === '1' || status === 1,
          created_at,
          updated_at,
          deleted_at,
          pm_feedback
        });

        imported++;
        console.log(`✅ Imported Report ${imported}/${reportRecords.length}:`, id, '-', name?.substring(0, 50) + '...');
        
      } catch (error) {
        console.error(`❌ Error importing individual report:`, error.message);
        skipped++;
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Total Reports Imported: ${imported}`);
    console.log(`⚠️ Total Reports Skipped: ${skipped}`);
    console.log('='.repeat(80));
    console.log('✨ Reports import completed!');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Error importing reports:', error);
    throw error;
  }
}

// Run the import
importAllReports()
  .then(() => {
    console.log('\n✅ Import process finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Import process failed:', error);
    process.exit(1);
  });
