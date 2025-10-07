// scripts/seed_achievements.js - Insert comprehensive achievement/badge system
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../src/database', 'scisteps.db');
const db = new sqlite3.Database(dbPath);

// Helper function to run queries
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

// Helper function to get data
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

// Badge categories
const categories = [
  { name: 'Learning Mastery', description: 'Badges for lesson completion and learning progress', icon: '📚' },
  { name: 'Quiz & Assessment', description: 'Badges for quiz performance and accuracy', icon: '🎯' },
  { name: 'Consistency & Engagement', description: 'Badges for regular activity and dedication', icon: '⏰' },
  { name: 'Interactive & Engagement', description: 'Badges for using interactive features', icon: '🎮' },
  { name: 'Special Achievement', description: 'Special milestone and unique badges', icon: '🏅' },
  { name: 'Creative & Special', description: 'Creative and collection-based badges', icon: '🎨' }
];

// Comprehensive badge definitions
const badges = [
  // 📚 LEARNING MASTERY BADGES
  {
    name: 'First Steps',
    description: 'Complete your very first lesson',
    icon: '🌟',
    rarity: 'common',
    category: 'Learning Mastery',
    condition_type: 'lesson_completion',
    condition_value: JSON.stringify({ count: 1 }),
    xp_required: 0,
    badge_type: 'achievement'
  },
  {
    name: 'Knowledge Seeker',
    description: 'Complete 10 lessons across different topics',
    icon: '🎓',
    rarity: 'common',
    category: 'Learning Mastery',
    condition_type: 'lesson_completion',
    condition_value: JSON.stringify({ count: 10 }),
    xp_required: 0,
    badge_type: 'achievement'
  },
  {
    name: 'Bookworm',
    description: 'Complete an entire quarter\'s worth of lessons',
    icon: '📖',
    rarity: 'rare',
    category: 'Learning Mastery',
    condition_type: 'quarter_completion',
    condition_value: JSON.stringify({ quarter: 'first' }),
    xp_required: 0,
    badge_type: 'milestone'
  },
  {
    name: 'Speed Learner',
    description: 'Complete 5 lessons in a single day',
    icon: '⚡',
    rarity: 'rare',
    category: 'Learning Mastery',
    condition_type: 'daily_lessons',
    condition_value: JSON.stringify({ count: 5, timeframe: '24_hours' }),
    xp_required: 0,
    badge_type: 'achievement'
  },

  // 🎯 QUIZ & ASSESSMENT BADGES
  {
    name: 'Perfect Score',
    description: 'Get 100% on any quiz',
    icon: '🎪',
    rarity: 'common',
    category: 'Quiz & Assessment',
    condition_type: 'quiz_score',
    condition_value: JSON.stringify({ score: 100, count: 1 }),
    xp_required: 0,
    badge_type: 'achievement'
  },
  {
    name: 'Sharpshooter',
    description: 'Get 100% on 10 different quizzes',
    icon: '🏹',
    rarity: 'epic',
    category: 'Quiz & Assessment',
    condition_type: 'quiz_score',
    condition_value: JSON.stringify({ score: 100, count: 10 }),
    xp_required: 0,
    badge_type: 'achievement'
  },
  {
    name: 'Lucky Streak',
    description: 'Pass 5 quizzes in a row without failing',
    icon: '🎲',
    rarity: 'rare',
    category: 'Quiz & Assessment',
    condition_type: 'quiz_streak',
    condition_value: JSON.stringify({ consecutive_passes: 5 }),
    xp_required: 0,
    badge_type: 'achievement'
  },
  {
    name: 'Quiz Master',
    description: 'Maintain 85%+ average across all quizzes',
    icon: '🔥',
    rarity: 'rare',
    category: 'Quiz & Assessment',
    condition_type: 'quiz_average',
    condition_value: JSON.stringify({ average: 85, minimum_quizzes: 5 }),
    xp_required: 0,
    badge_type: 'achievement'
  },
  {
    name: 'Perfectionist',
    description: 'Never score below 90% on any quiz (minimum 10 quizzes)',
    icon: '💎',
    rarity: 'legendary',
    category: 'Quiz & Assessment',
    condition_type: 'quiz_minimum',
    condition_value: JSON.stringify({ minimum_score: 90, minimum_quizzes: 10 }),
    xp_required: 0,
    badge_type: 'achievement'
  },

  // ⏰ CONSISTENCY & ENGAGEMENT BADGES
  {
    name: 'Daily Dedication',
    description: 'Log in and complete activities for 7 days straight',
    icon: '📅',
    rarity: 'common',
    category: 'Consistency & Engagement',
    condition_type: 'login_streak',
    condition_value: JSON.stringify({ days: 7 }),
    xp_required: 0,
    badge_type: 'achievement'
  },
  {
    name: 'Night Owl',
    description: 'Complete lessons between 9 PM and 6 AM',
    icon: '🌙',
    rarity: 'rare',
    category: 'Consistency & Engagement',
    condition_type: 'time_based_learning',
    condition_value: JSON.stringify({ time_range: '21:00-06:00', count: 5 }),
    xp_required: 0,
    badge_type: 'achievement'
  },
  {
    name: 'Early Bird',
    description: 'Complete lessons between 5 AM and 8 AM',
    icon: '🌅',
    rarity: 'rare',
    category: 'Consistency & Engagement',
    condition_type: 'time_based_learning',
    condition_value: JSON.stringify({ time_range: '05:00-08:00', count: 5 }),
    xp_required: 0,
    badge_type: 'achievement'
  },
  {
    name: 'Lightning Fast',
    description: 'Complete a lesson in under 5 minutes',
    icon: '⚡',
    rarity: 'common',
    category: 'Consistency & Engagement',
    condition_type: 'lesson_speed',
    condition_value: JSON.stringify({ max_duration_minutes: 5 }),
    xp_required: 0,
    badge_type: 'achievement'
  },
  {
    name: 'Marathon Runner',
    description: 'Study for 30+ consecutive days',
    icon: '🏃',
    rarity: 'epic',
    category: 'Consistency & Engagement',
    condition_type: 'login_streak',
    condition_value: JSON.stringify({ days: 30 }),
    xp_required: 0,
    badge_type: 'milestone'
  },

  // 🎮 INTERACTIVE & ENGAGEMENT BADGES
  {
    name: 'Game Champion',
    description: 'Complete all available mini-games',
    icon: '🎯',
    rarity: 'rare',
    category: 'Interactive & Engagement',
    condition_type: 'games_completion',
    condition_value: JSON.stringify({ all_games: true }),
    xp_required: 0,
    badge_type: 'achievement'
  },
  {
    name: 'Scenario Explorer',
    description: 'Complete all 3D scenario adventures',
    icon: '🎪',
    rarity: 'rare',
    category: 'Interactive & Engagement',
    condition_type: 'scenarios_completion',
    condition_value: JSON.stringify({ all_scenarios: true }),
    xp_required: 0,
    badge_type: 'achievement'
  },

  // 🏅 SPECIAL ACHIEVEMENT BADGES
  {
    name: 'Welcome Aboard',
    description: 'Complete profile setup and first lesson',
    icon: '🎉',
    rarity: 'common',
    category: 'Special Achievement',
    condition_type: 'profile_and_lesson',
    condition_value: JSON.stringify({ profile_complete: true, lessons: 1 }),
    xp_required: 0,
    badge_type: 'milestone'
  },
  {
    name: 'Comeback Kid',
    description: 'Return after 7+ days of inactivity and complete a lesson',
    icon: '🌟',
    rarity: 'rare',
    category: 'Special Achievement',
    condition_type: 'return_activity',
    condition_value: JSON.stringify({ inactive_days: 7, completion_required: true }),
    xp_required: 0,
    badge_type: 'achievement'
  },
  {
    name: 'Drama Queen/King',
    description: 'Complete a scenario with maximum engagement',
    icon: '🎭',
    rarity: 'rare',
    category: 'Special Achievement',
    condition_type: 'scenario_engagement',
    condition_value: JSON.stringify({ engagement_level: 'maximum' }),
    xp_required: 0,
    badge_type: 'achievement'
  },
  {
    name: 'Helper',
    description: 'Share a lesson or achievement (future social feature)',
    icon: '🤝',
    rarity: 'common',
    category: 'Special Achievement',
    condition_type: 'social_sharing',
    condition_value: JSON.stringify({ shares: 5 }),
    xp_required: 0,
    badge_type: 'achievement'
  },
  {
    name: 'Class Legend',
    description: 'Rank #1 in your class for a full week',
    icon: '🏆',
    rarity: 'legendary',
    category: 'Special Achievement',
    condition_type: 'leaderboard_position',
    condition_value: JSON.stringify({ position: 1, duration_days: 7 }),
    xp_required: 0,
    badge_type: 'achievement'
  },

  // 🎨 CREATIVE & SPECIAL BADGES
  {
    name: 'Show Off',
    description: 'Display 10+ badges on your profile',
    icon: '🎪',
    rarity: 'rare',
    category: 'Creative & Special',
    condition_type: 'badge_collection',
    condition_value: JSON.stringify({ badges_earned: 10 }),
    xp_required: 0,
    badge_type: 'milestone'
  },
  {
    name: 'Collector',
    description: 'Earn badges from every category',
    icon: '🌈',
    rarity: 'epic',
    category: 'Creative & Special',
    condition_type: 'category_completion',
    condition_value: JSON.stringify({ all_categories: true }),
    xp_required: 0,
    badge_type: 'milestone'
  },
  {
    name: 'Lucky Number',
    description: 'Complete exactly 7 lessons in a day',
    icon: '🎲',
    rarity: 'rare',
    category: 'Creative & Special',
    condition_type: 'daily_lessons',
    condition_value: JSON.stringify({ count: 7, exact: true, timeframe: '24_hours' }),
    xp_required: 0,
    badge_type: 'achievement'
  }
];

async function seedAchievements() {
  try {
    await run('BEGIN TRANSACTION');
    
    console.log('🏆 Starting Achievement/Badge System Setup...\n');

    // First, create badge_categories table if it doesn't exist
    console.log('📋 Creating badge_categories table...');
    await run(`
      CREATE TABLE IF NOT EXISTS badge_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        icon TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Clear existing data to avoid duplicates
    console.log('🧹 Clearing existing badge data...');
    await run('DELETE FROM badge_categories');
    await run('DELETE FROM badges');

    // Insert badge categories
    console.log('📚 Inserting badge categories...');
    for (const category of categories) {
      await run(
        'INSERT INTO badge_categories (name, description, icon) VALUES (?, ?, ?)',
        [category.name, category.description, category.icon]
      );
      console.log(`   ✅ ${category.icon} ${category.name}`);
    }

    // Insert badges
    console.log('\n🏅 Inserting achievement badges...');
    let insertedCount = 0;
    
    for (const badge of badges) {
      await run(`
        INSERT INTO badges (
          name, description, icon, condition_type, condition_value, 
          badge_type, rarity, xp_required
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        badge.name,
        badge.description,
        badge.icon,
        badge.condition_type,
        badge.condition_value,
        badge.badge_type,
        badge.rarity,
        badge.xp_required
      ]);
      
      insertedCount++;
      console.log(`   ✅ ${badge.icon} ${badge.name} (${badge.rarity})`);
    }

    await run('COMMIT');
    
    console.log('\n🎉 Achievement System Setup Complete!');
    console.log(`📊 Statistics:`);
    console.log(`   • Categories: ${categories.length}`);
    console.log(`   • Badges: ${insertedCount}`);
    console.log(`   • Rarity Distribution:`);
    
    const rarityCount = badges.reduce((acc, badge) => {
      acc[badge.rarity] = (acc[badge.rarity] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(rarityCount).forEach(([rarity, count]) => {
      console.log(`     - ${rarity}: ${count} badges`);
    });

    console.log('\n🚀 Badge system is ready for use!');
    console.log('💡 Teachers can now award badges through the dashboard');
    console.log('🎯 Students will automatically earn badges based on their activities');

  } catch (error) {
    await run('ROLLBACK');
    console.error('❌ Error setting up achievement system:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Run the seeding function
seedAchievements().catch(console.error);