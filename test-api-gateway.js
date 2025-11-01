// Test script to verify API Gateway connection
const BASE_URL = 'http://localhost:8085';

async function testApiGateway() {
  console.log('🧪 Testing API Gateway Connection...\n');

  // Test 1: Health check through gateway
  try {
    console.log('1️⃣ Testing Auth Service Health Check...');
    const healthResponse = await fetch(`${BASE_URL}/api/auth/health`);
    const healthData = await healthResponse.text();
    console.log('✅ Health Check Response:', healthData);
  } catch (error) {
    console.error('❌ Health Check Failed:', error.message);
  }

  // Test 2: Test endpoint through gateway
  try {
    console.log('\n2️⃣ Testing Auth Service Test Endpoint...');
    const testResponse = await fetch(`${BASE_URL}/api/auth/test`);
    const testData = await testResponse.text();
    console.log('✅ Test Endpoint Response:', testData);
  } catch (error) {
    console.error('❌ Test Endpoint Failed:', error.message);
  }

  // Test 3: Login test
  try {
    console.log('\n3️⃣ Testing Login Endpoint...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword'
      })
    });

    const loginData = await loginResponse.json();
    console.log('✅ Login Response Status:', loginResponse.status);
    console.log('✅ Login Response Data:', loginData);
  } catch (error) {
    console.error('❌ Login Test Failed:', error.message);
  }

  console.log('\n🏁 API Gateway Test Complete!');
}

// Run the test
testApiGateway();
