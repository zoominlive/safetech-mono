#!/usr/bin/env node

// Force immediate console output
process.stdout.write('🚀 Starting SafeTech Backend in production mode...\n\n');

process.stdout.write('Environment check:\n');
process.stdout.write(`  NODE_ENV: ${process.env.NODE_ENV || 'not set'}\n`);
process.stdout.write(`  PORT: ${process.env.PORT || 'not set (will use 4000)'}\n`);
process.stdout.write(`  PGHOST: ${process.env.PGHOST ? '✓ set' : '✗ not set'}\n`);
process.stdout.write(`  PGDATABASE: ${process.env.PGDATABASE ? '✓ set' : '✗ not set'}\n`);
process.stdout.write(`  PGUSER: ${process.env.PGUSER ? '✓ set' : '✗ not set'}\n`);
process.stdout.write(`  DATABASE_URL: ${process.env.DATABASE_URL ? '✓ set' : '✗ not set'}\n`);
process.stdout.write('\n');

const requiredEnvVars = ['PGHOST', 'PGDATABASE', 'PGUSER', 'PGPASSWORD'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  process.stderr.write(`❌ Missing required environment variables: ${missingVars.join(', ')}\n`);
  process.stderr.write('   These should be set by Replit automatically\n');
  process.exit(1);
}

// Ensure PORT is set explicitly
if (!process.env.PORT) {
  process.env.PORT = '4000';
  process.stdout.write('⚙️  Setting PORT=4000 (default)\n');
}

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

process.stdout.write('✅ All required environment variables are set\n');
process.stdout.write(`📦 Loading server on port ${process.env.PORT}...\n\n`);

require('./src/server.js');
