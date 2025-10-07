// Quick network test script
// Run this with: node test_network.js

const candidates = [
  'http://localhost:3000',
  'http://10.0.2.2:3000',
  'http://127.0.0.1:3000',
  'http://10.210.1.246:3000'
];

async function testUrl(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(url + '/health', { signal: controller.signal });
    clearTimeout(timeout);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✓ SUCCESS: ${url} - Status: ${response.status}`, data);
      return true;
    } else {
      console.log(`✗ FAILED: ${url} - Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`✗ ERROR: ${url} - ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('Testing backend connectivity...\n');
  
  for (const url of candidates) {
    await testUrl(url);
  }
  
  console.log('\nTest complete!');
}

runTests();
