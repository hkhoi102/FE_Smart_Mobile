// Simple test - just call the API Gateway
async function testSimple() {
  console.log('🧪 Testing API Gateway Registration...');

  try {
    // Test 1: API Gateway health
    console.log('\n1. Testing API Gateway...');
    const gatewayResponse = await fetch('http://192.168.31.117:8085/actuator/health');
    console.log('   Gateway Status:', gatewayResponse.status);
    const gatewayData = await gatewayResponse.text();
    console.log('   Gateway Response:', gatewayData);

    // Test 2: Register through API Gateway
    console.log('\n2. Testing Registration through API Gateway...');
    const registerResponse = await fetch('http://192.168.31.117:8085/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'Test User Gateway',
        email: 'testgateway@example.com',
        password: '1234567',
        phoneNumber: '0123456789'
      })
    });

    console.log('   Register Status:', registerResponse.status);
    const registerData = await registerResponse.text();
    console.log('   Register Response:', registerData);

    if (registerResponse.status === 200) {
      console.log('\n✅ SUCCESS! Registration works through API Gateway');
      console.log('📧 Check email for OTP');
      console.log('🗄️ Check database for user records');
    } else {
      console.log('\n❌ FAILED! Check API Gateway logs');
    }

  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

testSimple();
