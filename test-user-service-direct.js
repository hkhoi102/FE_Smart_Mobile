// Test user-service directly
async function testUserServiceDirect() {
  console.log('🧪 Testing User Service Direct...');

  try {
    // Test 1: User service health
    console.log('\n1. Testing User Service Health...');
    const userHealth = await fetch('http://192.168.31.117:8082/api/users/health');
    console.log('   User Service Health Status:', userHealth.status);
    const userHealthText = await userHealth.text();
    console.log('   User Service Health Response:', userHealthText);

    // Test 2: Register directly to user-service
    console.log('\n2. Testing Register directly to User Service...');
    const userRegisterResponse = await fetch('http://192.168.31.117:8082/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'Test User Direct',
        email: 'testuserdirect@example.com',
        password: '1234567',
        phoneNumber: '0123456789'
      })
    });

    console.log('   User Service Register Status:', userRegisterResponse.status);
    const userRegisterData = await userRegisterResponse.text();
    console.log('   User Service Register Response:', userRegisterData);

    // Test 3: Auth service through gateway
    console.log('\n3. Testing Auth Service through Gateway...');
    const authRegisterResponse = await fetch('http://192.168.31.117:8085/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'Test User Auth',
        email: 'testuserauth@example.com',
        password: '1234567',
        phoneNumber: '0123456789'
      })
    });

    console.log('   Auth Service Register Status:', authRegisterResponse.status);
    const authRegisterData = await authRegisterResponse.text();
    console.log('   Auth Service Register Response:', authRegisterData);

    console.log('\n🔍 Analysis:');
    if (userRegisterResponse.status === 200 && authRegisterResponse.status === 200) {
      console.log('   ✅ Both User Service and Auth Service work');
      console.log('   📧 Check email for OTP');
    } else if (userRegisterResponse.status === 200) {
      console.log('   ✅ User Service works directly');
      console.log('   ❌ Auth Service has issue calling User Service');
      console.log('   💡 Check auth-service logs for connection issues');
    } else {
      console.log('   ❌ User Service not working');
      console.log('   🔧 Check if user-service is running on port 8082');
    }

  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

testUserServiceDirect();
