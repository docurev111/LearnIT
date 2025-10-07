// src/test_simple_auth.js - Simple authentication test
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testSimpleAuth() {
  console.log('🧪 Simple Authentication Test...\n');

  try {
    // Test 1: Public endpoint (should work)
    console.log('1. Testing public endpoint...');
    const publicResponse = await axios.get(`${BASE_URL}/test/lessons`);
    console.log(`   ✅ Status: ${publicResponse.status}`);
    console.log(`   ✅ Data received: ${publicResponse.data.lessons?.length || 0} lessons\n`);

    // Test 2: Protected endpoint without token (should fail)
    console.log('2. Testing protected endpoint without token...');
    const protectedResponse = await axios.get(`${BASE_URL}/lessons`, {
      validateStatus: function (status) {
        return status < 500; // Don't throw for 401
      }
    });
    console.log(`   Status: ${protectedResponse.status}`);
    console.log(`   Response: ${JSON.stringify(protectedResponse.data)}\n`);

    // Test 3: Invalid token
    console.log('3. Testing with invalid token...');
    const invalidTokenResponse = await axios.get(`${BASE_URL}/lessons`, {
      headers: { Authorization: 'Bearer invalid-token' },
      validateStatus: function (status) {
        return status < 500;
      }
    });
    console.log(`   Status: ${invalidTokenResponse.status}`);
    console.log(`   Response: ${JSON.stringify(invalidTokenResponse.data)}\n`);

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Response: ${JSON.stringify(error.response.data)}`);
    }
  }

  console.log('✅ Simple authentication test complete!');
}

testSimpleAuth().catch(console.error);
