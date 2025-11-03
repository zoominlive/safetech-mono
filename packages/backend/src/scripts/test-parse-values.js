// Test the parseValues function to understand what's happening
const fs = require('fs');
const path = require('path');

// Copy the convertHexToUUID function
function convertHexToUUID(hexValue) {
  // Remove the X'' wrapper
  const hex = hexValue.replace(/^X'|'$/g, '');
  
  // Convert hex pairs to ASCII characters
  let uuid = '';
  for (let i = 0; i < hex.length; i += 2) {
    const hexPair = hex.substring(i, i + 2);
    uuid += String.fromCharCode(parseInt(hexPair, 16));
  }
  
  return uuid;
}

// Copy the parseValues function
function parseValues(valuesString) {
  const values = [];
  let current = '';
  let inString = false;
  let stringChar = '';
  let i = 0;
  
  while (i < valuesString.length) {
    const char = valuesString[i];
    const nextChar = valuesString[i + 1];
    
    if (!inString) {
      if (char === "'" || char === '"') {
        inString = true;
        stringChar = char;
        current += char;
      } else if (char === 'X' && nextChar === "'") {
        // Handle hex values
        let hexEnd = valuesString.indexOf("'", i + 2);
        current = valuesString.substring(i, hexEnd + 1);
        i = hexEnd;
      } else if (char === ',') {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    } else {
      current += char;
      if (char === stringChar) {
        // Check if it's an escaped quote
        if (nextChar === stringChar) {
          current += nextChar;
          i++;
        } else {
          inString = false;
          stringChar = '';
        }
      }
    }
    
    i++;
  }
  
  if (current) {
    values.push(current.trim());
  }
  
  return values;
}

// Test with a sample customer row
const testRow = "X'30303833623233382D333639622D343733392D393564392D373366663834393365386435','Test F Name 1111','Test L name','ajay.g@crestinfosystems.com','31222','Test Address 1','Test Address 2','Test City','Test Provioence 1','122222',1,'2025-10-27 08:55:30','2025-10-27 09:31:36','2025-10-27 09:31:36','Test Company 2'";

console.log('Testing parseValues with customer row:');
console.log('Input:', testRow.substring(0, 150) + '...');

const values = parseValues(testRow);
console.log('\nParsed values count:', values.length);
console.log('Values:');
values.forEach((v, i) => {
  if (i === 0) {
    console.log(`  [${i}]: ${v} -> UUID: ${convertHexToUUID(v)}`);
  } else {
    console.log(`  [${i}]: ${v}`);
  }
});

// Test hex value parsing with edge cases
const hexTests = [
  "X'30303833623233382D333639622D343733392D393564392D373366663834393365386435'",
  "X'30',' something after'",
  "X'41424344','normal string'"
];

console.log('\nTesting hex value parsing:');
hexTests.forEach(test => {
  const parsed = parseValues(test);
  console.log(`  Input: ${test.substring(0, 50)}...`);
  console.log(`  Parsed: ${parsed.join(' | ')}`);
  if (parsed[0] && parsed[0].startsWith("X'")) {
    console.log(`  UUID: ${convertHexToUUID(parsed[0])}`);
  }
});