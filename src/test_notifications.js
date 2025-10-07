// src/test_notifications.js - Test the notification system
const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_USER_ID = 1; // This should be a valid user ID from your database

// Mock Firebase token for testing (replace with actual token)
const MOCK_FIREBASE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJ0ZXN0LXVzZXItaWQiLCJlbWFpbCI6InRlc3R1c2VyQGV4YW1wbGUuY29tIiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTUxNjIzOTAyMn0.mock-signature';

// Helper function to make authenticated requests
async function makeAuthRequest(method, url, data = null) {
  try {
    const response = await axios({
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Authorization': `Bearer ${MOCK_FIREBASE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      data
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Error ${method} ${url}:`, error.response?.data || error.message);
    return null;
  }
}

// Test the notification system
async function testNotificationSystem() {
  console.log('🔔 Testing Notification System...\n');

  // Test 1: Get user notifications (should be empty initially)
  console.log('📥 Test 1: Get user notifications');
  const notifications = await makeAuthRequest('GET', '/notifications');
  console.log('   Response:', notifications);
  console.log('');

  // Test 2: Get notification settings
  console.log('⚙️  Test 2: Get notification settings');
  const settings = await makeAuthRequest('GET', '/notifications/settings');
  console.log('   Response:', settings);
  console.log('');

  // Test 3: Create a test notification (requires teacher/admin role)
  console.log('📝 Test 3: Create test notification');
  const newNotification = await makeAuthRequest('POST', '/notifications', {
    user_id: TEST_USER_ID,
    type: 'achievement',
    title: 'Test Achievement',
    message: 'This is a test notification to verify the system works!',
    data: {
      achievement_type: 'test_badge',
      points: 100
    }
  });
  console.log('   Response:', newNotification);
  console.log('');

  // Test 4: Get notifications again (should now have the test notification)
  console.log('📥 Test 4: Get notifications after creating test notification');
  const notificationsAfter = await makeAuthRequest('GET', '/notifications');
  console.log('   Response:', notificationsAfter);
  console.log('');

  // Test 5: Get unread notifications only
  console.log('📥 Test 5: Get unread notifications only');
  const unreadNotifications = await makeAuthRequest('GET', '/notifications?unread_only=true');
  console.log('   Response:', unreadNotifications);
  console.log('');

  // Test 6: Mark notifications as read
  console.log('✅ Test 6: Mark notifications as read');
  if (notificationsAfter && notificationsAfter.notifications && notificationsAfter.notifications.length > 0) {
    const notificationIds = notificationsAfter.notifications.map(n => n.id);
    const markReadResult = await makeAuthRequest('PUT', '/notifications/read', {
      notification_ids: notificationIds
    });
    console.log('   Response:', markReadResult);
    console.log('');
  }

  // Test 7: Get notifications after marking as read
  console.log('📥 Test 7: Get notifications after marking as read');
  const notificationsAfterRead = await makeAuthRequest('GET', '/notifications');
  console.log('   Response:', notificationsAfterRead);
  console.log('');

  // Test 8: Update notification settings
  console.log('⚙️  Test 8: Update notification settings');
  const updatedSettings = await makeAuthRequest('PUT', '/notifications/settings', {
    achievement_notifications: 1,
    level_up_notifications: 1,
    badge_notifications: 0, // Disable badge notifications
    challenge_notifications: 1,
    reminder_notifications: 1,
    system_notifications: 1,
    email_notifications: 0,
    push_notifications: 1
  });
  console.log('   Response:', updatedSettings);
  console.log('');

  // Test 9: Get updated settings
  console.log('⚙️  Test 9: Get updated notification settings');
  const finalSettings = await makeAuthRequest('GET', '/notifications/settings');
  console.log('   Response:', finalSettings);
  console.log('');

  // Test 10: Delete notifications
  console.log('🗑️  Test 10: Delete notifications');
  if (notificationsAfterRead && notificationsAfterRead.notifications && notificationsAfterRead.notifications.length > 0) {
    const notificationIds = notificationsAfterRead.notifications.map(n => n.id);
    const deleteResult = await makeAuthRequest('DELETE', '/notifications', {
      notification_ids: notificationIds
    });
    console.log('   Response:', deleteResult);
    console.log('');
  }

  // Test 11: Get notifications after deletion
  console.log('📥 Test 11: Get notifications after deletion');
  const finalNotifications = await makeAuthRequest('GET', '/notifications');
  console.log('   Response:', finalNotifications);
  console.log('');

  console.log('🎉 Notification system testing completed!');
}

// Test system notification (admin only)
async function testSystemNotification() {
  console.log('📢 Testing System Notification (Admin Only)...\n');

  const systemNotification = await makeAuthRequest('POST', '/notifications/system', {
    title: 'System Maintenance Notice',
    message: 'The system will be undergoing maintenance tonight from 2-4 AM. Please save your work.',
    data: {
      maintenance_type: 'scheduled',
      duration: '2 hours'
    },
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Expires in 24 hours
  });

  console.log('   Response:', systemNotification);
  console.log('');
}

// Run all tests
async function runAllTests() {
  try {
    await testNotificationSystem();
    await testSystemNotification();
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testNotificationSystem,
  testSystemNotification,
  runAllTests
};
