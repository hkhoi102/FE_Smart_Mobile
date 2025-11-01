// Test script to verify connection with your actual IP
const YOUR_IP = '192.168.31.117';

async function testConnection() {
  console.log('🧪 Testing connection with your IP:', YOUR_IP);
  console.log('');

  // Test 1: API Gateway
  try {
    console.log('1️⃣ Testing API Gateway...');
    const gatewayResponse = await fetch(`http://${YOUR_IP}:8085/api/auth/health`);
    const gatewayData = await gatewayResponse.text();
    console.log('✅ API Gateway Response:', gatewayData);
  } catch (error) {
    console.error('❌ API Gateway Failed:', error.message);
  }

  // Test 2: Direct Auth Service
  try {
    console.log('\n2️⃣ Testing Direct Auth Service...');
    const authResponse = await fetch(`http://${YOUR_IP}:8081/api/auth/health`);
    const authData = await authResponse.text();
    console.log('✅ Direct Auth Service Response:', authData);
  } catch (error) {
    console.error('❌ Direct Auth Service Failed:', error.message);
  }

  // Test 3: Login test through API Gateway
  try {
    console.log('\n3️⃣ Testing Login through API Gateway...');
    const loginResponse = await fetch(`http://${YOUR_IP}:8085/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'a@example.com',
        password: '123456'
      })
    });

    const loginData = await loginResponse.json();
    console.log('✅ Login Response Status:', loginResponse.status);
    console.log('✅ Login Response Data:', loginData);
  } catch (error) {
    console.error('❌ Login Test Failed:', error.message);
  }

  // Test 4: Login test direct to auth service
  try {
    console.log('\n4️⃣ Testing Login Direct to Auth Service...');
    const directLoginResponse = await fetch(`http://${YOUR_IP}:8081/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'a@example.com',
        password: '123456'
      })
    });

    const directLoginData = await directLoginResponse.json();
    console.log('✅ Direct Login Response Status:', directLoginResponse.status);
    console.log('✅ Direct Login Response Data:', directLoginData);
  } catch (error) {
    console.error('❌ Direct Login Test Failed:', error.message);
  }

  console.log('\n🏁 Connection Test Complete!');
  console.log('\n📱 For mobile app:');
  console.log('- API Gateway: http://' + YOUR_IP + ':8085');
  console.log('- Direct Auth: http://' + YOUR_IP + ':8081');
}

testConnection();
