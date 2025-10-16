// Test class students API with Virtue Points
const db = require('../backend/database/db');
const challengeController = require('../backend/controllers/challengeController');

async function testClassStudents() {
  try {
    console.log('🧪 TESTING CLASS STUDENTS API WITH VIRTUE POINTS...\n');

    // Get a class ID from the database
    const classes = await new Promise((resolve, reject) => {
      db.all('SELECT DISTINCT class_id FROM users WHERE class_id IS NOT NULL LIMIT 1', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    if (classes.length === 0) {
      console.log('❌ No classes found in database');
      return;
    }

    const classId = classes[0].class_id;
    console.log(`📚 Testing with class ID: ${classId}`);

    // Get class students data
    const students = await challengeController.getClassStudents(classId);

    console.log(`\n👨‍🎓 CLASS STUDENTS RESULTS (${students.length} students):`);
    students.forEach((student, index) => {
      console.log(`${index + 1}. ${student.displayName}: ${student.virtue_points || 0} Virtue Points, ${student.total_xp || 0} XP, Level ${student.current_level || 1}`);
    });

    console.log('\n✅ Class students API test completed successfully!');

  } catch (err) {
    console.error('❌ Error testing class students:', err);
  } finally {
    db.close();
  }
}

testClassStudents();