const fs = require('fs');
const path = require('path');

// Read the SQL file and extract JUST the reports section
const sqlPath = path.join(process.cwd(), '../../attached_assets/safetech_03-11_1762161140451.sql');
console.log('Reading SQL file from:', sqlPath);
const sqlContent = fs.readFileSync(sqlPath, 'utf8');

// Find the reports INSERT section
const lines = sqlContent.split('\n');
let inReportsSection = false;
let reportsSQL = '';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes('INSERT INTO `reports`')) {
    inReportsSection = true;
  }
  
  if (inReportsSection) {
    reportsSQL += line + '\n';
    
    // Stop when we hit the next table
    if (line.includes('-- Dumping structure for table safetech.report_templates')) {
      break;
    }
  }
}

// Save just the reports section
fs.writeFileSync('/tmp/reports_only.sql', reportsSQL);
console.log('Extracted reports SQL to /tmp/reports_only.sql');
console.log(`Total length: ${reportsSQL.length} chars`);

// Try to find all report IDs in the section
const uuidPattern = /'([a-f0-9-]{36})'/g;
const uuids = [];
let match;

while ((match = uuidPattern.exec(reportsSQL)) !== null) {
  uuids.push(match[1]);
}

console.log(`\nFound ${uuids.length} UUIDs total in reports section`);

// The first UUID in each record should be the report ID
// Let's count distinct UUIDs that appear first after  a newline + whitespace + (
const reportIdPattern = /^\s+\('([a-f0-9-]{36})',/gm;
const reportIds = [];
let reportMatch;

while ((reportMatch = reportIdPattern.exec(reportsSQL)) !== null) {
  reportIds.push(reportMatch[1]);
}

console.log(`\nFound ${reportIds.length} report IDs:`);
reportIds.forEach((id, index) => {
  console.log(`  ${index + 1}. ${id}`);
});
