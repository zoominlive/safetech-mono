const fs = require('fs');
const path = require('path');

// Read the SQL dump file
const sqlPath = path.join(__dirname, '../../../../attached_assets/safetech_1759205327295.sql');
const sqlContent = fs.readFileSync(sqlPath, 'utf8');

// Extract report_templates INSERT
const templateMatch = sqlContent.match(/INSERT INTO `report_templates`[^;]+;/s);
if (templateMatch) {
  let insertStmt = templateMatch[0];
  
  // Write original
  fs.writeFileSync('/tmp/original_insert.sql', insertStmt);
  console.log('Original INSERT written to /tmp/original_insert.sql');
  
  // Convert MySQL to PostgreSQL syntax
  insertStmt = insertStmt.replace(/`/g, '"');
  
  // Extract just the VALUES part to examine the JSON
  const valuesMatch = insertStmt.match(/VALUES\s*\((.*)\)/s);
  if (valuesMatch) {
    const valuesStr = valuesMatch[1];
    console.log('\n=== First 500 chars of VALUES ===');
    console.log(valuesStr.substring(0, 500));
    
    // Find the JSON column value (it's the 3rd column)
    const columns = valuesStr.split(/,\s*'/);
    if (columns.length >= 3) {
      console.log('\n=== JSON column (3rd) first 200 chars ===');
      console.log(columns[2].substring(0, 200));
      
      // Check if it starts with a double quote
      if (columns[2].startsWith('"')) {
        console.log('\nJSON is double-quoted and escaped');
        
        // Extract the JSON part
        const jsonMatch = columns[2].match(/^"(.*?)"/s);
        if (jsonMatch) {
          let jsonStr = jsonMatch[1];
          console.log('\n=== Extracted JSON (first 200 chars) ===');
          console.log(jsonStr.substring(0, 200));
          
          // Unescape it
          jsonStr = jsonStr.replace(/\\"/g, '"');
          console.log('\n=== After unescaping quotes (first 200 chars) ===');
          console.log(jsonStr.substring(0, 200));
          
          // Try to parse it
          try {
            const jsonObj = JSON.parse(jsonStr);
            console.log('\n✓ JSON is valid after unescaping!');
            console.log('Sections found:', jsonObj.sections ? jsonObj.sections.length : 0);
          } catch (e) {
            console.log('\n✗ JSON parse error:', e.message);
          }
        }
      }
    }
  }
  
  // Now do the full conversion
  console.log('\n=== Attempting full conversion ===');
  
  // Handle the JSON column specially - more targeted approach
  // Split by VALUES and process the values part
  const [insertPart, ...valueParts] = insertStmt.split('VALUES');
  let valuesSection = valueParts.join('VALUES');
  
  // The JSON is in the format: , '"json_content"',
  // We need to find it and convert to: , 'json_content'::json,
  
  // More careful regex that handles the full JSON string
  valuesSection = valuesSection.replace(/,\s*'("(?:[^']|'')*?)'/g, (match, jsonPart) => {
    if (jsonPart.startsWith('"') && (jsonPart.includes('{\\"') || jsonPart.includes('["'))) {
      // This looks like escaped JSON
      console.log('\nFound JSON match, length:', jsonPart.length);
      
      // Remove the outer double quotes
      let json = jsonPart.slice(1, -1);
      
      // Unescape
      json = json.replace(/\\"/g, '"');
      json = json.replace(/\\\\/g, '\\');
      
      // Re-escape single quotes for PostgreSQL
      json = json.replace(/'/g, "''");
      
      return `, '${json}'::json`;
    }
    return match;
  });
  
  const converted = insertPart + 'VALUES' + valuesSection;
  
  // Write converted
  fs.writeFileSync('/tmp/converted_insert.sql', converted);
  console.log('\nConverted INSERT written to /tmp/converted_insert.sql');
  
  // Check the converted statement
  console.log('\n=== First 500 chars of converted ===');
  console.log(converted.substring(0, 500));
}