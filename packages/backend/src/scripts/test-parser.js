const fs = require('fs');
const path = require('path');

// Function to convert hex to UUID
function convertHexToUUID(hexValue) {
  if (!hexValue || !hexValue.startsWith("X'")) return hexValue;
  const hex = hexValue.replace(/^X'/, '').replace(/'$/, '').toLowerCase();
  if (hex.length !== 32) return hexValue;
  
  const uuid = [
    hex.substring(0, 8),
    hex.substring(8, 12),
    hex.substring(12, 16),
    hex.substring(16, 20),
    hex.substring(20, 32)
  ].join('-');
  
  return uuid;
}

// Test the parser with a more robust approach
async function testParser() {
  const dumpPath = path.join(__dirname, '../../../../attached_assets/safetech_2025-11-02_1762135932425.sql');
  console.log('Reading dump file...');
  const sqlContent = fs.readFileSync(dumpPath, 'utf8');
  
  // Count customer records in the dump directly
  console.log('\n=== Searching for customer records in dump ===');
  
  // Find all customer INSERT statements
  const customerInsertPattern = /INSERT INTO `customers`[^;]+;/gs;
  const customerInserts = sqlContent.match(customerInsertPattern);
  
  if (customerInserts) {
    console.log(`Found ${customerInserts.length} customer INSERT statement(s)`);
    
    for (let i = 0; i < customerInserts.length; i++) {
      const insert = customerInserts[i];
      console.log(`\n--- INSERT Statement ${i + 1} ---`);
      console.log(`Length: ${insert.length} characters`);
      
      // Count VALUES groups
      const valuesPattern = /\([^)]*(?:\([^)]*\)[^)]*)*\)/g;
      const valuesSection = insert.substring(insert.indexOf('VALUES') + 6);
      
      // Better approach: count opening parens after VALUES that aren't inside strings
      let recordCount = 0;
      let inString = false;
      let stringChar = '';
      let parenDepth = 0;
      
      for (let j = 0; j < valuesSection.length; j++) {
        const char = valuesSection[j];
        const prevChar = j > 0 ? valuesSection[j-1] : '';
        
        if (!inString) {
          if (char === "'" && prevChar !== '\\') {
            inString = true;
            stringChar = "'";
          } else if (char === '"' && prevChar !== '\\') {
            inString = true;
            stringChar = '"';
          } else if (char === '(') {
            if (parenDepth === 0) recordCount++;
            parenDepth++;
          } else if (char === ')') {
            parenDepth--;
          }
        } else {
          if (char === stringChar && prevChar !== '\\') {
            // Check if it's an escaped quote (two quotes in a row)
            if (j + 1 < valuesSection.length && valuesSection[j + 1] === stringChar) {
              j++; // Skip the next quote
            } else {
              inString = false;
            }
          }
        }
      }
      
      console.log(`Records in this INSERT: ${recordCount}`);
      
      // Extract some sample UUIDs to verify
      const uuidPattern = /X'([0-9A-F]{32})'/gi;
      const uuids = [...insert.matchAll(uuidPattern)];
      console.log(`Sample UUIDs found (first 5):`);
      uuids.slice(0, 5).forEach(match => {
        console.log(`  - ${convertHexToUUID("X'" + match[1] + "'")}`);
      });
    }
  }
  
  // Also search for specific customer UUID we know exists
  const targetUUID = 'fb5862c4-7b97-4da0-bc8b-19c58bab4975';
  const hexTarget = targetUUID.replace(/-/g, '').toUpperCase();
  console.log(`\nSearching for specific customer UUID: ${targetUUID}`);
  console.log(`As hex: ${hexTarget}`);
  
  if (sqlContent.includes(hexTarget)) {
    console.log('✓ Found target UUID in dump');
    
    // Find context around it
    const index = sqlContent.indexOf(hexTarget);
    const context = sqlContent.substring(Math.max(0, index - 200), Math.min(sqlContent.length, index + 200));
    console.log('Context:', context.replace(/\n/g, ' ').substring(0, 300) + '...');
  } else {
    console.log('✗ Target UUID not found in dump');
  }
}

testParser().catch(console.error);