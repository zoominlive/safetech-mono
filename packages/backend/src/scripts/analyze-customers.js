const fs = require('fs');
const path = require('path');

// Function to convert hex to UUID
function convertHexToUUID(hexValue) {
  if (!hexValue || !hexValue.startsWith("X'")) return hexValue;
  const hex = hexValue.replace(/^X'/, '').replace(/'$/, '');
  
  // Handle MySQL hex format - might be in ASCII representation
  // First, try to convert from ASCII hex representation
  let actualHex = '';
  for (let i = 0; i < hex.length; i += 2) {
    const byte = hex.substr(i, 2);
    const charCode = parseInt(byte, 16);
    if (charCode >= 48 && charCode <= 57) {
      // 0-9
      actualHex += String.fromCharCode(charCode);
    } else if (charCode >= 65 && charCode <= 70) {
      // A-F
      actualHex += String.fromCharCode(charCode);
    } else if (charCode >= 97 && charCode <= 102) {
      // a-f
      actualHex += String.fromCharCode(charCode);
    } else if (charCode === 45) {
      // hyphen (should not be in hex representation)
      continue;
    } else {
      // Not a valid hex character, return original
      return hexValue;
    }
  }
  
  // Now format as UUID
  if (actualHex.length === 32) {
    return [
      actualHex.substring(0, 8),
      actualHex.substring(8, 12),
      actualHex.substring(12, 16),
      actualHex.substring(16, 20),
      actualHex.substring(20, 32)
    ].join('-').toLowerCase();
  }
  
  return hexValue;
}

async function analyzeCustomers() {
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
  console.log('Customer INSERT length:', insert.length);
  
  // Look at the actual structure
  const firstPart = insert.substring(0, 300);
  console.log('\nFirst part of INSERT:');
  console.log(firstPart);
  
  // Extract VALUES section more carefully
  const valuesIndex = insert.indexOf('VALUES');
  if (valuesIndex === -1) {
    console.log('No VALUES found');
    return;
  }
  
  const valuesSection = insert.substring(valuesIndex + 6).trim();
  
  // Count records by counting opening parentheses at depth 0
  let recordCount = 0;
  let parenDepth = 0;
  let inString = false;
  let stringChar = '';
  
  for (let i = 0; i < valuesSection.length; i++) {
    const char = valuesSection[i];
    const prevChar = i > 0 ? valuesSection[i - 1] : '';
    
    if (!inString) {
      if ((char === "'" || char === '"') && prevChar !== '\\') {
        inString = true;
        stringChar = char;
      } else if (char === '(') {
        if (parenDepth === 0) recordCount++;
        parenDepth++;
      } else if (char === ')') {
        parenDepth--;
      }
    } else {
      if (char === stringChar && prevChar !== '\\') {
        // Check for escaped quotes (double quotes)
        if (i + 1 < valuesSection.length && valuesSection[i + 1] === stringChar) {
          i++; // Skip next quote
        } else {
          inString = false;
        }
      }
    }
  }
  
  console.log(`\nFound ${recordCount} customer records`);
  
  // Extract and analyze first hex UUID
  const firstHexMatch = valuesSection.match(/X'([0-9A-F]+)'/i);
  if (firstHexMatch) {
    console.log('\nFirst hex value found:');
    console.log('  Raw hex:', firstHexMatch[1]);
    console.log('  Length:', firstHexMatch[1].length);
    
    const converted = convertHexToUUID("X'" + firstHexMatch[1] + "'");
    console.log('  Converted UUID:', converted);
    
    // Try to decode as ASCII
    let decoded = '';
    for (let i = 0; i < firstHexMatch[1].length; i += 2) {
      const byte = firstHexMatch[1].substr(i, 2);
      decoded += String.fromCharCode(parseInt(byte, 16));
    }
    console.log('  Decoded as ASCII:', decoded);
  }
  
  // Look for fb5862c4-7b97-4da0-bc8b-19c58bab4975
  const targetUUID = 'fb5862c4-7b97-4da0-bc8b-19c58bab4975';
  
  // Convert target UUID to the hex format used in the dump
  let targetHex = '';
  const cleanTarget = targetUUID.replace(/-/g, '');
  for (let i = 0; i < cleanTarget.length; i++) {
    targetHex += cleanTarget.charCodeAt(i).toString(16).toUpperCase();
  }
  
  console.log(`\nSearching for target UUID: ${targetUUID}`);
  console.log(`  As hex encoding: ${targetHex.substring(0, 32)}...`);
  
  if (insert.includes(targetHex.substring(0, 32))) {
    console.log('✓ Found target UUID in customer data!');
  } else {
    console.log('✗ Target UUID not found');
    
    // Maybe it's in different format, let's search for parts
    if (insert.toLowerCase().includes('fb5862c4')) {
      console.log('  But found the beginning part of the UUID');
    }
  }
}

analyzeCustomers().catch(console.error);