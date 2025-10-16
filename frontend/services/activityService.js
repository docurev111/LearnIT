import axios from 'axios';
import { auth } from '../firebaseConfig';
import pickApiBase from '../config/api_probe';

// Simple in-memory cache to prevent duplicate requests
const requestCache = new Map();
const CACHE_DURATION = 5000; // 5 seconds

// Request queue to process requests sequentially
let requestQueue = Promise.resolve();

/**
 * Records activity completion for a specific lesson activity
 * @param {number} lessonId - The lesson ID
 * @param {number} dayIndex - The day index (0-based)
 * @param {number} activityIndex - The activity index within the day (0-based)
 * @param {string} activityType - The type of activity ('video', 'reading', 'flashcards', 'quiz')
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const recordActivityCompletion = async (lessonId, dayIndex, activityIndex, activityType) => {
  // Create a unique key for this activity completion request
  const cacheKey = `activity_${lessonId}_${dayIndex}_${activityIndex}_${activityType}`;
  const now = Date.now();
  
  // Check if we recently made this exact request
  if (requestCache.has(cacheKey)) {
    const lastRequestTime = requestCache.get(cacheKey);
    if (now - lastRequestTime < CACHE_DURATION) {
      console.log(`🚫 Duplicate request blocked for ${cacheKey}`);
      return {
        success: true,
        message: 'Activity already being recorded'
      };
    }
  }
  
  // Update cache
  requestCache.set(cacheKey, now);
  
  // Clean up old cache entries
  for (const [key, timestamp] of requestCache.entries()) {
    if (now - timestamp > CACHE_DURATION) {
      requestCache.delete(key);
    }
  }

  // Add to request queue to ensure sequential processing
  return requestQueue = requestQueue.then(async () => {
    try {
      const baseUrl = await pickApiBase();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Get user's database ID
      const idToken = await currentUser.getIdToken();
      const userRes = await axios.get(`${baseUrl}/users/${currentUser.uid}`, {
        headers: { Authorization: `Bearer ${idToken}` }
      });

      if (!userRes.data || !userRes.data.id) {
        throw new Error('Could not get user database ID');
      }

      const userId = userRes.data.id;

      // Record activity completion with retry logic
      let retries = 0;
      const maxRetries = 3;
      
      while (retries < maxRetries) {
        try {
          const response = await axios.post(`${baseUrl}/progress/activity`, {
            user_id: userId,
            lesson_id: lessonId,
            day_index: dayIndex,
            activity_index: activityIndex,
            activity_type: activityType
          }, {
            headers: { Authorization: `Bearer ${idToken}` },
            timeout: 10000 // 10 second timeout
          });

          console.log(`✅ Activity completed: Lesson ${lessonId}, Day ${dayIndex + 1}, Activity ${activityIndex + 1} (${activityType})`);

          return {
            success: true,
            message: response.data.message || 'Activity completed successfully'
          };
        } catch (error) {
          if (error.response?.status === 429 && retries < maxRetries - 1) {
            // Rate limited, wait with exponential backoff
            const delay = Math.pow(2, retries) * 1000; // 1s, 2s, 4s
            console.log(`⏳ Rate limited, retrying in ${delay}ms (attempt ${retries + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            retries++;
          } else {
            // Not a rate limit error or max retries reached
            throw error;
          }
        }
      }
    } catch (error) {
      console.error('❌ Error recording activity completion:', error);
      return {
        success: false,
        message: error.response?.data?.error || error.message || 'Failed to record activity completion'
      };
    }
  });
};

/**
 * Gets activity progress for a specific lesson
 * @param {number} lessonId - The lesson ID
 * @returns {Promise<Array>} Array of completed activities
 */
export const getActivityProgress = async (lessonId) => {
  try {
    const baseUrl = await pickApiBase();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      return [];
    }

    // Get user's database ID
    const idToken = await currentUser.getIdToken();
    const userRes = await axios.get(`${baseUrl}/users/${currentUser.uid}`, {
      headers: { Authorization: `Bearer ${idToken}` }
    });

    if (!userRes.data || !userRes.data.id) {
      return [];
    }

    const userId = userRes.data.id;

    // Get activity progress with retry logic for rate limiting
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        const response = await axios.get(`${baseUrl}/progress/activity/${userId}/${lessonId}`, {
          headers: { Authorization: `Bearer ${idToken}` },
          timeout: 10000 // 10 second timeout
        });
        return response.data || [];
      } catch (error) {
        if (error.response?.status === 429 && retries < maxRetries - 1) {
          // Rate limited, wait with exponential backoff
          const delay = Math.pow(2, retries) * 1000; // 1s, 2s, 4s
          console.log(`⏳ Rate limited, retrying in ${delay}ms (attempt ${retries + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retries++;
        } else {
          // Not a rate limit error or max retries reached
          throw error;
        }
      }
    }

    return [];
  } catch (error) {
    console.error('❌ Error getting activity progress:', error);
    return [];
  }
};

/**
 * Deletes a specific activity completion record
 * @param {number} lessonId - The lesson ID
 * @param {number} dayIndex - The day index (0-based)
 * @param {number} activityIndex - The activity index within the day (0-based)
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const deleteActivityCompletion = async (lessonId, dayIndex, activityIndex) => {
  try {
    const baseUrl = await pickApiBase();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Get user's database ID
    const idToken = await currentUser.getIdToken();
    const userRes = await axios.get(`${baseUrl}/users/${currentUser.uid}`, {
      headers: { Authorization: `Bearer ${idToken}` }
    });

    if (!userRes.data || !userRes.data.id) {
      throw new Error('Could not get user database ID');
    }

    const userId = userRes.data.id;

    // Delete activity completion
    const response = await axios.delete(`${baseUrl}/progress/activity`, {
      data: {
        user_id: userId,
        lesson_id: lessonId,
        day_index: dayIndex,
        activity_index: activityIndex
      },
      headers: { Authorization: `Bearer ${idToken}` },
      timeout: 10000
    });

    console.log(`🗑️ Activity completion deleted: Lesson ${lessonId}, Day ${dayIndex + 1}, Activity ${activityIndex + 1}`);

    return {
      success: true,
      message: response.data.message || 'Activity completion deleted successfully'
    };
  } catch (error) {
    console.error('❌ Error deleting activity completion:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to delete activity completion'
    };
  }
};