// Test register API directly
async function testRegister() {
  console.log('🧪 Testing Register API...');

  const url = 'http://192.168.31.117:8085/api/auth/register';
  console.log('URL:', url);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'Test User',
        email: 'test@example.com',
        password: '1234567',
        phoneNumber: '0123456789'
      })
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);

    const data = await response.text();
    console.log('Response:', data);

    if (response.status === 200) {
      console.log('✅ SUCCESS! Registration works');
      console.log('📧 Check email for OTP');
    } else {
      console.log('❌ FAILED! Check logs');
    }

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testRegister();
