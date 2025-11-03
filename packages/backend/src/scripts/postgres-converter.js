#!/usr/bin/env node

/**
 * PostgreSQL Conversion Helper
 * This script helps convert MySQL syntax to PostgreSQL after merging
 */

const fs = require('fs');
const path = require('path');

class PostgresConverter {
  constructor() {
    this.convertedFiles = [];
    this.issues = [];
  }

  /**
   * Convert MySQL SQL syntax to PostgreSQL
   */
  convertSQL(sql) {
    let converted = sql;
    
    // Remove backticks and replace with double quotes
    converted = converted.replace(/`([^`]+)`/g, '"$1"');
    
    // Convert boolean values
    converted = converted.replace(/\b(VALUES\s*\([^)]*)\b0\b/g, '$1FALSE');
    converted = converted.replace(/\b(VALUES\s*\([^)]*)\b1\b/g, '$1TRUE');
    
    // Convert AUTO_INCREMENT to SERIAL
    converted = converted.replace(/AUTO_INCREMENT/gi, 'SERIAL');
    
    // Convert TINYINT(1) to BOOLEAN
    converted = converted.replace(/TINYINT\(1\)/gi, 'BOOLEAN');
    
    // Convert MySQL JSON functions to PostgreSQL
    converted = converted.replace(/JSON_EXTRACT\(/g, 'jsonb_extract_path_text(');
    converted = converted.replace(/JSON_UNQUOTE\(/g, '');
    
    return converted;
  }

  /**
   * Check Sequelize model for MySQL-specific code
   */
  checkSequelizeModel(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // Check for MySQL-specific data types
    if (content.includes('TINYINT')) {
      issues.push({
        file: filePath,
        issue: 'Uses TINYINT - should be BOOLEAN for PostgreSQL',
        line: content.split('\n').findIndex(line => line.includes('TINYINT')) + 1
      });
    }
    
    // Check for raw MySQL queries
    if (content.includes('`') && content.includes('sequelize.query')) {
      issues.push({
        file: filePath,
        issue: 'Contains raw query with backticks - use double quotes for PostgreSQL',
        suggestion: 'Replace backticks with double quotes in raw queries'
      });
    }
    
    return issues;
  }

  /**
   * Check configuration files
   */
  checkConfig(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // Check dialect
    if (content.includes("dialect: 'mysql'") || content.includes('dialect: "mysql"')) {
      issues.push({
        file: filePath,
        issue: 'Dialect is set to MySQL',
        fix: "Change to: dialect: 'postgres'"
      });
    }
    
    // Check for MySQL-specific options
    if (content.includes('charset:') || content.includes('collate:')) {
      issues.push({
        file: filePath,
        issue: 'Contains MySQL-specific charset/collate options',
        fix: 'Remove charset and collate options'
      });
    }
    
    // Check for SSL configuration (needed for PostgreSQL)
    if (!content.includes('dialectOptions') && content.includes('postgres')) {
      issues.push({
        file: filePath,
        issue: 'Missing SSL configuration for PostgreSQL',
        fix: 'Add dialectOptions with SSL settings'
      });
    }
    
    return issues;
  }

  /**
   * Scan directory for files to check
   */
  scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules')) {
        this.scanDirectory(filePath);
      } else if (file.endsWith('.js')) {
        if (file.includes('config')) {
          const issues = this.checkConfig(filePath);
          this.issues.push(...issues);
        } else if (dir.includes('models')) {
          const issues = this.checkSequelizeModel(filePath);
          this.issues.push(...issues);
        }
      }
    });
  }

  /**
   * Generate report
   */
  generateReport() {
    console.log('\n=== PostgreSQL Conversion Report ===\n');
    
    if (this.issues.length === 0) {
      console.log('✅ No MySQL-specific issues found!');
      return;
    }
    
    console.log(`Found ${this.issues.length} potential issues:\n`);
    
    this.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.file}`);
      console.log(`   Issue: ${issue.issue}`);
      if (issue.fix) {
        console.log(`   Fix: ${issue.fix}`);
      }
      if (issue.suggestion) {
        console.log(`   Suggestion: ${issue.suggestion}`);
      }
      if (issue.line) {
        console.log(`   Line: ${issue.line}`);
      }
      console.log('');
    });
    
    console.log('\n=== Recommendations ===\n');
    console.log('1. Review and fix the issues listed above');
    console.log('2. Test database connections after changes');
    console.log('3. Run migrations if needed');
    console.log('4. Verify all queries work with PostgreSQL syntax');
  }

  /**
   * Run the converter
   */
  run() {
    const backendPath = path.join(__dirname, '..');
    
    console.log('Scanning for MySQL-specific code...');
    this.scanDirectory(backendPath);
    this.generateReport();
    
    // Create a conversion summary file
    const summaryPath = path.join(__dirname, '..', 'postgres-conversion-summary.txt');
    const summary = this.issues.map(issue => {
      return `File: ${issue.file}\nIssue: ${issue.issue}\n${issue.fix ? `Fix: ${issue.fix}\n` : ''}---\n`;
    }).join('\n');
    
    if (this.issues.length > 0) {
      fs.writeFileSync(summaryPath, summary);
      console.log(`\nDetailed summary saved to: ${summaryPath}`);
    }
  }
}

// Run if executed directly
if (require.main === module) {
  const converter = new PostgresConverter();
  converter.run();
}

module.exports = PostgresConverter;