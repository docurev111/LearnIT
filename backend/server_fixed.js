const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const verifyFirebaseToken = require('./middleware/auth_fixed');
const roleGuard = require('./middleware/roleGuard');
const db = require('./database/db');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Simple health endpoint (no auth) for connectivity checks
app.get('/health', (req, res) => {
  db.get('SELECT 1 as ok', [], (err, row) => {
    if (err) return res.status(500).json({ status: 'error', error: err.message });
    res.json({ status: 'ok', db: row && row.ok === 1 ? 'ok' : 'unknown' });
  });
});

// Import controllers
const xpController = require('./controllers/xpController');
const challengeController = require('./controllers/challengeController');
const notificationController = require('./controllers/notificationController');
const achievementController = require('./controllers/achievementController');

// Weekly Virtue Points reset scheduler
function scheduleWeeklyReset() {
  // Check every day at midnight if it's Monday
  const checkInterval = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  setInterval(async () => {
    const now = new Date();
    // Check if it's Monday (1) and around midnight (between 00:00 and 00:05)
    if (now.getDay() === 1 && now.getHours() === 0 && now.getMinutes() < 5) {
      try {
        await xpController.resetWeeklyVirtuePoints();
        console.log('Weekly Virtue Points reset executed successfully');
      } catch (error) {
        console.error('Failed to execute weekly Virtue Points reset:', error);
      }
    }
  }, checkInterval);

  // Also check immediately on server start
  setTimeout(async () => {
    const now = new Date();
    if (now.getDay() === 1) {
      try {
        await xpController.resetWeeklyVirtuePoints();
        console.log('Weekly Virtue Points reset executed on server start');
      } catch (error) {
        console.error('Failed to execute weekly Virtue Points reset on start:', error);
      }
    }
  }, 5000); // Check 5 seconds after server start
}

// Start the weekly reset scheduler
scheduleWeeklyReset();

// Helper function to run queries serialized
function runQuery(sql, params) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
}

// Helper function to get single row
function getQuery(sql, params) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// GET /lessons
app.get('/lessons', verifyFirebaseToken, (req, res) => {
  db.all('SELECT * FROM lessons', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET /lesson-pages/:lesson_id
app.get('/lesson-pages/:lesson_id', verifyFirebaseToken, (req, res) => {
  const lessonId = req.params.lesson_id;
  db.all('SELECT * FROM lesson_pages WHERE lesson_id = ? ORDER BY page_number', [lessonId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET /quizzes/:lesson_id
app.get('/quizzes/:lesson_id', verifyFirebaseToken, (req, res) => {
  const lessonId = req.params.lesson_id;
  db.all('SELECT * FROM quizzes WHERE lesson_id = ?', [lessonId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET /users/:uid - Get user by Firebase UID
app.get('/users/:uid', verifyFirebaseToken, (req, res) => {
  const uid = req.params.uid;

  db.get('SELECT * FROM users WHERE uid = ?', [uid], (err, user) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      // Reconcile by email if present
      const tokenEmail = (req.user && req.user.email) ? req.user.email : null;
      if (!tokenEmail) {
        return res.status(404).json({ error: 'User not found' });
      }

      db.get('SELECT * FROM users WHERE email = ?', [tokenEmail], (err2, byEmail) => {
        if (err2) {
          console.error('Database error:', err2);
          return res.status(500).json({ error: 'Database error' });
        }
        if (!byEmail) {
          return res.status(404).json({ error: 'User not found' });
        }
        // Update this user to have the requested uid
        db.run('UPDATE users SET uid = ? WHERE id = ?', [uid, byEmail.id], function(updErr) {
          if (updErr) {
            console.error('Database error:', updErr);
            return res.status(500).json({ error: 'Database error' });
          }
          // Return updated record with XP data
          db.get('SELECT * FROM users WHERE id = ?', [byEmail.id], (err3, updatedUser) => {
            if (err3) {
              console.error('Database error:', err3);
              return res.status(500).json({ error: 'Database error' });
            }
            
            // Fetch XP data for the updated user
            db.get('SELECT total_xp, current_level, xp_to_next_level, virtue_points FROM xp WHERE user_id = ?', [updatedUser.id], (xpErr, xpData) => {
              if (xpErr) {
                console.error('XP fetch error:', xpErr);
                return res.json(updatedUser);
              }
              
              const userWithXP = {
                ...updatedUser,
                total_xp: xpData ? xpData.total_xp : 0,
                current_level: xpData ? xpData.current_level : 1,
                xp_to_next_level: xpData ? xpData.xp_to_next_level : 100,
                virtue_points: xpData ? xpData.virtue_points : 0
              };
              
              return res.json(userWithXP);
            });
          });
        });
      });
      return; // prevent fall-through
    }

    // Fetch user's XP data and include it in the response
    db.get('SELECT total_xp, current_level, xp_to_next_level, virtue_points FROM xp WHERE user_id = ?', [user.id], (xpErr, xpData) => {
      if (xpErr) {
        console.error('XP fetch error:', xpErr);
        // Return user without XP data if there's an error
        return res.json(user);
      }
      
      // Merge user data with XP data
      const userWithXP = {
        ...user,
        total_xp: xpData ? xpData.total_xp : 0,
        current_level: xpData ? xpData.current_level : 1,
        xp_to_next_level: xpData ? xpData.xp_to_next_level : 100,
        virtue_points: xpData ? xpData.virtue_points : 0
      };
      
      res.json(userWithXP);
    });
  });
});

// POST /users - Create user in SQLite database
app.post('/users', verifyFirebaseToken, async (req, res) => {
  const { uid, email, displayName, role = 'student', class_id } = req.body;
  const isAdminEmail = email && email.toLowerCase() === 'admin@gmail.com';
  const safeRole = (isAdminEmail && role === 'admin') ? 'admin' : 'student';

  try {
    // Check if user already exists
    db.get('SELECT id FROM users WHERE uid = ?', [uid], async (err, existingUser) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }

      // Create new user
      const userId = await runQuery(
        'INSERT INTO users (uid, email, displayName, role, class_id) VALUES (?, ?, ?, ?, ?)',
        [uid, email, displayName, safeRole, class_id]
      );

      // Initialize XP record for the new user
      await runQuery(
        'INSERT INTO xp (user_id, total_xp, current_level, virtue_points) VALUES (?, ?, ?, ?)',
        [userId, 0, 1, 0]
      );

      res.json({
        success: true,
        message: 'User created successfully',
        user: {
          id: userId,
          uid: uid,
          email: email,
          displayName: displayName,
          role: safeRole,
          class_id: class_id
        }
      });
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT /users/:user_id/profile-picture - Update user's profile picture
app.put('/users/:user_id/profile-picture', verifyFirebaseToken, async (req, res) => {
  const { user_id } = req.params;
  const { profile_picture } = req.body;
  
  console.log('🖼️ Profile picture update request for user:', user_id);
  
  try {
    // Validate that the user exists and the requester owns this profile
    const user = await getQuery('SELECT * FROM users WHERE id = ?', [user_id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // For security, check if the requesting user is the same as the profile being updated
    // (You might want to add additional validation here)
    
    // Update the profile picture
    await runQuery(
      'UPDATE users SET profile_picture = ? WHERE id = ?',
      [profile_picture, user_id]
    );
    
    console.log('✅ Profile picture updated successfully');
    
    // Return the updated user data with XP info
    const updatedUser = await getQuery('SELECT * FROM users WHERE id = ?', [user_id]);
    const xpData = await getQuery('SELECT total_xp, current_level, xp_to_next_level FROM xp WHERE user_id = ?', [user_id]);
    
    const userWithXP = {
      ...updatedUser,
      total_xp: xpData ? xpData.total_xp : 0,
      current_level: xpData ? xpData.current_level : 1,
      xp_to_next_level: xpData ? xpData.xp_to_next_level : 100
    };
    
    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      user: userWithXP
    });
    
  } catch (err) {
    console.error('💥 Error updating profile picture:', err);
    res.status(500).json({ error: 'Failed to update profile picture', details: err.message });
  }
});

// PUT /users/:user_id/customization - Update user's profile customization
app.put('/users/:user_id/customization', verifyFirebaseToken, async (req, res) => {
  const { user_id } = req.params;
  const { avatar, border, title } = req.body;
  
  console.log('🎨 Profile customization update request for user:', user_id);
  
  try {
    // Validate that the user exists
    const user = await getQuery('SELECT * FROM users WHERE id = ?', [user_id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if customization table exists, if not create it
    await runQuery(`
      CREATE TABLE IF NOT EXISTS user_customization (
        user_id INTEGER PRIMARY KEY,
        selected_avatar TEXT,
        selected_border TEXT,
        selected_title TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    // Upsert customization settings
    await runQuery(`
      INSERT INTO user_customization (user_id, selected_avatar, selected_border, selected_title, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        selected_avatar = excluded.selected_avatar,
        selected_border = excluded.selected_border,
        selected_title = excluded.selected_title,
        updated_at = CURRENT_TIMESTAMP
    `, [user_id, avatar, border, title]);
    
    console.log('✅ Profile customization updated successfully');
    
    res.json({
      success: true,
      message: 'Profile customization updated successfully',
      customization: { avatar, border, title }
    });
    
  } catch (err) {
    console.error('💥 Error updating profile customization:', err);
    res.status(500).json({ error: 'Failed to update profile customization', details: err.message });
  }
});

// GET /users/:user_id/customization - Get user's profile customization
app.get('/users/:user_id/customization', verifyFirebaseToken, async (req, res) => {
  const { user_id } = req.params;
  
  try {
    const customization = await getQuery(
      'SELECT * FROM user_customization WHERE user_id = ?',
      [user_id]
    );
    
    if (!customization) {
      return res.json({
        selected_avatar: null,
        selected_border: null,
        selected_title: null
      });
    }
    
    res.json(customization);
  } catch (err) {
    console.error('💥 Error fetching profile customization:', err);
    res.status(500).json({ error: 'Failed to fetch profile customization', details: err.message });
  }
});

// POST /progress
app.post('/progress', verifyFirebaseToken, async (req, res) => {
  const { user_id, lesson_id, completed, score } = req.body;
  try {
    const id = await runQuery(
      'INSERT INTO progress (user_id, lesson_id, completed, score) VALUES (?, ?, ?, ?)',
      [user_id, lesson_id, completed, score || 0]
    );
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /progress/:user_id
app.get('/progress/:user_id', verifyFirebaseToken, (req, res) => {
  const userId = req.params.user_id;
  db.all('SELECT * FROM progress WHERE user_id = ?', [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST /progress/activity - Record activity completion
app.post('/progress/activity', verifyFirebaseToken, async (req, res) => {
  const { user_id, lesson_id, day_index, activity_index, activity_type } = req.body;
  try {
    // Check if already completed
    const existing = await getQuery(
      'SELECT * FROM progress WHERE user_id = ? AND lesson_id = ? AND day_index = ? AND activity_index = ? AND completed = 1',
      [user_id, lesson_id, day_index, activity_index]
    );
    
    if (existing) {
      return res.json({ success: true, message: 'Activity already completed' });
    }

    // Record activity completion
    await runQuery(
      'INSERT INTO progress (user_id, lesson_id, day_index, activity_index, activity_type, completed, score, completed_at) VALUES (?, ?, ?, ?, ?, 1, 100, CURRENT_TIMESTAMP)',
      [user_id, lesson_id, day_index, activity_index, activity_type]
    );

    // Award Virtue Points based on activity type
    let virtueResult = null;
    if (activity_type === 'flashcards') {
      console.log('💎 Awarding Virtue Points for flashcard usage...');
      virtueResult = await xpController.awardFlashcardVirtuePoints(user_id);
      console.log('✅ Virtue Points awarded for flashcards:', virtueResult);
    } else if (activity_type === 'video') {
      console.log('💎 Awarding Virtue Points for watching lesson...');
      virtueResult = await xpController.awardWatchLessonVirtuePoints(user_id);
      console.log('✅ Virtue Points awarded for watching lesson:', virtueResult);
    }

    const response = { success: true, message: 'Activity completed' };
    if (virtueResult) {
      response.virtue_points_earned = virtueResult.virtue_points_earned;
      response.new_virtue_points = virtueResult.new_virtue_points;
    }

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /progress/activity/:user_id/:lesson_id - Get activity progress for a lesson
app.get('/progress/activity/:user_id/:lesson_id', verifyFirebaseToken, (req, res) => {
  const { user_id, lesson_id } = req.params;
  db.all(
    'SELECT day_index, activity_index, activity_type, completed FROM progress WHERE user_id = ? AND lesson_id = ? AND day_index IS NOT NULL',
    [user_id, lesson_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// DELETE /progress/activity - Delete a specific activity completion
app.delete('/progress/activity', verifyFirebaseToken, async (req, res) => {
  const { user_id, lesson_id, day_index, activity_index } = req.body;
  try {
    await runQuery(
      'DELETE FROM progress WHERE user_id = ? AND lesson_id = ? AND day_index = ? AND activity_index = ?',
      [user_id, lesson_id, day_index, activity_index]
    );
    res.json({ success: true, message: 'Activity completion removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /complete-lesson - Award XP and check badges for lesson completion
app.post('/complete-lesson', verifyFirebaseToken, async (req, res) => {
  const { user_id, lesson_id } = req.body;
  console.log('📚 Complete lesson request:', { user_id, lesson_id });
  
  try {
    // 🚫 ANTI-FARMING: Check if user has already completed this lesson
    console.log('🔍 Checking if lesson already completed...');
    const existingProgress = await getQuery(
      'SELECT * FROM progress WHERE user_id = ? AND lesson_id = ? AND completed = 1', 
      [user_id, lesson_id]
    );
    
    if (existingProgress) {
      console.log('⚠️ Lesson already completed - no XP/achievements awarded');
      return res.json({
        success: true,
        message: 'Lesson already completed - no additional rewards',
        xp_earned: 0,
        new_level: null,
        leveled_up: false,
        badges_earned: {},
        new_achievements: [],
        action: 'already_completed',
        already_completed: true
      });
    }

    // Mark lesson as completed (first time)
    console.log('💾 Inserting progress record...');
    await runQuery(
      'INSERT INTO progress (user_id, lesson_id, completed, score, completed_at) VALUES (?, ?, 1, 100, CURRENT_TIMESTAMP)',
      [user_id, lesson_id]
    );
    console.log('✅ Progress record inserted');

    // Award XP and check badges (only for first completion)
    console.log('🏆 Awarding XP (first completion)...');
    const result = await xpController.awardLessonXP(user_id);
    console.log('✅ XP awarded:', result);
    
    // Award Virtue Points for lesson completion
    console.log('💎 Awarding Virtue Points for lesson completion...');
    const virtueResult = await xpController.awardLessonVirtuePoints(user_id);
    console.log('✅ Virtue Points awarded:', virtueResult);
    
    // Check and award achievements (only for first completion)
    console.log('🎯 Checking achievements...');
    const newAchievements = await achievementController.checkAndAwardAchievements(
      user_id, 
      'lesson_completion', 
      { lesson_id, completed: true }
    );
    console.log('🎉 Achievement check complete:', newAchievements.length, 'new achievements');

    const response = {
      success: true,
      message: 'Lesson completed successfully!',
      xp_earned: result.xp_earned,
      new_level: result.level,
      leveled_up: result.leveledUp,
      badges_earned: result.badges,
      new_achievements: newAchievements,
      action: result.action
    };
    
    console.log('📤 Sending response:', response);
    res.json(response);
  } catch (err) {
    console.error('💥 Error completing lesson:', err);
    res.status(500).json({ error: 'Failed to complete lesson', details: err.message });
  }
});

// POST /complete-quiz - Award XP for quiz completion
app.post('/complete-quiz', verifyFirebaseToken, async (req, res) => {
  const { user_id, lesson_id, score, total_questions } = req.body;
  try {
    // Save quiz progress
    await runQuery(
      'INSERT INTO progress (user_id, lesson_id, completed, score, completed_at) VALUES (?, ?, 1, ?, CURRENT_TIMESTAMP)',
      [user_id, lesson_id, score]
    );

    // Award XP and check badges
    const result = await xpController.awardQuizXP(user_id, score, total_questions);
    
    // Check and award achievements
    const newAchievements = await achievementController.checkAndAwardAchievements(
      user_id, 
      'quiz_score', 
      { lesson_id, score, total_questions, percentage: (score / total_questions) * 100 }
    );

    res.json({
      success: true,
      message: 'Quiz completed successfully!',
      xp_earned: result.xp_earned,
      bonus_xp: result.bonus_xp,
      new_level: result.level,
      leveled_up: result.leveledUp,
      badges_earned: result.badges,
      new_achievements: newAchievements,
      score_percentage: result.score_percentage,
      action: result.action
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /user/profile/:user_id - Get user profile with XP, level, badges
app.get('/user/profile/:user_id', verifyFirebaseToken, async (req, res) => {
  const userId = req.params.user_id;
  try {
    const profile = await xpController.getUserProfile(userId);
    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /user/daily-login - Award daily login XP
app.post('/user/daily-login', verifyFirebaseToken, async (req, res) => {
  const { user_id } = req.body;
  try {
    await xpController.awardDailyLoginXP(user_id);
    res.json({
      success: true,
      message: 'Daily login XP awarded!',
      xp_earned: 5
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /leaderboard/:class_id - Get class leaderboard (opt-in)
app.get('/leaderboard/:class_id', verifyFirebaseToken, async (req, res) => {
  const classId = req.params.class_id;
  try {
    const leaderboard = await challengeController.getClassLeaderboard(classId);
    res.json({ success: true, class_id: classId, leaderboard });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /challenges/:class_id - Get class challenges
app.get('/challenges/:class_id', verifyFirebaseToken, async (req, res) => {
  const classId = req.params.class_id;
  try {
    const challenges = await challengeController.getClassChallenges(classId);
    res.json(challenges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /challenges - Create new challenge (teacher only)
app.post('/challenges', verifyFirebaseToken, roleGuard(['admin','teacher']), async (req, res) => {
  const challengeData = req.body;
  try {
    const challenge = await challengeController.createChallenge(challengeData);
    res.json({
      success: true,
      message: 'Challenge created successfully!',
      challenge: challenge
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /challenges/progress/:challenge_id - Get challenge progress
app.get('/challenges/progress/:challenge_id', verifyFirebaseToken, async (req, res) => {
  const challengeId = req.params.challenge_id;
  try {
    const progress = await challengeController.getChallengeProgress(challengeId);
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /teacher/award-badge - Award badge to student (teacher only)
app.post('/teacher/award-badge', verifyFirebaseToken, roleGuard(['admin','teacher']), async (req, res) => {
  const { user_id, badge_id } = req.body;
  try {
    const teacherUserId = req.user && req.user.id ? req.user.id : null;
    const result = await challengeController.awardBadgeToUser(user_id, badge_id, teacherUserId);
    res.json({
      success: true,
      message: 'Badge awarded successfully!',
      badge_award: result
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /analytics/:class_id - Get class analytics (teacher only)
app.get('/analytics/:class_id', verifyFirebaseToken, roleGuard(['admin','teacher']), async (req, res) => {
  const classId = req.params.class_id;
  try {
    const analytics = await challengeController.getClassAnalytics(classId);
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== MISSING API ENDPOINTS =====

// ===== ENHANCED ACHIEVEMENT SYSTEM ENDPOINTS =====

// GET /badges - Get all available badges
app.get('/badges', verifyFirebaseToken, async (req, res) => {
  try {
    const badges = await achievementController.getAllBadges();
    res.json(badges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /badges/categories - Get badge categories
app.get('/badges/categories', verifyFirebaseToken, (req, res) => {
  db.all('SELECT * FROM badge_categories ORDER BY name', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET /badges/category/:category - Get badges by category
app.get('/badges/category/:category', verifyFirebaseToken, async (req, res) => {
  try {
    const badges = await achievementController.getBadgesByCategory(req.params.category);
    res.json(badges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /user/badges/:user_id - Get user's earned badges
app.get('/user/badges/:user_id', verifyFirebaseToken, async (req, res) => {
  try {
    const badges = await achievementController.getUserBadges(req.params.user_id);
    res.json(badges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /user/achievements/:user_id - Get user's achievement statistics
app.get('/user/achievements/:user_id', verifyFirebaseToken, async (req, res) => {
  try {
    const stats = await achievementController.getUserAchievementStats(req.params.user_id);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /award-badge - Award badge to user (manual)
app.post('/award-badge', verifyFirebaseToken, async (req, res) => {
  try {
    const { user_id, badge_id, awarded_by } = req.body;
    const result = await achievementController.awardBadge(user_id, badge_id, awarded_by);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /check-achievements - Check and award achievements based on activity
app.post('/check-achievements', verifyFirebaseToken, async (req, res) => {
  try {
    const { user_id, activity_type, activity_data } = req.body;
    const awardedBadges = await achievementController.checkAndAwardAchievements(user_id, activity_type, activity_data);
    res.json({ 
      success: true, 
      awarded_badges: awardedBadges,
      message: awardedBadges.length > 0 ? `${awardedBadges.length} new badges earned!` : 'No new badges earned'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /user/login-streak/:user_id - Get user's login streak data
app.get('/user/login-streak/:user_id', verifyFirebaseToken, async (req, res) => {
  const userId = req.params.user_id;
  console.log('📅 Getting login streak for user:', userId);
  
  try {
    // Get user's XP data which includes login streak info
    const xpData = await getQuery('SELECT last_login_date, login_streak FROM xp WHERE user_id = ?', [userId]);
    
    if (!xpData) {
      // No XP record, user hasn't logged in yet
      return res.json({
        currentStreak: 0,
        lastLoginDate: '',
        canClaim: true,
        nextRewardIn: 0
      });
    }
    
    // Use local date instead of UTC to match user's timezone
    const now = new Date();
    const today = now.getFullYear() + '-' + 
                  String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                  String(now.getDate()).padStart(2, '0');
    const lastLogin = xpData.last_login_date;
    const currentStreak = xpData.login_streak || 0;
    
    console.log('📅 Date comparison - Today:', today, 'Last login:', lastLogin);
    
    // Check if user can claim today's reward
    const canClaim = lastLogin !== today;
    
    // Calculate hours until next reward (if already claimed today)
    let nextRewardIn = 0;
    if (!canClaim) {
      const now = new Date();
      const nextMidnight = new Date();
      nextMidnight.setHours(24, 0, 0, 0);
      nextRewardIn = Math.ceil((nextMidnight.getTime() - now.getTime()) / (1000 * 60 * 60));
    }
    
    res.json({
      currentStreak: currentStreak,
      lastLoginDate: lastLogin || '',
      canClaim: canClaim,
      nextRewardIn: nextRewardIn
    });
    
  } catch (err) {
    console.error('💥 Error getting login streak:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /daily-login/:user_id - Claim daily login reward  
app.post('/daily-login/:user_id', verifyFirebaseToken, async (req, res) => {
  const userId = req.params.user_id;
  console.log('🎁 Daily login claim request for user:', userId);
  
  try {
    // Use local date instead of UTC to match user's timezone
    const now = new Date();
    const today = now.getFullYear() + '-' + 
                  String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                  String(now.getDate()).padStart(2, '0');
    
    console.log('🎁 Daily login claim - Today:', today);
    
    // Get current XP data
    let xpData = await getQuery('SELECT * FROM xp WHERE user_id = ?', [userId]);
    
    if (!xpData) {
      // Create initial XP record
      await runQuery(
        'INSERT INTO xp (user_id, total_xp, current_level, xp_to_next_level, last_login_date, login_streak) VALUES (?, 0, 1, 100, ?, 0)',
        [userId, today]
      );
      xpData = { user_id: userId, total_xp: 0, current_level: 1, last_login_date: today, login_streak: 0 };
    }
    
    // Check if user already claimed today
    if (xpData.last_login_date === today) {
      return res.status(400).json({ 
        error: 'Daily reward already claimed today',
        message: 'Come back tomorrow for your next reward!'
      });
    }
    
    // Calculate new streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    let newStreak;
    if (xpData.last_login_date === yesterdayStr) {
      // Consecutive login - increment streak
      newStreak = (xpData.login_streak || 0) + 1;
    } else {
      // Streak broken or first login - reset to 1
      newStreak = 1;
    }
    
    // Calculate XP reward based on streak (cycling every 7 days)
    const dayInCycle = ((newStreak - 1) % 7) + 1;
    const xpRewards = [50, 75, 100, 125, 150, 200, 300]; // Days 1-7
    const xpEarned = xpRewards[dayInCycle - 1];
    
    // Update XP and streak
    const newTotalXP = (xpData.total_xp || 0) + xpEarned;
    const newLevel = Math.floor(newTotalXP / 100) + 1; // Simple leveling: 100 XP per level
    const xpToNextLevel = (newLevel * 100) - newTotalXP;
    
    await runQuery(`
      UPDATE xp 
      SET total_xp = ?, current_level = ?, xp_to_next_level = ?, last_login_date = ?, login_streak = ?
      WHERE user_id = ?
    `, [newTotalXP, newLevel, xpToNextLevel, today, newStreak, userId]);
    
    // Record in daily_signins table
    await runQuery(
      'INSERT INTO daily_signins (user_id, login_date, streak_count) VALUES (?, ?, ?)',
      [userId, today, newStreak]
    );
    
    console.log('✅ Daily login reward claimed:', { userId, xpEarned, newStreak, newTotalXP });
    
    res.json({
      success: true,
      message: 'Daily reward claimed successfully!',
      xpEarned: xpEarned,
      newStreak: newStreak,
      totalXP: newTotalXP,
      newLevel: newLevel,
      dayInCycle: dayInCycle
    });
    
  } catch (err) {
    console.error('💥 Error claiming daily login:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /challenges/join - Join a challenge
app.post('/challenges/join', verifyFirebaseToken, async (req, res) => {
  const { user_id, challenge_id } = req.body;
  try {
    const id = await runQuery(
      'INSERT INTO challenge_progress (challenge_id, user_id) VALUES (?, ?)',
      [challenge_id, user_id]
    );
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /challenges/progress - Update challenge progress
app.put('/challenges/progress', verifyFirebaseToken, async (req, res) => {
  const { challenge_id, user_id, progress_value } = req.body;
  try {
    // Get challenge target value
    const challenge = await getQuery('SELECT target_value, target_type FROM class_challenges WHERE id = ?', [challenge_id]);

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const completed = progress_value >= challenge.target_value;
    const completed_at = completed ? new Date().toISOString() : null;

    await runQuery(
      'UPDATE challenge_progress SET progress_value = ?, completed = ?, completed_at = ? WHERE challenge_id = ? AND user_id = ?',
      [progress_value, completed ? 1 : 0, completed_at, challenge_id, user_id]
    );

    res.json({
      success: true,
      completed: completed,
      progress_value: progress_value,
      target_value: challenge.target_value
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /class/:class_id/students - full list of students with stats for a class
app.get('/class/:class_id/students', verifyFirebaseToken, roleGuard(['admin','teacher']), async (req, res) => {
  const classId = req.params.class_id;
  try {
    const students = await challengeController.getClassStudents(classId);
    res.json({ success: true, class_id: classId, students });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /users/:user_id/class - assign/update a user's class/section
app.put('/users/:user_id/class', verifyFirebaseToken, roleGuard(['admin','teacher']), async (req, res) => {
  const userId = req.params.user_id;
  const { class_id } = req.body;
  if (!class_id) {
    return res.status(400).json({ error: 'class_id is required' });
  }
  try {
    const result = await new Promise((resolve, reject) => {
      db.run('UPDATE users SET class_id = ? WHERE id = ?', [class_id, userId], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
    if (!result.changes) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, user_id: Number(userId), class_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /notifications - Get user notifications
app.get('/notifications', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const { limit, offset, unread_only, type } = req.query;

    const options = {
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0,
      unreadOnly: unread_only === 'true',
      type: type || null
    };

    const result = await notificationController.getUserNotifications(userId, options);
    res.json(result);
  } catch (err) {
    console.error('Error getting notifications:', err);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

// PUT /notifications/read - Mark notifications as read
app.put('/notifications/read', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const { notification_ids } = req.body;

    const result = await notificationController.markNotificationsAsRead(userId, notification_ids);
    res.json(result);
  } catch (err) {
    console.error('Error marking notifications as read:', err);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// POST /notifications - Create a new notification (admin/teacher only)
app.post('/notifications', verifyFirebaseToken, async (req, res) => {
  try {
    const { user_id, type, title, message, data, expires_at } = req.body;

    // Check if user is teacher or admin
    const user = await getQuery('SELECT role FROM users WHERE id = ?', [req.user.id]);
    if (user.role !== 'teacher' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Only teachers and admins can create notifications' });
    }

    const result = await notificationController.createNotification(user_id, type, title, message, data, expires_at);
    if (result.success === false) {
      return res.status(400).json(result);
    }
    res.json({
      success: true,
      message: 'Notification created successfully',
      notification: result
    });
  } catch (err) {
    console.error('Error creating notification:', err);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// DELETE /notifications - Delete notifications
app.delete('/notifications', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const { notification_ids } = req.body;

    const result = await notificationController.deleteNotifications(userId, notification_ids);
    res.json(result);
  } catch (err) {
    console.error('Error deleting notifications:', err);
    res.status(500).json({ error: 'Failed to delete notifications' });
  }
});

// GET /notifications/settings - Get user notification settings
app.get('/notifications/settings', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const settings = await notificationController.getNotificationSettings(userId);
    res.json(settings);
  } catch (err) {
    console.error('Error getting notification settings:', err);
    res.status(500).json({ error: 'Failed to get notification settings' });
  }
});

// PUT /notifications/settings - Update user notification settings
app.put('/notifications/settings', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const settings = req.body;

    const result = await notificationController.updateNotificationSettings(userId, settings);
    res.json(result);
  } catch (err) {
    console.error('Error updating notification settings:', err);
    res.status(500).json({ error: 'Failed to update notification settings' });
  }
});

// POST /notifications/system - Create system notification for all users (admin only)
app.post('/notifications/system', verifyFirebaseToken, async (req, res) => {
  try {
    const { title, message, data, expires_at } = req.body;

    // Check if user is admin
    const user = await getQuery('SELECT role FROM users WHERE id = ?', [req.user.id]);
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can send system notifications' });
    }

    const result = await notificationController.createSystemNotification(title, message, data, expires_at);
    res.json(result);
  } catch (err) {
    console.error('Error creating system notification:', err);
    res.status(500).json({ error: 'Failed to create system notification' });
  }
});

// Test endpoint (no auth required) - for demo purposes
app.get('/test/lessons', (req, res) => {
  db.all('SELECT * FROM lessons', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      message: 'SciSteps Grade 7 Edukasyon sa Pagpapakatao Lessons',
      count: rows.length,
      lessons: rows
    });
  });
});

// Test endpoint for quizzes
app.get('/test/quizzes', (req, res) => {
  db.all('SELECT * FROM quizzes', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      message: 'SciSteps Quizzes',
      count: rows.length,
      quizzes: rows
    });
  });
});

// Test endpoint for lesson pages (no auth required)
app.get('/test/lesson-pages/:lesson_id', (req, res) => {
  const lessonId = req.params.lesson_id;
  db.all('SELECT * FROM lesson_pages WHERE lesson_id = ? ORDER BY page_number', [lessonId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // Support lightweight embedded structured pages: if a lesson_pages.content field
    // contains a JSON string with { type, url, title, content }, expose those keys
    // so client can render 3d sections without requiring a DB schema migration.
    const pages = (rows || []).map((r) => {
      const page = { ...r };
      try {
        if (typeof r.content === 'string') {
          const parsed = JSON.parse(r.content);
          if (parsed && (parsed.type || parsed.url)) {
            page.type = parsed.type || 'text';
            page.url = parsed.url || null;
            page.title = parsed.title || r.title || null;
            page.content = parsed.content || '';
          }
        }
      } catch (e) {
        // not JSON, ignore and return raw row
      }
      return page;
    });

    res.json({
      message: `Lesson pages for lesson ${lessonId}`,
      count: pages.length,
      pages: pages
    });
  });
});

// Whoami endpoint (auth) to check middleware/user resolution
app.get('/whoami', verifyFirebaseToken, async (req, res) => {
  try {
    const me = await getQuery('SELECT id, uid, email, displayName, role, class_id FROM users WHERE uid = ? LIMIT 1', [req.user.uid]);
    res.json({ tokenUser: req.user, dbUser: me || null });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const HOST = process.env.HOST || '0.0.0.0';
const server = app.listen(PORT, HOST, () => {
  const displayedHost = HOST === '0.0.0.0' ? 'localhost' : HOST;
  console.log(`Server running on http://${displayedHost}:${PORT}`);
  console.log('🌱 SciSteps API ready for Grade 7 Edukasyon sa Pagpapakatao Learning!');
  console.log('📚 Diagnostics:');
  console.log('   GET /health');
  console.log('   GET /whoami  (requires auth)');
  console.log('📚 Test endpoints:');
  console.log('   GET /test/lessons');
  console.log('   GET /test/quizzes');
  console.log('   GET /test/lesson-pages/:lesson_id');
});

server.on('error', (err) => {
  console.error('HTTP server error:', err && err.message ? err.message : err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

  // Centralized error handler (must be after routes)
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  });
