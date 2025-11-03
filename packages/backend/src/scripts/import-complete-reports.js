const fs = require('fs');
const path = require('path');
const db = require('../models');
const Report = db.Report;

// Parse MySQL INSERT statement to extract all records
function parseMySQLInsertStatement(insertSQL) {
  // Extract VALUES section
  const valuesMatch = insertSQL.match(/VALUES\s+(.*);$/s);
  if (!valuesMatch) {
    return [];
  }

  const valuesSection = valuesMatch[1];
  const records = [];
  let current = '';
  let depth = 0;
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < valuesSection.length; i++) {
    const char = valuesSection[i];
    const prevChar = i > 0 ? valuesSection[i - 1] : '';

    // Handle escape sequences
    if (prevChar === '\\') {
      current += char;
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
      current += char;
      continue;
    }

    if (inString) {
      current += char;
      continue;
    }

    // Track parentheses depth
    if (char === '(') {
      depth++;
      if (depth === 1) {
        current = '';
        continue;
      }
    } else if (char === ')') {
      depth--;
      if (depth === 0) {
        if (current.trim()) {
          records.push(current.trim());
        }
        current = '';
        // Skip comma and whitespace
        while (i + 1 < valuesSection.length && (valuesSection[i + 1] === ',' || /\s/.test(valuesSection[i + 1]))) {
          i++;
        }
        continue;
      }
    }

    if (depth > 0) {
      current += char;
    }
  }

  return records;
}

// Parse individual field values from a record
function parseRecordValues(recordStr) {
  const values = [];
  let current = '';
  let inString = false;
  let stringChar = '';
  let depth = 0;

  for (let i = 0; i < recordStr.length; i++) {
    const char = recordStr[i];
    const prevChar = i > 0 ? recordStr[i - 1] : '';

    // Handle escape sequences
    if (prevChar === '\\') {
      current += char;
      continue;
    }

    // Track string state
    if ((char === "'" || char === '"') && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
        current += char;
        continue;
      } else if (char === stringChar) {
        inString = false;
        current += char;
        continue;
      }
    }

    if (inString) {
      current += char;
      continue;
    }

    // Track nested structures
    if (char === '{' || char === '[' || char === '(') {
      depth++;
      current += char;
      continue;
    } else if (char === '}' || char === ']' || char === ')') {
      depth--;
      current += char;
      continue;
    }

    // Split on comma at depth 0
    if (char === ',' && depth === 0) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  if (current.trim()) {
    values.push(current.trim());
  }

  return values;
}

// Clean SQL value
function cleanSQLValue(value) {
  if (!value || value === 'NULL') return null;

  value = value.trim();

  // Remove quotes from string values
  if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
    value = value.slice(1, -1);
    // Unescape
    value = value.replace(/\\'/g, "'");
    value = value.replace(/\\"/g, '"');
    value = value.replace(/\\\\/g, '\\');
  }

  return value;
}

async function importCompleteReports() {
  try {
    console.log('📊 Starting complete reports import from SQL file...\n');

    // Read SQL file
    const sqlPath = path.join(process.cwd(), '../../attached_assets/safetech_03-11_1762161140451.sql');
    console.log('Reading SQL file:', sqlPath);
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Extract reports INSERT statement
    const reportsMatch = sqlContent.match(/INSERT INTO `reports`[^;]+;/s);
    if (!reportsMatch) {
      throw new Error('Could not find reports INSERT statement');
    }

    const insertSQL = reportsMatch[0];
    console.log('Parsing SQL INSERT statement...');

    // Parse all records
    const records = parseMySQLInsertStatement(insertSQL);
    console.log(`Found ${records.length} report records\n`);

    let imported = 0;
    let skipped = 0;

    for (const record of records) {
      try {
        const values = parseRecordValues(record);

        if (values.length < 14) {
          console.log(`⚠️ Skipping record with ${values.length} values (expected 14)`);
          skipped++;
          continue;
        }

        // Column order: id, name, project_id, report_template_id, assessment_due_to, date_of_loss,
        //               date_of_assessment, answers, photos, status, created_at, updated_at, deleted_at, pm_feedback
        const id = cleanSQLValue(values[0]);
        const name = cleanSQLValue(values[1]);
        const project_id = cleanSQLValue(values[2]);
        const report_template_id = cleanSQLValue(values[3]);
        const assessment_due_to = cleanSQLValue(values[4]) || '';
        const date_of_loss = cleanSQLValue(values[5]);
        const date_of_assessment = cleanSQLValue(values[6]);
        const answersStr = cleanSQLValue(values[7]);
        const photosStr = cleanSQLValue(values[8]);
        const status = cleanSQLValue(values[9]);
        const created_at = cleanSQLValue(values[10]);
        const updated_at = cleanSQLValue(values[11]);
        const deleted_at = cleanSQLValue(values[12]);
        const pm_feedback = cleanSQLValue(values[13]);

        // Parse JSON fields
        let answers = {};
        let photos = [];

        if (answersStr) {
          try {
            answers = JSON.parse(answersStr);
          } catch (e) {
            console.log(`⚠️ Could not parse answers JSON for ${id}: ${e.message}`);
            answers = {};
          }
        }

        if (photosStr) {
          try {
            photos = JSON.parse(photosStr);
          } catch (e) {
            photos = [];
          }
        }

        // Check if project exists
        const project = await db.Project.findByPk(project_id);
        if (!project) {
          console.log(`⚠️ Skipping report ${id} - project ${project_id} not found`);
          skipped++;
          continue;
        }

        // Create report
        await Report.create({
          id,
          name,
          project_id,
          report_template_id,
          assessment_due_to,
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
        const projectName = project.name || 'Unknown Project';
        console.log(`✅ Report ${imported}/${records.length}: ${id.substring(0, 8)}... - ${projectName}`);

      } catch (error) {
        console.error(`❌ Error importing report:`, error.message);
        skipped++;
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Successfully Imported: ${imported} reports`);
    console.log(`⚠️  Skipped: ${skipped} reports`);
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Fatal error:', error);
    throw error;
  }
}

// Run import
importCompleteReports()
  .then(() => {
    console.log('\n✅ Import completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  });
