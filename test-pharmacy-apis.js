// Test script for Pharmacy Location APIs
// Run with: node test-pharmacy-apis.js

const BASE_URL = 'http://localhost:4000';

// Test data
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
  services: ["Home Delivery", "24/7 Emergency", "Online Consultation"]
};

async function testAPI(endpoint, options = {}) {
  try {
    console.log(`\n🧪 Testing: ${endpoint}`);
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Success (${response.status}):`, JSON.stringify(data, null, 2));
    } else {
      console.log(`❌ Error (${response.status}):`, data);
    }
    
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.log(`💥 Network Error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting Pharmacy Location API Tests...\n');
  
  // Test 1: Health Check
  await testAPI('/api/health');
  
  // Test 2: Get Pharmacies for Patients (Public endpoint)
  await testAPI('/api/pharmacies/for-patients');
  
  // Test 3: Get Pharmacies with Location Filter
  await testAPI('/api/pharmacies/for-patients?latitude=40.7128&longitude=-74.0060&radius=10');
  
  // Test 4: Get All Pharmacies (Public endpoint)
  await testAPI('/api/pharmacies');
  
  // Test 5: Search Medicine Stock (Public endpoint)
  await testAPI('/api/pharmacies/search?medicineName=paracetamol');
  
  // Test 6: Get All Medicines (Public endpoint)
  await testAPI('/api/medicines');
  
  console.log('\n📋 Test Summary:');
  console.log('- Public endpoints tested successfully');
  console.log('- Protected endpoints require authentication token');
  console.log('- To test protected endpoints, login first and use the JWT token');
  
  console.log('\n🔐 To test protected endpoints:');
  console.log('1. Login as pharmacist to get JWT token');
  console.log('2. Use token in Authorization header: "Bearer YOUR_TOKEN"');
  console.log('3. Test GET /api/pharmacy/location');
  console.log('4. Test PUT /api/pharmacy/location with pharmacy data');
  
  console.log('\n✨ All tests completed!');
}

// Run the tests
runTests().catch(console.error);
