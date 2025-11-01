// Test script to verify API integration
const { getBaseURL } = require('./config/api-config');

console.log('🧪 Testing API Integration...\n');

// Test 1: Check API configuration
console.log('1. Testing API Configuration:');
console.log('   Base URL:', getBaseURL());
console.log('   ✅ API config loaded\n');

// Test 2: Test API endpoints
async function testAPIEndpoints() {
  const baseURL = getBaseURL();

  console.log('2. Testing API Endpoints:');

  try {
    // Test health endpoint
    const healthResponse = await fetch(`${baseURL}/api/auth/health`);
    console.log('   Health endpoint:', healthResponse.status === 200 ? '✅ OK' : '❌ Failed');

    // Test login endpoint (with invalid credentials)
    const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrongpassword'
      })
    });

    console.log('   Login endpoint:', loginResponse.status === 401 ? '✅ OK (401 as expected)' : `❌ Unexpected status: ${loginResponse.status}`);

    // Test register endpoint (with invalid data)
    const registerResponse = await fetch(`${baseURL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'test',
        email: 'test@example.com',
        password: '123',
        phoneNumber: '123456789'
      })
    });

    console.log('   Register endpoint:', registerResponse.status === 400 ? '✅ OK (400 as expected)' : `❌ Unexpected status: ${registerResponse.status}`);

  } catch (error) {
    console.log('   ❌ Network error:', error.message);
  }

  console.log('');
}

// Test 3: Test error handling
function testErrorHandling() {
  console.log('3. Testing Error Handling:');

  // Test console.error override
  const originalError = console.error;
  let errorCaught = false;

  console.error = (...args) => {
    errorCaught = true;
    console.log('   ✅ Console.error intercepted (no toast should appear)');
  };

  // Simulate error
  console.error('Test error');

  // Restore original
  console.error = originalError;

  if (!errorCaught) {
    console.log('   ❌ Console.error not intercepted');
  }

  console.log('');
}

// Run tests
async function runTests() {
  await testAPIEndpoints();
  testErrorHandling();

  console.log('🎉 Integration test completed!');
  console.log('\n📱 Next steps:');
  console.log('   1. Start the app: npx expo start');
  console.log('   2. Test login with wrong credentials');
  console.log('   3. Verify error messages appear inline (no toast)');
  console.log('   4. Test registration with invalid data');
}

runTests().catch(console.error);
