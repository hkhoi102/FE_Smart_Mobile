// Test script to verify error handling
const BASE_URL = 'http://192.168.31.117:8085';

async function testErrorHandling() {
  console.log('🧪 Testing Error Handling...\n');

  // Test 1: Invalid credentials (should return 400 or 401)
  try {
    console.log('1️⃣ Testing invalid credentials...');
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      })
    });

    console.log('Response Status:', response.status);
    const data = await response.json();
    console.log('Response Data:', data);

    if (!response.ok) {
      console.log('✅ Error handling working - Status:', response.status);
      console.log('✅ Error message:', data.message || data.error || 'No message');
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  // Test 2: Missing fields (should return 400)
  try {
    console.log('\n2️⃣ Testing missing fields...');
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com'
        // Missing password
      })
    });

    console.log('Response Status:', response.status);
    const data = await response.json();
    console.log('Response Data:', data);

    if (!response.ok) {
      console.log('✅ Error handling working - Status:', response.status);
      console.log('✅ Error message:', data.message || data.error || 'No message');
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  // Test 3: Invalid email format (should return 400)
  try {
    console.log('\n3️⃣ Testing invalid email format...');
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'password123'
      })
    });

    console.log('Response Status:', response.status);
    const data = await response.json();
    console.log('Response Data:', data);

    if (!response.ok) {
      console.log('✅ Error handling working - Status:', response.status);
      console.log('✅ Error message:', data.message || data.error || 'No message');
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  // Test 4: Register with existing email (should return 409)
  try {
    console.log('\n4️⃣ Testing register with existing email...');
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'Test User',
        email: 'a@example.com', // This email already exists
        password: 'password123',
        phoneNumber: '0123456789'
      })
    });

    console.log('Response Status:', response.status);
    const data = await response.json();
    console.log('Response Data:', data);

    if (!response.ok) {
      console.log('✅ Error handling working - Status:', response.status);
      console.log('✅ Error message:', data.message || data.error || 'No message');
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n🏁 Error Handling Test Complete!');
}

testErrorHandling();
