// src/controllers/challengeController.js - Handle class challenges and teacher features
const db = require('../database/db');

// Create a new class challenge
const createChallenge = (challengeData) => {
  return new Promise((resolve, reject) => {
    const { class_id, title, description, challenge_type, target_type, target_value, start_date, end_date, reward_badge_id, created_by } = challengeData;
    const resolvedTargetType = target_type || challenge_type || null;

    db.run(`
      INSERT INTO class_challenges (class_id, title, description, target_type, target_value, start_date, end_date, reward_badge_id, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [class_id, title, description, resolvedTargetType, target_value, start_date, end_date, reward_badge_id, created_by], function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, ...challengeData, target_type: resolvedTargetType });
    });
  });
};

// Get all challenges for a class (with participant and completion counts)
const getClassChallenges = (classId) => {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        cc.*, 
        b.name as reward_badge_name, 
        b.icon as reward_badge_icon,
        COALESCE(cp.participants_count, 0) as participants_count,
        COALESCE(ccp.completed_count, 0) as completed_count
      FROM class_challenges cc
      LEFT JOIN badges b ON cc.reward_badge_id = b.id
      LEFT JOIN (
        SELECT challenge_id, COUNT(*) as participants_count
        FROM challenge_progress
        GROUP BY challenge_id
      ) cp ON cc.id = cp.challenge_id
      LEFT JOIN (
        SELECT challenge_id, COUNT(*) as completed_count
        FROM challenge_progress
        WHERE completed = 1
        GROUP BY challenge_id
      ) ccp ON cc.id = ccp.challenge_id
      WHERE cc.class_id = ?
      ORDER BY cc.created_at DESC
    `, [classId], (err, challenges) => {
      if (err) reject(err);
      else resolve(challenges);
    });
  });
};

// Get challenge progress for all students in a class
const getChallengeProgress = (challengeId) => {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT
        u.id, u.displayName, u.email,
        CASE
          WHEN cc.target_type = 'lessons_completed' THEN COALESCE(p.lessons_completed, 0)
          WHEN cc.target_type = 'xp_earned' THEN COALESCE(x.total_xp, 0)
          WHEN cc.target_type = 'quiz_score' THEN COALESCE(p.avg_score, 0)
          ELSE 0
        END as current_value,
        CASE
          WHEN cc.target_type = 'lessons_completed' THEN (COALESCE(p.lessons_completed, 0) >= cc.target_value)
          WHEN cc.target_type = 'xp_earned' THEN (COALESCE(x.total_xp, 0) >= cc.target_value)
          WHEN cc.target_type = 'quiz_score' THEN (COALESCE(p.avg_score, 0) >= cc.target_value)
          ELSE false
        END as completed
      FROM users u
      LEFT JOIN (
        SELECT user_id, COUNT(*) as lessons_completed, AVG(score) as avg_score
        FROM progress
        WHERE completed = 1
        GROUP BY user_id
      ) p ON u.id = p.user_id
      LEFT JOIN xp x ON u.id = x.user_id
      CROSS JOIN class_challenges cc
      WHERE cc.id = ? AND u.class_id = cc.class_id AND u.role = 'student'
      ORDER BY current_value DESC
    `, [challengeId], (err, progress) => {
      if (err) reject(err);
      else resolve(progress);
    });
  });
};

// Award badge to user (teacher action)
const awardBadgeToUser = (userId, badgeId, awardedBy) => {
  return new Promise((resolve, reject) => {
    // Check if user already has this badge
    db.get('SELECT * FROM user_badges WHERE user_id = ? AND badge_id = ?', [userId, badgeId], (err, existing) => {
      if (err) reject(err);
      else if (existing) {
        reject(new Error('User already has this badge'));
      } else {
        // Award the badge
        db.run('INSERT INTO user_badges (user_id, badge_id, awarded_by) VALUES (?, ?, ?)', [userId, badgeId, awardedBy || null], function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, user_id: userId, badge_id: badgeId, awarded_by: awardedBy || null });
        });
      }
    });
  });
};

// Get class analytics
const getClassAnalytics = (classId) => {
  return new Promise((resolve, reject) => {
    const analytics = {};

    // Get student count
    db.get('SELECT COUNT(*) as count FROM users WHERE class_id = ? AND role = "student"', [classId], (err, row) => {
      if (err) reject(err);
      else {
        analytics.student_count = row.count;

        // Get average XP
        db.get('SELECT AVG(total_xp) as avg_xp FROM xp WHERE user_id IN (SELECT id FROM users WHERE class_id = ? AND role = "student")', [classId], (err, row) => {
          if (err) reject(err);
          else {
            analytics.average_xp = Math.round(row.avg_xp || 0);

            // Get average level
            db.get('SELECT AVG(current_level) as avg_level FROM xp WHERE user_id IN (SELECT id FROM users WHERE class_id = ? AND role = "student")', [classId], (err, row) => {
              if (err) reject(err);
              else {
                analytics.average_level = Math.round(row.avg_level || 0);

                // Get lesson completion rate
                db.get(`
                  SELECT
                    COUNT(CASE WHEN completed = 1 THEN 1 END) * 100.0 / COUNT(*) as completion_rate
                  FROM progress p
                  JOIN users u ON p.user_id = u.id
                  WHERE u.class_id = ?
                `, [classId], (err, row) => {
                  if (err) reject(err);
                  else {
                    analytics.lesson_completion_rate = Math.round(row.completion_rate || 0);

                    // Get top performers
                    db.all(`
                      SELECT u.displayName, x.total_xp, x.current_level, COUNT(p.id) as lessons_completed
                      FROM users u
                      LEFT JOIN xp x ON u.id = x.user_id
                      LEFT JOIN progress p ON u.id = p.user_id AND p.completed = 1
                      WHERE u.class_id = ? AND u.role = 'student'
                      GROUP BY u.id
                      ORDER BY x.total_xp DESC, x.current_level DESC
                      LIMIT 5
                    `, [classId], (err, topPerformers) => {
                      if (err) reject(err);
                      else {
                        analytics.top_performers = topPerformers;

                        // Get recent activity
                        db.all(`
                          SELECT u.displayName, 'completed lesson' as activity, l.title, p.completed_at
                          FROM progress p
                          JOIN users u ON p.user_id = u.id
                          JOIN lessons l ON p.lesson_id = l.id
                          WHERE u.class_id = ? AND p.completed = 1 AND p.completed_at >= datetime('now', '-7 days')
                          ORDER BY p.completed_at DESC
                          LIMIT 10
                        `, [classId], (err, recentActivity) => {
                          if (err) reject(err);
                          else {
                            analytics.recent_activity = recentActivity;
                            resolve(analytics);
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  });
};

// Get leaderboard for a class (opt-in only)
const getClassLeaderboard = (classId) => {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT
        u.id,
        u.displayName,
        u.email,
        u.class_id,
        u.profile_picture,
        x.total_xp,
        x.current_level,
        COUNT(p.id) as lessons_completed,
        AVG(p.score) as average_score,
        MAX(ds.streak_count) as best_streak,
        COUNT(ub.id) as badge_count
      FROM users u
      LEFT JOIN xp x ON u.id = x.user_id
      LEFT JOIN progress p ON u.id = p.user_id
      LEFT JOIN daily_signins ds ON u.id = ds.user_id
      LEFT JOIN user_badges ub ON u.id = ub.user_id
      WHERE u.class_id = ? AND u.role = 'student'
      GROUP BY u.id
      ORDER BY x.total_xp DESC, x.current_level DESC, COUNT(p.id) DESC
      LIMIT 10
    `, [classId], (err, leaderboard) => {
      if (err) reject(err);
      else resolve(leaderboard);
    });
  });
};

// Get full student list for a class with stats
const getClassStudents = (classId) => {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT
        u.id,
        u.displayName,
        u.email,
        u.class_id,
        x.total_xp,
        x.current_level,
        COUNT(p.id) as lessons_completed,
        AVG(p.score) as average_score,
        MAX(ds.streak_count) as best_streak,
        COUNT(ub.id) as badge_count
      FROM users u
      LEFT JOIN xp x ON u.id = x.user_id
      LEFT JOIN progress p ON u.id = p.user_id
      LEFT JOIN daily_signins ds ON u.id = ds.user_id
      LEFT JOIN user_badges ub ON u.id = ub.user_id
      WHERE u.class_id = ? AND u.role = 'student'
      GROUP BY u.id
      ORDER BY x.total_xp DESC, x.current_level DESC, COUNT(p.id) DESC
    `, [classId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

module.exports = {
  createChallenge,
  getClassChallenges,
  getChallengeProgress,
  awardBadgeToUser,
  getClassAnalytics,
  getClassLeaderboard,
  getClassStudents
};
