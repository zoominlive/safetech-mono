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

async function analyzeDump() {
  const dumpPath = path.join(__dirname, '../../../../attached_assets/safetech_2025-11-02_1762135932425.sql');
  console.log('Reading dump file...');
  const sqlContent = fs.readFileSync(dumpPath, 'utf8');
  
  // Find the customers INSERT statement
  const customerInsertMatch = sqlContent.match(/INSERT INTO `customers`[^;]+;/s);
  if (!customerInsertMatch) {
    console.log('No customer INSERT found');
    return;
  }
  
  const insert = customerInsertMatch[0];
  
  // Extract column names - handle backticks
  const columnsMatch = insert.match(/\(`[^)]+`\)\s+VALUES/);
  if (!columnsMatch) {
    console.log('No columns found');
    console.log('First 500 chars of INSERT:', insert.substring(0, 500));
    return;
  }
  
  const columns = columnsMatch[1].replace(/`/g, '').split(',').map(c => c.trim());
  console.log('Columns:', columns.join(', '));
  
  // Extract VALUES section
  const valuesIndex = insert.indexOf('VALUES');
  const valuesSection = insert.substring(valuesIndex + 6);
  
  // Parse records with a more robust approach
  const records = [];
  let currentRecord = '';
  let parenDepth = 0;
  let inString = false;
  let stringChar = '';
  
  for (let i = 0; i < valuesSection.length; i++) {
    const char = valuesSection[i];
    const nextChar = valuesSection[i + 1];
    
    if (!inString) {
      if (char === "'" || char === '"') {
        inString = true;
        stringChar = char;
        currentRecord += char;
      } else if (char === '(') {
        parenDepth++;
        currentRecord += char;
      } else if (char === ')') {
        parenDepth--;
        currentRecord += char;
        
        if (parenDepth === 0 && currentRecord.trim().startsWith('(')) {
          // We have a complete record
          records.push(currentRecord);
          currentRecord = '';
        }
      } else {
        currentRecord += char;
      }
    } else {
      currentRecord += char;
      if (char === stringChar) {
        // Check if it's an escaped quote
        if (nextChar === stringChar) {
          currentRecord += nextChar;
          i++;
        } else if (char === '\\' && nextChar === stringChar) {
          // Skip, it's escaped
        } else {
          inString = false;
          stringChar = '';
        }
      } else if (char === '\\' && nextChar) {
        // Handle escaped characters
        currentRecord += nextChar;
        i++;
      }
    }
  }
  
  console.log(`\nFound ${records.length} customer records`);
  
  // Parse first few records to verify
  for (let i = 0; i < Math.min(3, records.length); i++) {
    console.log(`\nRecord ${i + 1}:`);
    const record = records[i];
    
    // Extract the first hex UUID
    const hexMatch = record.match(/X'([0-9A-F]{32})'/i);
    if (hexMatch) {
      const uuid = convertHexToUUID("X'" + hexMatch[1] + "'");
      console.log(`  ID: ${uuid}`);
    }
    
    // Extract company name (last field)
    const companyMatch = record.match(/'([^']+)'\)$/);
    if (companyMatch) {
      console.log(`  Company: ${companyMatch[1]}`);
    }
  }
  
  // Check for the specific UUID we're looking for
  const targetUUID = 'fb5862c4-7b97-4da0-bc8b-19c58bab4975';
  const targetHex = targetUUID.replace(/-/g, '').toUpperCase();
  
  console.log(`\nSearching for UUID: ${targetUUID}`);
  console.log(`As hex: ${targetHex}`);
  
  let found = false;
  for (const record of records) {
    if (record.toUpperCase().includes(targetHex)) {
      found = true;
      console.log('✓ Found in record!');
      
      // Parse this specific record
      const hexMatch = record.match(/X'([0-9A-F]{32})'/i);
      if (hexMatch) {
        const uuid = convertHexToUUID("X'" + hexMatch[1] + "'");
        console.log(`  Parsed UUID: ${uuid}`);
      }
      
      break;
    }
  }
  
  if (!found) {
    console.log('✗ Not found in any record');
  }
}

analyzeDump().catch(console.error);