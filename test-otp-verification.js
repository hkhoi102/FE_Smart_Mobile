// Test OTP verification
async function testOtpVerification() {
  console.log('🧪 Testing OTP Verification...');

  try {
    // Test 1: Register a user first
    console.log('\n1. Registering user...');
    const registerResponse = await fetch('http://192.168.31.117:8085/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'Test OTP User',
        email: 'testotp@example.com',
        password: '1234567',
        phoneNumber: '0123456789'
      })
    });

    console.log('   Register Status:', registerResponse.status);
    const registerData = await registerResponse.text();
    console.log('   Register Response:', registerData);

    if (registerResponse.status === 200) {
      console.log('   ✅ Registration successful');
      console.log('   📧 Check email for OTP');

      // Test 2: Try OTP verification with wrong OTP
      console.log('\n2. Testing with wrong OTP...');
      const wrongOtpResponse = await fetch('http://192.168.31.117:8085/api/users/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'testotp@example.com',
          otp: '000000'
        })
      });

      console.log('   Wrong OTP Status:', wrongOtpResponse.status);
      const wrongOtpData = await wrongOtpResponse.text();
      console.log('   Wrong OTP Response:', wrongOtpData);

      // Test 3: Try OTP verification with correct OTP (you need to check email)
      console.log('\n3. Testing with correct OTP...');
      console.log('   📧 Please check email for the actual OTP and update the test');

      // For now, let's try with a common test OTP
      const correctOtpResponse = await fetch('http://192.168.31.117:8085/api/users/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'testotp@example.com',
          otp: '123456' // This might be the actual OTP
        })
      });

      console.log('   Correct OTP Status:', correctOtpResponse.status);
      const correctOtpData = await correctOtpResponse.text();
      console.log('   Correct OTP Response:', correctOtpData);

    } else {
      console.log('   ❌ Registration failed');
    }

  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

testOtpVerification();
