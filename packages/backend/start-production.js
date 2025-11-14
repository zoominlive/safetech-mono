#!/usr/bin/env node

console.log('🚀 Starting SafeTech Backend in production mode...\n');

console.log('Environment check:');
console.log('  NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('  PORT:', process.env.PORT || 'not set');
console.log('  PGHOST:', process.env.PGHOST ? '✓ set' : '✗ not set');
console.log('  PGDATABASE:', process.env.PGDATABASE ? '✓ set' : '✗ not set');
console.log('  PGUSER:', process.env.PGUSER ? '✓ set' : '✗ not set');
console.log('  DATABASE_URL:', process.env.DATABASE_URL ? '✓ set' : '✗ not set');
console.log('');

const requiredEnvVars = ['PGHOST', 'PGDATABASE', 'PGUSER', 'PGPASSWORD'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('   These should be set by Replit automatically');
  process.exit(1);
}

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

console.log('✅ All required environment variables are set');
console.log('📦 Loading server...\n');

require('./src/server.js');
