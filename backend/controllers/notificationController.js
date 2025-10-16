// src/controllers/notificationController.js - Notification management system
const db = require('../database/db');

// Helper function to run queries
function runQuery(sql, params) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
}

// Helper function to get data
function getQuery(sql, params) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Helper function to get all data
function getAllQuery(sql, params) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Create a new notification
async function createNotification(userId, type, title, message, data = null, expiresAt = null) {
  try {
    // Check user notification settings
  const settings = await getQuery('SELECT * FROM notification_settings WHERE user_id = ?', [userId]);

    // If no settings exist, create default settings
    if (!settings) {
      await runQuery(
        'INSERT INTO notification_settings (user_id) VALUES (?)',
        [userId]
      );
    }

    // Check if this type of notification is enabled
    const finalSettings = settings || {
      achievement_notifications: 1,
      level_up_notifications: 1,
      badge_notifications: 1,
      challenge_notifications: 1,
      reminder_notifications: 1,
      system_notifications: 1
    };

    let shouldCreate = false;
    switch (type) {
      case 'achievement':
        shouldCreate = finalSettings.achievement_notifications;
        break;
      case 'level_up':
        shouldCreate = finalSettings.level_up_notifications;
        break;
      case 'badge_earned':
        shouldCreate = finalSettings.badge_notifications;
        break;
      case 'challenge_completed':
      case 'challenge_reminder':
        shouldCreate = finalSettings.challenge_notifications;
        break;
      case 'reminder':
        shouldCreate = finalSettings.reminder_notifications;
        break;
      case 'system':
        shouldCreate = finalSettings.system_notifications;
        break;
      default:
        shouldCreate = true;
    }

    if (!shouldCreate) {
      return {
        success: false,
        message: 'Notification type is disabled for this user',
        notification: null
      };
    }

    const notificationId = await runQuery(
      'INSERT INTO notifications (user_id, type, title, message, data, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, type, title, message, JSON.stringify(data), expiresAt]
    );

    return {
      id: notificationId,
      user_id: userId,
      type,
      title,
      message,
      data,
      read: false,
      created_at: new Date().toISOString()
    };
  } catch (err) {
    console.error('Error creating notification:', err);
    throw err;
  }
}

// Get user notifications
async function getUserNotifications(userId, options = {}) {
  try {
    const { limit = 50, offset = 0, unreadOnly = false, type = null } = options;

    let sql = `
      SELECT n.*, u.displayName as user_name
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      WHERE n.user_id = ?
    `;
    let params = [userId];

    if (unreadOnly) {
      sql += ' AND n.read = 0';
    }

    if (type) {
      sql += ' AND n.type = ?';
      params.push(type);
    }

    sql += ' ORDER BY n.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const notifications = await getAllQuery(sql, params);

    // Parse JSON data
    const parsedNotifications = notifications.map(notification => ({
      ...notification,
      data: notification.data ? JSON.parse(notification.data) : null
    }));

    // Get unread count
    const unreadCount = await getQuery(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0',
      [userId]
    );

    return {
      notifications: parsedNotifications,
      unread_count: unreadCount ? unreadCount.count : 0,
      total_count: notifications.length,
      has_more: notifications.length === limit
    };
  } catch (err) {
    console.error('Error getting user notifications:', err);
    throw err;
  }
}

// Mark notifications as read
async function markNotificationsAsRead(userId, notificationIds = null) {
  try {
    let sql, params;

    if (notificationIds && Array.isArray(notificationIds) && notificationIds.length > 0) {
      // Mark specific notifications as read
      const placeholders = notificationIds.map(() => '?').join(',');
      sql = `UPDATE notifications SET read = 1 WHERE user_id = ? AND id IN (${placeholders})`;
      params = [userId, ...notificationIds];
    } else {
      // Mark all user notifications as read
      sql = 'UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0';
      params = [userId];
    }

    const result = await runQuery(sql, params);

    return {
      success: true,
      message: notificationIds ? 'Selected notifications marked as read' : 'All notifications marked as read',
      updated_count: result
    };
  } catch (err) {
    console.error('Error marking notifications as read:', err);
    throw err;
  }
}

// Delete notifications
async function deleteNotifications(userId, notificationIds = null) {
  try {
    let sql, params;

    if (notificationIds && Array.isArray(notificationIds) && notificationIds.length > 0) {
      // Delete specific notifications
      const placeholders = notificationIds.map(() => '?').join(',');
      sql = `DELETE FROM notifications WHERE user_id = ? AND id IN (${placeholders})`;
      params = [userId, ...notificationIds];
    } else {
      // Delete all user notifications
      sql = 'DELETE FROM notifications WHERE user_id = ?';
      params = [userId];
    }

    const result = await runQuery(sql, params);

    return {
      success: true,
      message: notificationIds ? 'Selected notifications deleted' : 'All notifications deleted',
      deleted_count: result
    };
  } catch (err) {
    console.error('Error deleting notifications:', err);
    throw err;
  }
}

// Get user notification settings
async function getNotificationSettings(userId) {
  try {
    let settings = await getQuery('SELECT * FROM notification_settings WHERE user_id = ?', [userId]);

    if (!settings) {
      // Create default settings if they don't exist
      try {
        await runQuery(
          'INSERT INTO notification_settings (user_id) VALUES (?)',
          [userId]
        );
        settings = await getQuery('SELECT * FROM notification_settings WHERE user_id = ?', [userId]);
      } catch (insertErr) {
        console.error('Error creating default notification settings:', insertErr);
        // Return default settings if database operation fails
        settings = {
          user_id: userId,
          achievement_notifications: 1,
          level_up_notifications: 1,
          badge_notifications: 1,
          challenge_notifications: 1,
          reminder_notifications: 1,
          system_notifications: 1,
          email_notifications: 0,
          push_notifications: 1
        };
      }
    }

    // Ensure we always return a valid settings object
    return settings || {
      user_id: userId,
      achievement_notifications: 1,
      level_up_notifications: 1,
      badge_notifications: 1,
      challenge_notifications: 1,
      reminder_notifications: 1,
      system_notifications: 1,
      email_notifications: 0,
      push_notifications: 1
    };
  } catch (err) {
    console.error('Error getting notification settings:', err);
    // Return default settings if everything fails
    return {
      user_id: userId,
      achievement_notifications: 1,
      level_up_notifications: 1,
      badge_notifications: 1,
      challenge_notifications: 1,
      reminder_notifications: 1,
      system_notifications: 1,
      email_notifications: 0,
      push_notifications: 1
    };
  }
}

// Update user notification settings
async function updateNotificationSettings(userId, settings) {
  try {
    const existingSettings = await getQuery('SELECT id FROM notification_settings WHERE user_id = ?', [userId]);

    const updateData = {
      achievement_notifications: settings.achievement_notifications || 1,
      level_up_notifications: settings.level_up_notifications || 1,
      badge_notifications: settings.badge_notifications || 1,
      challenge_notifications: settings.challenge_notifications || 1,
      reminder_notifications: settings.reminder_notifications || 1,
      system_notifications: settings.system_notifications || 1,
      email_notifications: settings.email_notifications || 0,
      push_notifications: settings.push_notifications !== undefined ? settings.push_notifications : 1,
      updated_at: new Date().toISOString()
    };

    if (existingSettings) {
      // Update existing settings
      await runQuery(
        `UPDATE notification_settings SET
         achievement_notifications = ?,
         level_up_notifications = ?,
         badge_notifications = ?,
         challenge_notifications = ?,
         reminder_notifications = ?,
         system_notifications = ?,
         email_notifications = ?,
         push_notifications = ?,
         updated_at = ?
         WHERE user_id = ?`,
        [
          updateData.achievement_notifications,
          updateData.level_up_notifications,
          updateData.badge_notifications,
          updateData.challenge_notifications,
          updateData.reminder_notifications,
          updateData.system_notifications,
          updateData.email_notifications,
          updateData.push_notifications,
          updateData.updated_at,
          userId
        ]
      );
    } else {
      // Create new settings
      await runQuery(
        `INSERT INTO notification_settings (
          user_id, achievement_notifications, level_up_notifications,
          badge_notifications, challenge_notifications, reminder_notifications,
          system_notifications, email_notifications, push_notifications, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          updateData.achievement_notifications,
          updateData.level_up_notifications,
          updateData.badge_notifications,
          updateData.challenge_notifications,
          updateData.reminder_notifications,
          updateData.system_notifications,
          updateData.email_notifications,
          updateData.push_notifications,
          updateData.updated_at
        ]
      );
    }

    return {
      success: true,
      message: 'Notification settings updated successfully',
      settings: updateData
    };
  } catch (err) {
    console.error('Error updating notification settings:', err);
    throw err;
  }
}

// Clean up expired notifications
async function cleanupExpiredNotifications() {
  try {
    const result = await runQuery(
      'DELETE FROM notifications WHERE expires_at IS NOT NULL AND expires_at < datetime("now")',
      []
    );

    if (result > 0) {
      console.log(`🧹 Cleaned up ${result} expired notifications`);
    }

    return {
      success: true,
      message: 'Expired notifications cleaned up',
      deleted_count: result
    };
  } catch (err) {
    console.error('Error cleaning up expired notifications:', err);
    throw err;
  }
}

// Create system notification for all users
async function createSystemNotification(title, message, data = null, expiresAt = null) {
  try {
    // Get all user IDs
    const users = await getAllQuery('SELECT id FROM users', []);

    const notifications = [];
    for (const user of users) {
      const notification = await createNotification(
        user.id,
        'system',
        title,
        message,
        data,
        expiresAt
      );
      if (notification && notification.success !== false) {
        notifications.push(notification);
      }
    }

    return {
      success: true,
      message: `System notification sent to ${notifications.length} users`,
      notifications_sent: notifications.length
    };
  } catch (err) {
    console.error('Error creating system notification:', err);
    throw err;
  }
}

module.exports = {
  createNotification,
  getUserNotifications,
  markNotificationsAsRead,
  deleteNotifications,
  getNotificationSettings,
  updateNotificationSettings,
  cleanupExpiredNotifications,
  createSystemNotification
};
