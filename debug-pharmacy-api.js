// Debug script for pharmacy API
// Run with: node debug-pharmacy-api.js

const BASE_URL = 'http://localhost:4000';

async function testPharmacyAPI() {
  console.log('🔍 Testing Pharmacy Location API...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);

    // Test 2: Test public pharmacy endpoints
    console.log('\n2. Testing public pharmacy endpoints...');
    
    const pharmaciesResponse = await fetch(`${BASE_URL}/api/pharmacies/for-patients`);
    if (pharmaciesResponse.ok) {
      const pharmaciesData = await pharmaciesResponse.json();
      console.log('✅ Public pharmacies endpoint working:', pharmaciesData.length, 'pharmacies found');
    } else {
      console.log('❌ Public pharmacies endpoint failed:', pharmaciesResponse.status);
    }

    // Test 3: Test protected endpoint without auth (should fail with 403)
    console.log('\n3. Testing protected endpoint without auth...');
    const protectedResponse = await fetch(`${BASE_URL}/api/pharmacy/location`);
    console.log('Protected endpoint status:', protectedResponse.status);
    
    if (protectedResponse.status === 403) {
      console.log('✅ Protected endpoint correctly requires authentication');
    } else {
      const errorData = await protectedResponse.json();
      console.log('❌ Unexpected response:', errorData);
    }

    console.log('\n📋 Debug Summary:');
    console.log('- Server is running on port 4000');
    console.log('- Public endpoints are accessible');
    console.log('- Protected endpoints require authentication');
    console.log('\n🔐 To test the protected /api/pharmacy/location endpoint:');
    console.log('1. Login as a pharmacist to get a JWT token');
    console.log('2. Include the token in the Authorization header');
    console.log('3. Make sure the user has a pharmacist profile in the database');

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    console.log('\n🚨 Possible issues:');
    console.log('- Server is not running (npm run dev in server directory)');
    console.log('- Database connection issues');
    console.log('- Port 4000 is not accessible');
  }
}

// Test with authentication token (if provided)
async function testWithAuth(token) {
  console.log('\n🔐 Testing with authentication token...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/pharmacy/location`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('Error with auth test:', error.message);
  }
}

// Run the tests
testPharmacyAPI();

// If you have a JWT token, uncomment and use this:
// const JWT_TOKEN = 'your-jwt-token-here';
// testWithAuth(JWT_TOKEN);
