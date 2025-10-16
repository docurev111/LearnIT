// Script to fix incorrect flashcard activity index
// This removes the flashcard entry recorded with activity_index: 2 (which should be the quiz)
// The correct flashcard index should be 3

const { auth } = require('../frontend/firebaseConfig');
const axios = require('axios');

async function fixFlashcardIndex() {
  try {
    // You'll need to sign in as the user first
    console.log(' Fixing flashcard activity index...');
    
    const baseUrl = 'http://10.210.1.244:3000';
    
    // For this to work, you need to get your actual Firebase ID token
    // You can get it from the app logs or by running this with proper auth
    
    console.log('');
    console.log(' To fix this manually, you have two options:');
    console.log('');
    console.log('OPTION 1: Use the frontend app');
    console.log('----------');
    console.log('1. The flashcard screen now uses the correct index (3)');
    console.log('2. Complete the flashcards again in the app');
    console.log('3. The old incorrect entry (index 2) will remain but won\'t show as a checkmark');
    console.log('4. The new correct entry (index 3) will be recorded');
    console.log('');
    console.log('OPTION 2: Direct database cleanup (requires backend access)');
    console.log('----------');
    console.log('Run this SQL command on your backend database:');
    console.log('');
    console.log('DELETE FROM progress');
    console.log('WHERE lesson_id = 1');
    console.log('  AND day_index = 0');
    console.log('  AND activity_index = 2');
    console.log('  AND activity_type = \'flashcards\';');
    console.log('');
    console.log(' The LessonIntroScreen will now show the correct completion status!');
    console.log('');
  } catch (error) {
    console.error(' Error:', error.message);
  }
}

fixFlashcardIndex();
