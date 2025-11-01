// Test registration after database fix
async function testAfterFix() {
  console.log('🧪 Testing Registration After Database Fix...');

  try {
    // Test 1: Register through API Gateway
    console.log('\n1. Testing Registration through API Gateway...');
    const registerResponse = await fetch('http://192.168.31.117:8085/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'Test User Fixed',
        email: 'testfixed@example.com',
        password: '1234567',
        phoneNumber: '0123456789'
      })
    });

    console.log('   Register Status:', registerResponse.status);
    const registerData = await registerResponse.text();
    console.log('   Register Response:', registerData);

    if (registerResponse.status === 200) {
      const responseObj = JSON.parse(registerData);
      if (responseObj.accessToken) {
        console.log('   ✅ SUCCESS! Registration works');
        console.log('   📧 Check email for OTP');
        console.log('   🗄️ User should be created in database');
      } else if (responseObj.message) {
        console.log('   ❌ ERROR:', responseObj.message);
      }
    } else {
      console.log('   ❌ FAILED! Status:', registerResponse.status);
    }

    // Test 2: Try with different email
    console.log('\n2. Testing with different email...');
    const registerResponse2 = await fetch('http://192.168.31.117:8085/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'Test User 2',
        email: 'testfixed2@example.com',
        password: '1234567',
        phoneNumber: '0123456790'
      })
    });

    console.log('   Register 2 Status:', registerResponse2.status);
    const registerData2 = await registerResponse2.text();
    console.log('   Register 2 Response:', registerData2);

  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

testAfterFix();
