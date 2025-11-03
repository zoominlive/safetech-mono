const fs = require('fs');
const path = require('path');

// Test extraction logic
const dumpPath = path.join(__dirname, '../../../../attached_assets/safetech_2025-11-02_1762135932425.sql');
const sqlContent = fs.readFileSync(dumpPath, 'utf8');

// Find customer INSERT
const customerInsertMatch = sqlContent.match(/INSERT INTO `customers`[^;]+;/s);
if (customerInsertMatch) {
  const insert = customerInsertMatch[0];
  
  // Extract column names
  const columnsMatch = insert.match(/\(`[^)]+`\)\s+VALUES/);
  if (columnsMatch) {
    const columnsPart = columnsMatch[0];
    const columns = columnsPart.match(/`([^`]+)`/g).map(c => c.replace(/`/g, ''));
    console.log('Columns found:', columns.length);
    console.log('Columns:', columns);
  }
  
  // Extract VALUES section
  const valuesIndex = insert.indexOf('VALUES');
  const valuesSection = insert.substring(valuesIndex + 6).trim();
  
  console.log('\nValues section length:', valuesSection.length);
  console.log('First 200 chars:', valuesSection.substring(0, 200));
  console.log('Last 200 chars:', valuesSection.substring(valuesSection.length - 200));
  
  // Count records properly
  let recordCount = 0;
  let currentPos = 0;
  let inString = false;
  let stringChar = '';
  let parenDepth = 0;
  let records = [];
  let currentRecord = '';
  
  for (let i = 0; i < valuesSection.length; i++) {
    const char = valuesSection[i];
    const nextChar = valuesSection[i + 1];
    const prevChar = i > 0 ? valuesSection[i - 1] : '';
    
    if (!inString) {
      if ((char === "'" || char === '"') && prevChar !== '\\') {
        inString = true;
        stringChar = char;
        currentRecord += char;
      } else if (char === '(') {
        if (parenDepth === 0) {
          // Starting a new record
          currentPos = i;
          currentRecord = '(';
        } else {
          currentRecord += char;
        }
        parenDepth++;
      } else if (char === ')') {
        parenDepth--;
        currentRecord += char;
        
        if (parenDepth === 0) {
          // End of a record
          records.push(currentRecord);
          recordCount++;
          currentRecord = '';
        }
      } else if (char !== ',' || parenDepth > 0) {
        // Only add non-comma chars, or commas inside records
        currentRecord += char;
      }
    } else {
      currentRecord += char;
      if (char === stringChar && prevChar !== '\\') {
        // Check for escaped quotes
        if (nextChar === stringChar) {
          currentRecord += nextChar;
          i++; // Skip next quote
        } else {
          inString = false;
        }
      }
    }
  }
  
  console.log('\nTotal records found:', recordCount);
  console.log('\nFirst 3 records:');
  records.slice(0, 3).forEach((r, i) => {
    console.log(`Record ${i + 1}: ${r.substring(0, 100)}...`);
  });
  
  console.log('\nLast record:');
  console.log(records[records.length - 1].substring(0, 200));
}

// Check SequelizeMeta too
console.log('\n=== SequelizeMeta ===');
const metaInsertMatch = sqlContent.match(/INSERT INTO `SequelizeMeta`[^;]+;/s);
if (metaInsertMatch) {
  const insert = metaInsertMatch[0];
  const valuesIndex = insert.indexOf('VALUES');
  const valuesSection = insert.substring(valuesIndex + 6).trim();
  console.log('VALUES section:', valuesSection.substring(0, 500));
}