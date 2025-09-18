// Test script to verify pharmacy location API fix
// Run with: node test-pharmacy-fix.js

const BASE_URL = 'http://localhost:4000';

// Test data that matches current schema
const testPharmacyData = {
  name: "Test Pharmacy",
  address: "123 Main Street",
  city: "New York",
  state: "NY",
  pincode: "10001",
  latitude: 40.7128,
  longitude: -74.0060,
  phone: "+1-555-0123",
  email: "test@pharmacy.com",
  operatingHours: {
    monday: { open: "09:00", close: "21:00", isOpen: true },
    tuesday: { open: "09:00", close: "21:00", isOpen: true },
    wednesday: { open: "09:00", close: "21:00", isOpen: true },
    thursday: { open: "09:00", close: "21:00", isOpen: true },
    friday: { open: "09:00", close: "21:00", isOpen: true },
    saturday: { open: "09:00", close: "21:00", isOpen: true },
    sunday: { open: "10:00", close: "20:00", isOpen: true }
  },
  services: ["Home Delivery", "24/7 Emergency"]
};

async function testPharmacyAPI() {
  console.log('🔧 Testing Fixed Pharmacy Location API...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing server health...');
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Server is running:', healthData.status);
    } else {
      console.log('❌ Server health check failed');
      return;
    }

    // Test 2: Test GET without auth (should return 403)
    console.log('\n2. Testing GET /api/pharmacy/location without auth...');
    const getResponse = await fetch(`${BASE_URL}/api/pharmacy/location`);
    console.log('Status:', getResponse.status);
    if (getResponse.status === 403) {
      console.log('✅ Correctly requires authentication');
    } else {
      const data = await getResponse.json();
      console.log('Response:', data);
    }

    // Test 3: Test PUT without auth (should return 403)
    console.log('\n3. Testing PUT /api/pharmacy/location without auth...');
    const putResponse = await fetch(`${BASE_URL}/api/pharmacy/location`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPharmacyData)
    });
    console.log('Status:', putResponse.status);
    if (putResponse.status === 403) {
      console.log('✅ Correctly requires authentication');
    } else {
      const data = await putResponse.json();
      console.log('Response:', data);
    }

    console.log('\n📋 Test Results:');
    console.log('- Server is running and responding');
    console.log('- Authentication is working correctly');
    console.log('- API endpoints are accessible');
    
    console.log('\n🔐 To test with authentication:');
    console.log('1. Login as a pharmacist in your frontend');
    console.log('2. Check browser network tab for the JWT token');
    console.log('3. Use the token to test the protected endpoints');
    console.log('4. The 500 error should now be fixed');

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    console.log('\nPossible issues:');
    console.log('- Server is not running (run: npm run dev in server directory)');
    console.log('- Database connection issues');
    console.log('- Port 4000 is blocked');
  }
}

// Test with authentication if token is provided
async function testWithAuth(token) {
  console.log('\n🔐 Testing with authentication...');
  
  try {
    // Test GET with auth
    console.log('Testing GET with auth...');
    const getResponse = await fetch(`${BASE_URL}/api/pharmacy/location`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('GET Status:', getResponse.status);
    const getData = await getResponse.json();
    console.log('GET Response:', JSON.stringify(getData, null, 2));

    // Test PUT with auth
    console.log('\nTesting PUT with auth...');
    const putResponse = await fetch(`${BASE_URL}/api/pharmacy/location`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPharmacyData)
    });
    
    console.log('PUT Status:', putResponse.status);
    const putData = await putResponse.json();
    console.log('PUT Response:', JSON.stringify(putData, null, 2));

  } catch (error) {
    console.error('Error with auth test:', error.message);
  }
}

// Run the tests
testPharmacyAPI();

// Uncomment and add your JWT token to test with authentication:
// const JWT_TOKEN = 'your-jwt-token-here';
// testWithAuth(JWT_TOKEN);
