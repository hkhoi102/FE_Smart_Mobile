// Debug script to test API connection
const BASE_URL = 'http://localhost:8085';

async function debugApi() {
  console.log('🔍 Debugging API Connection...\n');

  // Test 1: Basic fetch test
  try {
    console.log('1️⃣ Testing basic fetch...');
    const response = await fetch(`${BASE_URL}/api/auth/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const text = await response.text();
    console.log('Response body:', text);

  } catch (error) {
    console.error('❌ Basic fetch failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }

  // Test 2: Try with different URL
  try {
    console.log('\n2️⃣ Testing with different URL...');
    const response = await fetch('http://localhost:8085/actuator/health');
    const data = await response.json();
    console.log('✅ Gateway health:', data);
  } catch (error) {
    console.error('❌ Gateway health check failed:', error.message);
  }

  // Test 3: Check if port is open
  try {
    console.log('\n3️⃣ Testing port connectivity...');
    const response = await fetch('http://localhost:8085', {
      method: 'GET',
    });
    console.log('✅ Port 8085 is accessible, status:', response.status);
  } catch (error) {
    console.error('❌ Port 8085 not accessible:', error.message);
  }
}

debugApi();
