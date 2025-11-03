#!/usr/bin/env node

const db = require('../models');
const { User } = db;

async function testRoleCaseInsensitive() {
  console.log('🧪 Testing case-insensitive role values...\n');

  const testCases = [
    { input: 'admin', expected: 'Admin' },
    { input: 'ADMIN', expected: 'Admin' },
    { input: 'Admin', expected: 'Admin' },
    { input: 'technician', expected: 'Technician' },
    { input: 'TECHNICIAN', expected: 'Technician' },
    { input: 'Technician', expected: 'Technician' },
    { input: 'project manager', expected: 'Project Manager' },
    { input: 'PROJECT MANAGER', expected: 'Project Manager' },
    { input: 'Project Manager', expected: 'Project Manager' },
    { input: 'projectmanager', expected: 'Project Manager' },
    { input: 'pm', expected: 'Project Manager' },
    { input: 'PM', expected: 'Project Manager' }
  ];

  console.log('Testing role normalization:');
  console.log('=' .repeat(50));

  for (const testCase of testCases) {
    try {
      // Create a user instance (not saving to DB, just testing the setter)
      const user = User.build({
        id: require('crypto').randomUUID(),
        first_name: 'Test',
        last_name: 'User',
        email: `test-${Date.now()}@example.com`,
        role: testCase.input,
        password: 'test123'
      });

      const actualRole = user.role;
      const passed = actualRole === testCase.expected;
      
      console.log(
        `Input: "${testCase.input}" => Output: "${actualRole}" ` +
        `[${passed ? '✅ PASS' : '❌ FAIL'}]`
      );

      if (!passed) {
        console.log(`  Expected: "${testCase.expected}"`);
      }
    } catch (error) {
      console.log(`Input: "${testCase.input}" => ❌ ERROR: ${error.message}`);
    }
  }

  console.log('\n' + '=' .repeat(50));
  console.log('✨ Role case-insensitive testing complete!\n');
}

// Run the test
testRoleCaseInsensitive()
  .then(() => {
    console.log('✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });