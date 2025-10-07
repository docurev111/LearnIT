// src/database/init_db_fixed.js - Fixed database initialization
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.resolve(__dirname, '../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.resolve(dbDir, 'scisteps.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Database connection established ✅");
  }
});

db.serialize(() => {
  console.log("🔧 Initializing FIXED database schema...");

  // Drop all existing tables to start fresh
  const tables = [
    'notifications', 'notification_settings',
    'progress', 'quizzes', 'lesson_pages', 'lessons', 'users',
    'rewards', 'xp', 'badges', 'user_badges',
    'challenge_progress', 'class_challenges', 'daily_signins'
  ];

  tables.forEach(table => {
    db.run(`DROP TABLE IF EXISTS ${table}`);
  });

  // Users table
  db.run(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uid TEXT UNIQUE NOT NULL,
      displayName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT DEFAULT 'student',
      class_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Lessons table (with missing columns)
  db.run(`
    CREATE TABLE lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_id INTEGER,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      asset_url TEXT,
      duration_minutes INTEGER DEFAULT 15
    )
  `);

  // Lesson Pages table
  db.run(`
    CREATE TABLE lesson_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id INTEGER NOT NULL,
      page_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    )
  `);

  // Quizzes table (with missing columns)
  db.run(`
    CREATE TABLE quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      choices TEXT, -- JSON string for multiple choice
      correct_answer TEXT NOT NULL,
      answer TEXT NOT NULL, -- For open-ended questions
      points INTEGER DEFAULT 10,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    )
  `);

  // Progress table
  db.run(`
    CREATE TABLE progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      lesson_id INTEGER NOT NULL,
      score INTEGER,
      completed BOOLEAN DEFAULT 0,
      completed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    )
  `);

  // XP and Levels table
  db.run(`
    CREATE TABLE xp (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      total_xp INTEGER DEFAULT 0,
      current_level INTEGER DEFAULT 1,
      xp_to_next_level INTEGER DEFAULT 100,
      last_login_date DATE,
      login_streak INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Badges table (with missing columns)
  db.run(`
    CREATE TABLE badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      xp_required INTEGER DEFAULT 0,
      condition_type TEXT, -- 'lesson_completion', 'quiz_score', 'streak', 'manual'
      condition_value TEXT, -- JSON string for complex conditions
      badge_type TEXT DEFAULT 'achievement', -- 'achievement', 'milestone', 'special'
      rarity TEXT DEFAULT 'common' -- common, rare, epic, legendary
    )
  `);

  // User badges table
  db.run(`
    CREATE TABLE user_badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      badge_id INTEGER NOT NULL,
      earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      awarded_by INTEGER, -- teacher user_id for manual badges
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
      FOREIGN KEY (awarded_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Challenges table (renamed to class_challenges to match server)
  db.run(`
    CREATE TABLE class_challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      class_id TEXT NOT NULL,
      created_by INTEGER NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      target_type TEXT, -- 'lessons_completed', 'total_xp', 'quiz_score'
      target_value INTEGER,
      reward_badge_id INTEGER,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (reward_badge_id) REFERENCES badges(id) ON DELETE SET NULL
    )
  `);

  // Challenge progress table
  db.run(`
    CREATE TABLE challenge_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      challenge_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      progress_value INTEGER DEFAULT 0,
      completed BOOLEAN DEFAULT 0,
      completed_at DATETIME,
      FOREIGN KEY (challenge_id) REFERENCES class_challenges(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Daily login streak table (renamed to daily_signins to match server)
  db.run(`
    CREATE TABLE daily_signins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      login_date DATE NOT NULL,
      streak_count INTEGER DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, login_date)
    )
  `);

  // Notifications tables
  db.run(`
    CREATE TABLE notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      data TEXT,
      read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE notification_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      achievement_notifications INTEGER DEFAULT 1,
      level_up_notifications INTEGER DEFAULT 1,
      badge_notifications INTEGER DEFAULT 1,
      challenge_notifications INTEGER DEFAULT 1,
      reminder_notifications INTEGER DEFAULT 1,
      system_notifications INTEGER DEFAULT 1,
      email_notifications INTEGER DEFAULT 0,
      push_notifications INTEGER DEFAULT 1,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Rewards table (legacy - keeping for backward compatibility)
  db.run(`
    CREATE TABLE rewards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      reward_name TEXT NOT NULL,
      earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Add indexes for better performance
  db.run('CREATE INDEX idx_users_uid ON users(uid)');
  db.run('CREATE INDEX idx_users_email ON users(email)');
  db.run('CREATE INDEX idx_lessons_unit_id ON lessons(unit_id)');
  db.run('CREATE INDEX idx_progress_user_id ON progress(user_id)');
  db.run('CREATE INDEX idx_progress_lesson_id ON progress(lesson_id)');
  db.run('CREATE INDEX idx_xp_user_id ON xp(user_id)');
  db.run('CREATE INDEX idx_user_badges_user_id ON user_badges(user_id)');
  db.run('CREATE INDEX idx_notifications_user_id ON notifications(user_id)');
  db.run('CREATE INDEX idx_notifications_read ON notifications(read)');
  db.run('CREATE INDEX idx_challenge_progress_challenge_id ON challenge_progress(challenge_id)');
  db.run('CREATE INDEX idx_challenge_progress_user_id ON challenge_progress(user_id)');

  console.log("✅ Database schema fixed with all missing columns and correct table names!");
  console.log("📊 Added performance indexes");
  console.log("🔗 Fixed all foreign key relationships");
});

// Keep connection open for use by other modules
// db.close(); // Commented out to keep connection open
