// Test OTP verification with correct format
async function testOtpSimple() {
  console.log('🧪 Testing OTP Verification with correct format...');

  try {
    // Test OTP verification with correct format
    console.log('\n1. Testing OTP verification...');
    const otpResponse = await fetch('http://192.168.31.117:8085/api/users/activate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'a@example.com',
        otp: '123456'
      })
    });

    console.log('   OTP Status:', otpResponse.status);
    console.log('   OTP Status Text:', otpResponse.statusText);

    const otpData = await otpResponse.text();
    console.log('   OTP Response:', otpData);

    if (otpResponse.status === 200) {
      console.log('   ✅ SUCCESS! OTP verification works');
    } else {
      console.log('   ❌ FAILED! Check the error message above');
    }

  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

testOtpSimple();
