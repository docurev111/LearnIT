// src/controllers/xpController.js - XP and badge management
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

// Calculate level based on XP
function calculateLevel(totalXP) {
  // Level progression: 100, 200, 300, 500, 800, 1300, 2100, 3400, 5500, 8900...
  let level = 1;
  let xpRequired = 100;
  let cumulativeXP = 0;

  while (cumulativeXP + xpRequired <= totalXP) {
    cumulativeXP += xpRequired;
    level++;
    xpRequired = Math.floor(xpRequired * 1.6); // Exponential growth
  }

  return {
    level: level,
    xpToNextLevel: xpRequired,
    currentLevelXP: totalXP - cumulativeXP
  };
}

// Award XP for lesson completion
async function awardLessonXP(userId) {
  try {
    // Check if user has XP record
    let xpRecord = await getQuery('SELECT * FROM xp WHERE user_id = ?', [userId]);

    if (!xpRecord) {
      // Create XP record if it doesn't exist
      await runQuery('INSERT INTO xp (user_id, total_xp, current_level) VALUES (?, ?, ?)', [userId, 0, 1]);
      xpRecord = { total_xp: 0, current_level: 1 };
    }

    // Award 20 XP for lesson completion
    const newTotalXP = xpRecord.total_xp + 20;
    const levelInfo = calculateLevel(newTotalXP);
    const leveledUp = levelInfo.level > xpRecord.current_level;

    // Update XP record
    await runQuery(
      'UPDATE xp SET total_xp = ?, current_level = ?, xp_to_next_level = ? WHERE user_id = ?',
      [newTotalXP, levelInfo.level, levelInfo.xpToNextLevel, userId]
    );

    // Check for badges
    const badges = await checkAndAwardBadges(userId, 'lesson_completion', 1);

    return {
      xp_earned: 20,
      new_total_xp: newTotalXP,
      level: levelInfo.level,
      leveledUp: leveledUp,
      badges: badges,
      action: 'lesson_completed'
    };
  } catch (err) {
    console.error('Error awarding lesson XP:', err);
    throw err;
  }
}

// Award XP for quiz completion
async function awardQuizXP(userId, score, totalQuestions) {
  try {
    // Check if user has XP record
    let xpRecord = await getQuery('SELECT * FROM xp WHERE user_id = ?', [userId]);

    if (!xpRecord) {
      await runQuery('INSERT INTO xp (user_id, total_xp, current_level) VALUES (?, ?, ?)', [userId, 0, 1]);
      xpRecord = { total_xp: 0, current_level: 1 };
    }

    const scorePercentage = (score / totalQuestions) * 100;
    let xpEarned = 0;
    let bonusXP = 0;

    // Award XP per correct question (10 XP each)
    xpEarned = score * 10;

    // Bonus XP for high scores
    if (scorePercentage >= 80) {
      bonusXP = 50;
      xpEarned += bonusXP;
    }

    const newTotalXP = xpRecord.total_xp + xpEarned;
    const levelInfo = calculateLevel(newTotalXP);
    const leveledUp = levelInfo.level > xpRecord.current_level;

    // Update XP record
    await runQuery(
      'UPDATE xp SET total_xp = ?, current_level = ?, xp_to_next_level = ? WHERE user_id = ?',
      [newTotalXP, levelInfo.level, levelInfo.xpToNextLevel, userId]
    );

    // Check for badges
    const badges = await checkAndAwardBadges(userId, 'quiz_score', scorePercentage);

    return {
      xp_earned: xpEarned,
      bonus_xp: bonusXP,
      new_total_xp: newTotalXP,
      level: levelInfo.level,
      leveledUp: leveledUp,
      badges: badges,
      score_percentage: scorePercentage,
      action: 'quiz_completed'
    };
  } catch (err) {
    console.error('Error awarding quiz XP:', err);
    throw err;
  }
}

// Award daily login XP
async function awardDailyLoginXP(userId) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Check if user has XP record
    let xpRecord = await getQuery('SELECT * FROM xp WHERE user_id = ?', [userId]);

    if (!xpRecord) {
      await runQuery('INSERT INTO xp (user_id, total_xp, current_level) VALUES (?, ?, ?)', [userId, 0, 1]);
      xpRecord = { total_xp: 0, current_level: 1 };
    }

    // Check if already logged in today
  const todayLogin = await getQuery('SELECT * FROM daily_signins WHERE user_id = ? AND login_date = ?', [userId, today]);

    if (todayLogin) {
      return { xp_earned: 0, message: 'Already logged in today' };
    }

    // Check yesterday's login to maintain streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

  const yesterdayLogin = await getQuery('SELECT * FROM daily_signins WHERE user_id = ? AND login_date = ?', [userId, yesterdayStr]);

    let streakCount = 1;
    if (yesterdayLogin) {
      streakCount = yesterdayLogin.streak_count + 1;
    }

    // Insert today's login
  await runQuery('INSERT INTO daily_signins (user_id, login_date, streak_count) VALUES (?, ?, ?)', [userId, today, streakCount]);

    // Update XP record with streak
    await runQuery('UPDATE xp SET login_streak = ?, last_login_date = ? WHERE user_id = ?', [streakCount, today, userId]);

    // Award XP (5 XP base + streak bonus)
    let xpEarned = 5;
    if (streakCount >= 7) {
      xpEarned += 50; // 7-day streak bonus
    }

    const newTotalXP = xpRecord.total_xp + xpEarned;
    const levelInfo = calculateLevel(newTotalXP);
    const leveledUp = levelInfo.level > xpRecord.current_level;

    // Update XP record
    await runQuery(
      'UPDATE xp SET total_xp = ?, current_level = ?, xp_to_next_level = ? WHERE user_id = ?',
      [newTotalXP, levelInfo.level, levelInfo.xpToNextLevel, userId]
    );

    // Check for streak badges
    const badges = await checkAndAwardBadges(userId, 'streak', streakCount);

    return {
      xp_earned: xpEarned,
      new_total_xp: newTotalXP,
      level: levelInfo.level,
      leveledUp: leveledUp,
      badges: badges,
      streak_count: streakCount,
      action: 'daily_login'
    };
  } catch (err) {
    console.error('Error awarding daily login XP:', err);
    throw err;
  }
}

// Check and award badges based on conditions
async function checkAndAwardBadges(userId, conditionType, conditionValue) {
  try {
    const badges = [];

    // Get all badges that match the condition
    let badgeQuery = 'SELECT * FROM badges WHERE condition_type = ?';
    let badgeParams = [conditionType];

    if (conditionType === 'lesson_completion') {
      badgeQuery += ' AND condition_value <= ?';
      badgeParams.push(conditionValue);
    } else if (conditionType === 'quiz_score') {
      badgeQuery += ' AND condition_value <= ?';
      badgeParams.push(conditionValue);
    } else if (conditionType === 'streak') {
      badgeQuery += ' AND condition_value <= ?';
      badgeParams.push(conditionValue);
    }

    const availableBadges = await getAllQuery(badgeQuery, badgeParams);

    for (const badge of availableBadges) {
      // Check if user already has this badge
      const existingBadge = await getQuery('SELECT * FROM user_badges WHERE user_id = ? AND badge_id = ?', [userId, badge.id]);

      if (!existingBadge) {
        // Award the badge
        await runQuery('INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)', [userId, badge.id]);
        badges.push({
          id: badge.id,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          rarity: badge.rarity
        });
      }
    }

    return badges;
  } catch (err) {
    console.error('Error checking badges:', err);
    return [];
  }
}

// Get user profile with XP, level, and badges
async function getUserProfile(userId) {
  try {
    const user = await getQuery('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) return null;

    const xpRecord = await getQuery('SELECT * FROM xp WHERE user_id = ?', [userId]);
    const badges = await getAllQuery(`
      SELECT b.*, ub.earned_at
      FROM user_badges ub
      JOIN badges b ON ub.badge_id = b.id
      WHERE ub.user_id = ?
      ORDER BY ub.earned_at DESC
    `, [userId]);

    const levelInfo = xpRecord ? calculateLevel(xpRecord.total_xp) : { level: 1, xpToNextLevel: 100, currentLevelXP: 0 };

    return {
      user: {
        id: user.id,
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        role: user.role,
        class_id: user.class_id
      },
      xp: {
        total_xp: xpRecord ? xpRecord.total_xp : 0,
        current_level: xpRecord ? xpRecord.current_level : 1,
        xp_to_next_level: levelInfo.xpToNextLevel,
        current_level_xp: levelInfo.currentLevelXP,
        login_streak: xpRecord ? xpRecord.login_streak : 0,
        virtue_points: xpRecord ? xpRecord.virtue_points : 0
      },
      badges: badges,
      level_info: levelInfo
    };
  } catch (err) {
    console.error('Error getting user profile:', err);
    throw err;
  }
}

// Award Virtue Points for lesson completion (+5 points)
async function awardLessonVirtuePoints(userId) {
  try {
    // Check if user has XP record
    let xpRecord = await getQuery('SELECT * FROM xp WHERE user_id = ?', [userId]);

    if (!xpRecord) {
      await runQuery('INSERT INTO xp (user_id, total_xp, current_level, virtue_points, weekly_virtue_points) VALUES (?, ?, ?, ?, ?)', [userId, 0, 1, 0, 0]);
      xpRecord = { virtue_points: 0, weekly_virtue_points: 0 };
    }

    const virtuePointsEarned = 5;
    const newVirtuePoints = (xpRecord.virtue_points || 0) + virtuePointsEarned;
    const newWeeklyVirtuePoints = (xpRecord.weekly_virtue_points || 0) + virtuePointsEarned;

    // Update virtue points
    await runQuery(
      'UPDATE xp SET virtue_points = ?, weekly_virtue_points = ? WHERE user_id = ?',
      [newVirtuePoints, newWeeklyVirtuePoints, userId]
    );

    return {
      virtue_points_earned: virtuePointsEarned,
      new_virtue_points: newVirtuePoints,
      new_weekly_virtue_points: newWeeklyVirtuePoints,
      action: 'lesson_completed'
    };
  } catch (err) {
    console.error('Error awarding lesson virtue points:', err);
    throw err;
  }
}

// Award Virtue Points for flashcard usage (+5 points)
async function awardFlashcardVirtuePoints(userId) {
  try {
    // Check if user has XP record
    let xpRecord = await getQuery('SELECT * FROM xp WHERE user_id = ?', [userId]);

    if (!xpRecord) {
      await runQuery('INSERT INTO xp (user_id, total_xp, current_level, virtue_points, weekly_virtue_points) VALUES (?, ?, ?, ?, ?)', [userId, 0, 1, 0, 0]);
      xpRecord = { virtue_points: 0, weekly_virtue_points: 0 };
    }

    const virtuePointsEarned = 5;
    const newVirtuePoints = (xpRecord.virtue_points || 0) + virtuePointsEarned;
    const newWeeklyVirtuePoints = (xpRecord.weekly_virtue_points || 0) + virtuePointsEarned;

    // Update virtue points
    await runQuery(
      'UPDATE xp SET virtue_points = ?, weekly_virtue_points = ? WHERE user_id = ?',
      [newVirtuePoints, newWeeklyVirtuePoints, userId]
    );

    return {
      virtue_points_earned: virtuePointsEarned,
      new_virtue_points: newVirtuePoints,
      new_weekly_virtue_points: newWeeklyVirtuePoints,
      action: 'flashcard_used'
    };
  } catch (err) {
    console.error('Error awarding flashcard virtue points:', err);
    throw err;
  }
}

// Award Virtue Points for watching full lessons (+10 points)
async function awardWatchLessonVirtuePoints(userId) {
  try {
    // Check if user has XP record
    let xpRecord = await getQuery('SELECT * FROM xp WHERE user_id = ?', [userId]);

    if (!xpRecord) {
      await runQuery('INSERT INTO xp (user_id, total_xp, current_level, virtue_points, weekly_virtue_points) VALUES (?, ?, ?, ?, ?)', [userId, 0, 1, 0, 0]);
      xpRecord = { virtue_points: 0, weekly_virtue_points: 0 };
    }

    const virtuePointsEarned = 10;
    const newVirtuePoints = (xpRecord.virtue_points || 0) + virtuePointsEarned;
    const newWeeklyVirtuePoints = (xpRecord.weekly_virtue_points || 0) + virtuePointsEarned;

    // Update virtue points
    await runQuery(
      'UPDATE xp SET virtue_points = ?, weekly_virtue_points = ? WHERE user_id = ?',
      [newVirtuePoints, newWeeklyVirtuePoints, userId]
    );

    return {
      virtue_points_earned: virtuePointsEarned,
      new_virtue_points: newVirtuePoints,
      new_weekly_virtue_points: newWeeklyVirtuePoints,
      action: 'lesson_watched'
    };
  } catch (err) {
    console.error('Error awarding watch lesson virtue points:', err);
    throw err;
  }
}

// Reset weekly Virtue Points every Monday
async function resetWeeklyVirtuePoints() {
  try {
    // Calculate the start of the current week (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    const weekStartDate = monday.toISOString().split('T')[0]; // YYYY-MM-DD format

    // Reset weekly virtue points and update week start date
    await runQuery(
      'UPDATE xp SET weekly_virtue_points = 0, week_start_date = ?',
      [weekStartDate]
    );

    console.log(`Weekly Virtue Points reset completed for week starting ${weekStartDate}`);
    return { success: true, week_start_date: weekStartDate };
  } catch (err) {
    console.error('Error resetting weekly virtue points:', err);
    throw err;
  }
}

module.exports = {
  awardLessonXP,
  awardQuizXP,
  awardDailyLoginXP,
  awardLessonVirtuePoints,
  awardFlashcardVirtuePoints,
  awardWatchLessonVirtuePoints,
  resetWeeklyVirtuePoints,
  checkAndAwardBadges,
  getUserProfile,
  calculateLevel
};
