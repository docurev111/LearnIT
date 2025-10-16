// src/controllers/achievementController.js - Comprehensive achievement system controller
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

// Get all available badges
async function getAllBadges() {
  try {
    const badges = await getAllQuery(`
      SELECT b.*, bc.name as category_name, bc.icon as category_icon
      FROM badges b
      LEFT JOIN badge_categories bc ON b.badge_type = bc.name
      ORDER BY b.rarity, b.name
    `);
    return badges;
  } catch (error) {
    throw new Error(`Failed to get badges: ${error.message}`);
  }
}

// Get badges by category
async function getBadgesByCategory(category) {
  try {
    const badges = await getAllQuery(`
      SELECT * FROM badges 
      WHERE badge_type = ? OR condition_type LIKE ?
      ORDER BY rarity, name
    `, [category, `%${category}%`]);
    return badges;
  } catch (error) {
    throw new Error(`Failed to get badges by category: ${error.message}`);
  }
}

// Get user's earned badges
async function getUserBadges(userId) {
  try {
    const badges = await getAllQuery(`
      SELECT b.*, ub.earned_at, ub.awarded_by
      FROM user_badges ub
      JOIN badges b ON ub.badge_id = b.id
      WHERE ub.user_id = ?
      ORDER BY ub.earned_at DESC
    `, [userId]);
    return badges;
  } catch (error) {
    throw new Error(`Failed to get user badges: ${error.message}`);
  }
}

// Check if user already has a badge
async function userHasBadge(userId, badgeId) {
  try {
    const result = await getQuery(`
      SELECT id FROM user_badges 
      WHERE user_id = ? AND badge_id = ?
    `, [userId, badgeId]);
    return !!result;
  } catch (error) {
    throw new Error(`Failed to check user badge: ${error.message}`);
  }
}

// Award badge to user
async function awardBadge(userId, badgeId, awardedBy = null) {
  try {
    // Check if user already has this badge
    const hasBadge = await userHasBadge(userId, badgeId);
    if (hasBadge) {
      return { success: false, message: 'User already has this badge' };
    }

    // Get badge details
    const badge = await getQuery('SELECT * FROM badges WHERE id = ?', [badgeId]);
    if (!badge) {
      return { success: false, message: 'Badge not found' };
    }

    // Award the badge
    await runQuery(`
      INSERT INTO user_badges (user_id, badge_id, awarded_by)
      VALUES (?, ?, ?)
    `, [userId, badgeId, awardedBy]);

    return {
      success: true,
      message: `Badge "${badge.name}" awarded successfully!`,
      badge: badge
    };
  } catch (error) {
    throw new Error(`Failed to award badge: ${error.message}`);
  }
}

// Auto-check and award badges based on user activity
async function checkAndAwardAchievements(userId, activityType, activityData = {}) {
  try {
    console.log(`🎯 [Achievement] Checking achievements for user ${userId}, activity: ${activityType}`, activityData);
    const awardedBadges = [];

    // Get all badges that could potentially be awarded
    const potentialBadges = await getAllQuery(`
      SELECT * FROM badges 
      WHERE condition_type = ? OR condition_type LIKE ?
    `, [activityType, `%${activityType}%`]);
    
    console.log(`🏆 [Achievement] Found ${potentialBadges.length} potential badges for ${activityType}`);

    for (const badge of potentialBadges) {
      // Skip if user already has this badge
      if (await userHasBadge(userId, badge.id)) {
        continue;
      }

      const condition = JSON.parse(badge.condition_value || '{}');
      let shouldAward = false;

      // Check different achievement conditions
      switch (badge.condition_type) {
        case 'lesson_completion':
          shouldAward = await checkLessonCompletionBadge(userId, condition);
          break;
        case 'quiz_score':
          shouldAward = await checkQuizScoreBadge(userId, condition);
          break;
        case 'login_streak':
          shouldAward = await checkLoginStreakBadge(userId, condition);
          break;
        case 'daily_lessons':
          shouldAward = await checkDailyLessonsBadge(userId, condition);
          break;
        case 'quiz_average':
          shouldAward = await checkQuizAverageBadge(userId, condition);
          break;
        case 'quiz_streak':
          shouldAward = await checkQuizStreakBadge(userId, condition);
          break;
        case 'badge_collection':
          shouldAward = await checkBadgeCollectionBadge(userId, condition);
          break;
        // Add more conditions as needed
      }

      if (shouldAward) {
        console.log(`🎉 [Achievement] Awarding badge: ${badge.name} to user ${userId}`);
        const result = await awardBadge(userId, badge.id);
        if (result.success) {
          awardedBadges.push(result.badge);
          console.log(`✅ [Achievement] Successfully awarded: ${result.badge.name}`);
        }
      }
    }

    console.log(`🏁 [Achievement] Final result: ${awardedBadges.length} badges awarded`);
    return awardedBadges;
  } catch (error) {
    throw new Error(`Failed to check achievements: ${error.message}`);
  }
}

// Helper functions for specific badge conditions
async function checkLessonCompletionBadge(userId, condition) {
  const count = await getQuery(`
    SELECT COUNT(*) as count FROM progress 
    WHERE user_id = ? AND completed = 1
  `, [userId]);
  return count.count >= condition.count;
}

async function checkQuizScoreBadge(userId, condition) {
  const query = condition.count > 1 
    ? `SELECT COUNT(*) as count FROM progress WHERE user_id = ? AND score >= ?`
    : `SELECT COUNT(*) as count FROM progress WHERE user_id = ? AND score >= ? LIMIT 1`;
  
  const result = await getQuery(query, [userId, condition.score]);
  return condition.count > 1 ? result.count >= condition.count : result.count > 0;
}

async function checkLoginStreakBadge(userId, condition) {
  const streak = await getQuery(`
    SELECT login_streak FROM xp WHERE user_id = ?
  `, [userId]);
  return streak && streak.login_streak >= condition.days;
}

async function checkDailyLessonsBadge(userId, condition) {
  const today = new Date().toISOString().split('T')[0];
  const count = await getQuery(`
    SELECT COUNT(*) as count FROM progress 
    WHERE user_id = ? AND DATE(completed_at) = ?
  `, [userId, today]);
  
  if (condition.exact) {
    return count.count === condition.count;
  }
  return count.count >= condition.count;
}

async function checkQuizAverageBadge(userId, condition) {
  const avg = await getQuery(`
    SELECT AVG(score) as average, COUNT(*) as total 
    FROM progress 
    WHERE user_id = ? AND score IS NOT NULL
  `, [userId]);
  
  return avg.total >= (condition.minimum_quizzes || 1) && avg.average >= condition.average;
}

async function checkQuizStreakBadge(userId, condition) {
  // This would need more complex logic to track consecutive passes
  // For now, return false - implement when quiz streak tracking is added
  return false;
}

async function checkBadgeCollectionBadge(userId, condition) {
  const count = await getQuery(`
    SELECT COUNT(*) as count FROM user_badges WHERE user_id = ?
  `, [userId]);
  return count.count >= condition.badges_earned;
}

// Get achievement statistics for a user
async function getUserAchievementStats(userId) {
  try {
    const stats = {
      totalBadges: 0,
      badgesByRarity: {},
      badgesByCategory: {},
      recentBadges: [],
      completionPercentage: 0
    };

    // Get user's badges with details
    const userBadges = await getUserBadges(userId);
    stats.totalBadges = userBadges.length;
    stats.recentBadges = userBadges.slice(0, 5); // Last 5 badges

    // Count by rarity
    userBadges.forEach(badge => {
      stats.badgesByRarity[badge.rarity] = (stats.badgesByRarity[badge.rarity] || 0) + 1;
    });

    // Count by category
    userBadges.forEach(badge => {
      stats.badgesByCategory[badge.badge_type] = (stats.badgesByCategory[badge.badge_type] || 0) + 1;
    });

    // Calculate completion percentage
    const totalAvailableBadges = await getQuery('SELECT COUNT(*) as count FROM badges');
    stats.completionPercentage = Math.round((stats.totalBadges / totalAvailableBadges.count) * 100);

    return stats;
  } catch (error) {
    throw new Error(`Failed to get achievement stats: ${error.message}`);
  }
}

module.exports = {
  getAllBadges,
  getBadgesByCategory,
  getUserBadges,
  awardBadge,
  checkAndAwardAchievements,
  getUserAchievementStats,
  userHasBadge
};