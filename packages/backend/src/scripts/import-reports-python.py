#!/usr/bin/env python3
import re
import json
import subprocess
import sys

# Read the extracted reports SQL
with open('/tmp/reports_only.sql', 'r') as f:
    sql_content = f.read()

# Extract the VALUES section
values_match = re.search(r'VALUES\s+(.*);', sql_content, re.DOTALL)
if not values_match:
    print("ERROR: Could not find VALUES section")
    sys.exit(1)

values_section = values_match.group(1)

# Split into individual report tuples
# Each tuple starts with whitespace + (' and ends with '),' or ');'
tuple_pattern = r"\s*\(('[^']*'(?:,\s*(?:'[^']*'|NULL|[0-9]+|'[^']*'))*)\)(?:,|\);)"

# More robust approach: find all tuples
reports_data = []
current_pos = 0
tuple_count = 0

while current_pos < len(values_section):
    # Skip whitespace
    while current_pos < len(values_section) and values_section[current_pos].isspace():
        current_pos += 1
    
    if current_pos >= len(values_section):
        break
    
    # Should be at '('
    if values_section[current_pos] != '(':
        break
    
    # Find matching ')'
    depth = 1
    start = current_pos + 1
    i = current_pos + 1
    in_string = False
    escape_next = False
    
    while i < len(values_section) and depth > 0:
        char = values_section[i]
        
        if escape_next:
            escape_next = False
            i += 1
            continue
        
        if char == '\\':
            escape_next = True
            i += 1
            continue
        
        if char == "'" and values_section[i-1] != '\\':
            in_string = not in_string
        
        if not in_string:
            if char == '(':
                depth += 1
            elif char == ')':
                depth -= 1
        
        i += 1
    
    if depth == 0:
        tuple_content = values_section[start:i-1]
        tuple_count += 1
        
        # Skip the comma or semicolon after )
        while i < len(values_section) and values_section[i] in (',', ';', ' ', '\n', '\t'):
            i += 1
        
        current_pos = i
        
        # Store the tuple
        reports_data.append(tuple_content.strip())
    else:
        break

print(f"Found {tuple_count} report tuples")

# Parse each tuple
for idx, tuple_data in enumerate(reports_data, 1):
    print(f"\nProcessing report {idx}/{tuple_count}...")
    print(f"Tuple length: {len(tuple_data)} chars")
    
    # For now, just show first 200 chars
    print(f"Start: {tuple_data[:200]}...")

print(f"\nTotal reports to import: {tuple_count}")
