const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./src/database/scisteps.db');

// Test the leaderboard query with profile pictures
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
  WHERE u.class_id = 'class-7a' AND u.role = 'student'
  GROUP BY u.id
  ORDER BY x.total_xp DESC, x.current_level DESC, COUNT(p.id) DESC
  LIMIT 10
`, (err, leaderboard) => {
  if (err) {
    console.error('Error querying leaderboard:', err.message);
    return;
  }
  console.log('\nLeaderboard data for class-7a:');
  console.log(leaderboard);
  
  console.log('\nYou should now appear as #1 with 270 XP!');
  db.close();
});