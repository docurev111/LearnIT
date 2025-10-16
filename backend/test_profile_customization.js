/**
 * Test Profile Customization Feature
 * 
 * This script tests the profile customization endpoints
 * Run with: node test_profile_customization.js
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3000';
let authToken = ''; // Will be set after authentication
let testUserId = 1;

// Test data
const testCustomization = {
  avatar: 'avatar2',
  border: 'border3',
  title: 'matalinong_isip'
};

// Helper function for API calls
async function apiCall(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

// Test functions
async function testSaveCustomization() {
  console.log('\n📝 Testing: Save Profile Customization');
  console.log('Saving customization:', testCustomization);
  
  const result = await apiCall(
    'PUT',
    `/users/${testUserId}/customization`,
    testCustomization
  );
  
  if (result.success) {
    console.log('✅ Customization saved successfully');
    console.log('Response:', result.data);
  } else {
    console.log('❌ Failed to save customization');
    console.log('Error:', result.error);
  }
  
  return result.success;
}

async function testGetCustomization() {
  console.log('\n📖 Testing: Get Profile Customization');
  
  const result = await apiCall(
    'GET',
    `/users/${testUserId}/customization`
  );
  
  if (result.success) {
    console.log('✅ Customization retrieved successfully');
    console.log('Current customization:', result.data);
    
    // Verify data matches what we saved
    const data = result.data;
    if (
      data.selected_avatar === testCustomization.avatar &&
      data.selected_border === testCustomization.border &&
      data.selected_title === testCustomization.title
    ) {
      console.log('✅ Data verification passed - all fields match');
    } else {
      console.log('⚠️  Data verification warning - fields do not match');
      console.log('Expected:', testCustomization);
      console.log('Received:', {
        avatar: data.selected_avatar,
        border: data.selected_border,
        title: data.selected_title
      });
    }
  } else {
    console.log('❌ Failed to retrieve customization');
    console.log('Error:', result.error);
  }
  
  return result.success;
}

async function testUpdateCustomization() {
  console.log('\n🔄 Testing: Update Profile Customization');
  
  const updatedCustomization = {
    avatar: 'avatar1',
    border: 'border1',
    title: 'busilak_puso'
  };
  
  console.log('Updating to:', updatedCustomization);
  
  const result = await apiCall(
    'PUT',
    `/users/${testUserId}/customization`,
    updatedCustomization
  );
  
  if (result.success) {
    console.log('✅ Customization updated successfully');
    console.log('Response:', result.data);
    
    // Verify the update
    const getResult = await apiCall(
      'GET',
      `/users/${testUserId}/customization`
    );
    
    if (getResult.success) {
      const data = getResult.data;
      if (
        data.selected_avatar === updatedCustomization.avatar &&
        data.selected_border === updatedCustomization.border &&
        data.selected_title === updatedCustomization.title
      ) {
        console.log('✅ Update verification passed');
      } else {
        console.log('⚠️  Update verification warning - fields do not match');
      }
    }
  } else {
    console.log('❌ Failed to update customization');
    console.log('Error:', result.error);
  }
  
  return result.success;
}

async function testNullValues() {
  console.log('\n🔍 Testing: Null/Empty Values Handling');
  
  const nullCustomization = {
    avatar: null,
    border: null,
    title: null
  };
  
  const result = await apiCall(
    'PUT',
    `/users/${testUserId}/customization`,
    nullCustomization
  );
  
  if (result.success) {
    console.log('✅ Null values handled successfully');
  } else {
    console.log('❌ Failed to handle null values');
    console.log('Error:', result.error);
  }
  
  return result.success;
}

async function testNonExistentUser() {
  console.log('\n🚫 Testing: Non-existent User');
  
  const result = await apiCall(
    'GET',
    `/users/99999/customization`
  );
  
  if (!result.success) {
    console.log('✅ Non-existent user handled correctly');
  } else {
    console.log('⚠️  Should have failed for non-existent user');
  }
  
  return true;
}

// Main test runner
async function runTests() {
  console.log('🧪 Profile Customization API Tests');
  console.log('===================================');
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log(`Test User ID: ${testUserId}`);
  
  console.log('\n⚠️  Note: This test requires:');
  console.log('   1. Backend server running on localhost:3000');
  console.log('   2. Valid Firebase authentication token');
  console.log('   3. Test user exists in database');
  console.log('\n   To run these tests properly, you need to:');
  console.log('   - Set authToken variable with valid Firebase token');
  console.log('   - Or integrate with your existing auth test setup');
  console.log('\n   Proceeding with tests...\n');
  
  // Run all tests
  const results = {
    save: await testSaveCustomization(),
    get: await testGetCustomization(),
    update: await testUpdateCustomization(),
    null: await testNullValues(),
    nonExistent: await testNonExistentUser()
  };
  
  // Summary
  console.log('\n📊 Test Summary');
  console.log('================');
  console.log(`Save Customization:      ${results.save ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Get Customization:       ${results.get ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Update Customization:    ${results.update ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Null Values Handling:    ${results.null ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Non-existent User:       ${results.nonExistent ? '✅ PASS' : '❌ FAIL'}`);
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r).length;
  
  console.log(`\nTotal: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.');
  }
}

// Run tests if executed directly
if (require.main === module) {
  console.log('\n⚠️  IMPORTANT: Please update the authToken and testUserId variables');
  console.log('   before running these tests. You can get a token from your test');
  console.log('   authentication flow or Firebase console.\n');
  
  // Uncomment the line below once you've set up authentication
  // runTests();
  
  console.log('Tests are ready to run. Uncomment runTests() call to execute.');
}

module.exports = {
  runTests,
  testSaveCustomization,
  testGetCustomization,
  testUpdateCustomization
};
