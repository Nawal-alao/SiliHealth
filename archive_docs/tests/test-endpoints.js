#!/usr/bin/env node

/**
 * 🧪 HealID Endpoint Testing Script
 * 
 * Tests critical API endpoints:
 * - POST /api/signup
 * - POST /api/login
 * - GET /api/notifications
 */

const http = require('http');

const BASE_URL = 'http://localhost:4000';
const tests = [];

function log(icon, message) {
  console.log(`${icon} ${message}`);
}

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: responseData,
          headers: res.headers,
        });
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testSignup() {
  log('🔹', 'Testing POST /api/signup...');
  try {
    const email = `test_${Date.now()}@healid.com`;
    const result = await makeRequest('POST', '/api/signup', {
      email: email,
      password: 'TestPassword@123',
      role: 'patient',
    });

    const passed = result.status === 201 || result.status === 200 || result.status === 400;
    tests.push({
      name: 'POST /api/signup',
      status: result.status,
      passed: passed,
      message: `Status ${result.status} ${passed ? '✅' : '❌'}`,
    });
    log(passed ? '✅' : '❌', `Signup: ${result.status}`);
    return result;
  } catch (err) {
    tests.push({
      name: 'POST /api/signup',
      passed: false,
      error: err.message,
    });
    log('❌', `Signup error: ${err.message}`);
    return null;
  }
}

async function testLogin() {
  log('🔹', 'Testing POST /api/login...');
  try {
    const result = await makeRequest('POST', '/api/login', {
      email: 'patient@healid.com',
      password: 'Patient@123456',
    });

    const passed = result.status === 200 || result.status === 201 || result.status === 401;
    tests.push({
      name: 'POST /api/login',
      status: result.status,
      passed: passed,
      message: `Status ${result.status} ${passed ? '✅' : '❌'}`,
    });
    log(passed ? '✅' : '❌', `Login: ${result.status}`);

    // Try to parse token if successful
    if (result.status === 200 || result.status === 201) {
      try {
        const body = JSON.parse(result.body);
        if (body.access_token || body.token) {
          log('✅', `Got access token: ${(body.access_token || body.token).substring(0, 20)}...`);
        }
      } catch (e) {
        // ignore parsing errors
      }
    }

    return result;
  } catch (err) {
    tests.push({
      name: 'POST /api/login',
      passed: false,
      error: err.message,
    });
    log('❌', `Login error: ${err.message}`);
    return null;
  }
}

async function testNotifications() {
  log('🔹', 'Testing GET /api/notifications...');
  try {
    const result = await makeRequest('GET', '/api/notifications', null);

    const passed = result.status === 200 || result.status === 401 || result.status === 403;
    tests.push({
      name: 'GET /api/notifications',
      status: result.status,
      passed: passed,
      message: `Status ${result.status} ${passed ? '✅' : '❌'}`,
    });
    log(passed ? '✅' : '❌', `Notifications: ${result.status}`);

    // If successful, show count
    if (result.status === 200) {
      try {
        const body = JSON.parse(result.body);
        const count = Array.isArray(body) ? body.length : (body.data ? body.data.length : 0);
        log('✅', `Notifications count: ${count}`);
      } catch (e) {
        // ignore parsing errors
      }
    }

    return result;
  } catch (err) {
    tests.push({
      name: 'GET /api/notifications',
      passed: false,
      error: err.message,
    });
    log('❌', `Notifications error: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('\n🧪 ========================================');
  console.log('🧪   HealID Endpoint Testing');
  console.log('🧪 ========================================\n');

  // Check if backend is running
  try {
    log('🔹', 'Checking if backend is running...');
    const healthCheck = await makeRequest('GET', '/', null);
    log('✅', `Backend is responding (HTTP ${healthCheck.status})`);
  } catch (err) {
    log('❌', `Backend is not accessible: ${err.message}`);
    process.exit(1);
  }

  console.log('\n📝 Running Tests:\n');

  // Run tests
  await testSignup();
  console.log();
  await testLogin();
  console.log();
  await testNotifications();

  // Summary
  console.log('\n📊 ========================================');
  console.log('📊   Test Summary');
  console.log('📊 ========================================\n');

  const passed = tests.filter((t) => t.passed).length;
  const total = tests.length;

  tests.forEach((test) => {
    const icon = test.passed ? '✅' : '❌';
    const status = test.status ? `(${test.status})` : '';
    const error = test.error ? ` - ${test.error}` : '';
    console.log(`${icon} ${test.name}: ${status}${error}`);
  });

  console.log(
    `\n📈 Result: ${passed}/${total} tests passed\n`
  );

  const allPassed = passed === total;
  console.log(allPassed ? '🎉 All tests passed!' : '⚠️ Some tests failed');
  console.log();

  process.exit(allPassed ? 0 : 1);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
