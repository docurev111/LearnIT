// contexts/AchievementContext.tsx - Global achievement management
import React, { createContext, useContext, useState, useCallback } from 'react';
import { auth } from '../firebaseConfig';
import pickApiBase from '../config/api_probe';

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  earned_at?: string;
}

interface AchievementContextType {
  showAchievementNotification: (achievement: Achievement) => void;
  checkAndAwardAchievements: (activityType: string, activityData?: any) => Promise<Achievement[]>;
  currentNotification: Achievement | null;
  notificationVisible: boolean;
  hideNotification: () => void;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export const useAchievements = () => {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }
  return context;
};

interface AchievementProviderProps {
  children: React.ReactNode;
}

export const AchievementProvider: React.FC<AchievementProviderProps> = ({ children }) => {
  const [currentNotification, setCurrentNotification] = useState<Achievement | null>(null);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationQueue, setNotificationQueue] = useState<Achievement[]>([]);

  const showAchievementNotification = useCallback((achievement: Achievement) => {
    if (notificationVisible) {
      // Add to queue if notification is already showing
      setNotificationQueue(prev => [...prev, achievement]);
    } else {
      // Show immediately
      setCurrentNotification(achievement);
      setNotificationVisible(true);
    }
  }, [notificationVisible]);

  const hideNotification = useCallback(() => {
    setNotificationVisible(false);
    setCurrentNotification(null);

    // Show next notification in queue after a short delay
    setTimeout(() => {
      setNotificationQueue(prev => {
        if (prev.length > 0) {
          const [next, ...rest] = prev;
          setCurrentNotification(next);
          setNotificationVisible(true);
          return rest;
        }
        return prev;
      });
    }, 500);
  }, []);

  const checkAndAwardAchievements = useCallback(async (
    activityType: string, 
    activityData: any = {}
  ): Promise<Achievement[]> => {
    try {
      const user = auth.currentUser;
      if (!user) return [];

      // Get user ID from the database
      const apiBase = await pickApiBase();
      const token = await user.getIdToken();
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Get user profile to get the user ID
      const userRes = await fetch(`${apiBase}/users/${user.uid}`, { headers });
      if (!userRes.ok) return [];
      
      const userData = await userRes.json();
      const userId = userData.id;

      // Check for new achievements
      const response = await fetch(`${apiBase}/check-achievements`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_id: userId,
          activity_type: activityType,
          activity_data: activityData
        })
      });

      if (response.ok) {
        const result = await response.json();
        const newAchievements = result.awarded_badges || [];

        // Show notifications for new achievements
        newAchievements.forEach((achievement: Achievement) => {
          showAchievementNotification(achievement);
        });

        return newAchievements;
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
    
    return [];
  }, [showAchievementNotification]);

  const value: AchievementContextType = {
    showAchievementNotification,
    checkAndAwardAchievements,
    currentNotification,
    notificationVisible,
    hideNotification,
  };

  return (
    <AchievementContext.Provider value={value}>
      {children}
    </AchievementContext.Provider>
  );
};

export default AchievementContext;