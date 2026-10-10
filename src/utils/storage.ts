import { UserState, ParentSettings, LeaderboardUser, StudyRecord, DailyMission } from '../types';

const STORAGE_KEY_USER = 'songtu_user_state_v1';
const STORAGE_KEY_PARENT = 'songtu_parent_settings_v1';

export const getTodayString = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const createDefaultDailyMissions = (): DailyMission[] => [
  {
    id: 'mission_words',
    title: 'Học 5 Từ Mới',
    description: 'Khám phá ít nhất 5 thẻ từ vựng trong bài học',
    icon: '📖',
    type: 'learn_words',
    target: 5,
    current: 1,
    coinReward: 30,
    gemReward: 1,
    claimed: false
  },
  {
    id: 'mission_game',
    title: 'Chơi 1 Trò Chơi',
    description: 'Chơi bóng bay, lật thẻ hoặc xếp chữ bất kỳ',
    icon: '🎮',
    type: 'play_game',
    target: 1,
    current: 0,
    coinReward: 25,
    gemReward: 0,
    claimed: false
  },
  {
    id: 'mission_speech',
    title: 'Luyện Phát Âm 3 Lần',
    description: 'Bấm micro và đọc lại các từ tiếng Anh',
    icon: '🎤',
    type: 'practice_speech',
    target: 3,
    current: 0,
    coinReward: 35,
    gemReward: 1,
    claimed: false
  },
  {
    id: 'mission_quiz',
    title: 'Vượt Qua 1 Bài Kiểm Tra',
    description: 'Đạt điểm tốt trong bài thi đánh giá năng lực',
    icon: '🏆',
    type: 'complete_quiz',
    target: 1,
    current: 0,
    coinReward: 40,
    gemReward: 1,
    claimed: false
  }
];

export const DEFAULT_USER_STATE: UserState = {
  nickname: 'Sư Tử Dũng Cảm',
  mascotId: 'lion',
  level: 1,
  levelStars: {
    1: 0
  },
  coins: 100, // starting coins for immediate fun
  gems: 3,    // starting gems
  totalXp: 50,
  streakDays: 3,
  lastActiveDate: getTodayString(),
  inventory: ['hat_cap'], // start with one free cute cap
  equipped: {
    hat: 'hat_cap'
  },
  badges: ['badge_starter'],
  completedWords: [],
  studyRecords: [
    {
      id: 'rec_init_1',
      timestamp: Date.now() - 86400000 * 2,
      level: 1,
      lessonTitle: 'Khởi đầu vui vẻ',
      score: 3,
      maxScore: 3,
      durationMinutes: 8,
      activityType: 'lesson',
      accuracy: 100
    },
    {
      id: 'rec_init_2',
      timestamp: Date.now() - 86400000,
      level: 1,
      lessonTitle: 'Thú Cưng Quanh Bé',
      score: 3,
      maxScore: 3,
      durationMinutes: 12,
      activityType: 'game_bubble',
      accuracy: 95
    }
  ],
  dailyMinutesSpent: 5,
  todayDate: getTodayString(),
  dailyMissions: createDefaultDailyMissions(),
  dailyChestClaimed: false,
  defeatedRivals: []
};

export const DEFAULT_PARENT_SETTINGS: ParentSettings = {
  screenTimeLimitMinutes: 30, // 30 minutes daily recommended for kids
  pinCode: '1234',
  breakReminders: true,
  dailyGoalWords: 5,
  voiceSpeed: 0.85,
  pushNotificationsEnabled: true,
  reminderTime: '19:30',
  reminderPreset: 'fun'
};

export const loadUserState = (): UserState => {
  if (typeof window === 'undefined') return DEFAULT_USER_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (!raw) return DEFAULT_USER_STATE;
    const parsed: UserState = JSON.parse(raw);
    
    // Check daily streak and today minutes reset
    const today = getTodayString();
    if (parsed.todayDate !== today) {
      // Check if yesterday
      const lastDate = new Date(parsed.lastActiveDate);
      const currentDate = new Date(today);
      const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
      
      let newStreak = parsed.streakDays;
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
      
      parsed.streakDays = newStreak;
      parsed.dailyMinutesSpent = 0;
      parsed.todayDate = today;
      parsed.lastActiveDate = today;
      parsed.dailyMissions = createDefaultDailyMissions();
      parsed.dailyChestClaimed = false;
    }
    
    // Fallback if dailyMissions is missing in existing saved state
    if (!parsed.dailyMissions || parsed.dailyMissions.length === 0) {
      parsed.dailyMissions = createDefaultDailyMissions();
      parsed.dailyChestClaimed = false;
    }
    
    parsed.defeatedRivals = parsed.defeatedRivals || [];
    
    return parsed;
  } catch {
    return DEFAULT_USER_STATE;
  }
};

export const saveUserState = (state: UserState) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save user state', err);
  }
};

export const loadParentSettings = (): ParentSettings => {
  if (typeof window === 'undefined') return DEFAULT_PARENT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PARENT);
    if (!raw) return DEFAULT_PARENT_SETTINGS;
    return { ...DEFAULT_PARENT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PARENT_SETTINGS;
  }
};

export const saveParentSettings = (settings: ParentSettings) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PARENT, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save parent settings', err);
  }
};

// Generate an encoded Family Sync Code for multi-device sync
export const generateSyncCode = (state: UserState): string => {
  try {
    const jsonStr = JSON.stringify(state);
    return btoa(encodeURIComponent(jsonStr));
  } catch {
    return '';
  }
};

// Restore state from Sync Code
export const restoreFromSyncCode = (code: string): UserState | null => {
  try {
    const jsonStr = decodeURIComponent(atob(code.trim()));
    const parsed = JSON.parse(jsonStr) as UserState;
    if (parsed && parsed.nickname && typeof parsed.level === 'number') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

// Generate dynamic weekly leaderboard
export const getWeeklyLeaderboard = (currentUser: UserState): LeaderboardUser[] => {
  const baseFriends: Omit<LeaderboardUser, 'isCurrentUser'>[] = [
    { 
      rank: 1, 
      id: 'friend_1', 
      nickname: 'Bé Bắp Vui Vẻ', 
      mascotEmoji: '🐰', 
      level: Math.max(currentUser.level, 3), 
      points: Math.max(currentUser.totalXp + 150, 480), 
      badgeEmoji: '👑',
      statusQuote: 'Tớ vừa đạt 100% bài thi Cấp 3! Cậu có dám thi đấu cùng tớ không? 😉',
      ghostAccuracy: 95,
      ghostQuestionsCorrect: 3
    },
    { 
      rank: 2, 
      id: 'friend_2', 
      nickname: 'Thỏ Ngọc Tinh Anh', 
      mascotEmoji: '🦊', 
      level: Math.max(currentUser.level, 2), 
      points: Math.max(currentUser.totalXp + 60, 420), 
      badgeEmoji: '💎',
      statusQuote: 'Tớ đã luyện phát âm 10 từ tiếng Anh liên tiếp đó nha! 🌟',
      ghostAccuracy: 90,
      ghostQuestionsCorrect: 2
    },
    { 
      rank: 3, 
      id: 'friend_3', 
      nickname: 'Khủng Long Nhí', 
      mascotEmoji: '🦖', 
      level: Math.max(currentUser.level - 1, 2), 
      points: Math.max(currentUser.totalXp - 20, 360), 
      badgeEmoji: '⭐',
      statusQuote: 'Gầm gừ! Khủng long đang cố gắng vươn lên Top 1 tuần này!',
      ghostAccuracy: 85,
      ghostQuestionsCorrect: 2
    },
    { 
      rank: 4, 
      id: 'friend_4', 
      nickname: 'Mèo Miu Miu', 
      mascotEmoji: '🐱', 
      level: 2, 
      points: 310, 
      badgeEmoji: '🎖️',
      statusQuote: 'Meow! Tớ vừa hoàn thành trò chơi lật thẻ trí nhớ siêu nhanh!',
      ghostAccuracy: 80,
      ghostQuestionsCorrect: 2
    },
    { 
      rank: 5, 
      id: 'friend_5', 
      nickname: 'Gấu Pooh Chăm Chỉ', 
      mascotEmoji: '🐻', 
      level: 1, 
      points: 260, 
      badgeEmoji: '🌸',
      statusQuote: 'Mỗi ngày học 15 phút, tiếng Anh sẽ giỏi lên từng ngày!',
      ghostAccuracy: 75,
      ghostQuestionsCorrect: 1
    },
    { 
      rank: 6, 
      id: 'friend_6', 
      nickname: 'Cánh Cụt Siêu Cấp', 
      mascotEmoji: '🐧', 
      level: 1, 
      points: 210, 
      badgeEmoji: '⚡',
      statusQuote: 'Bé cánh cụt bơi lội trong biển từ vựng kỳ diệu!',
      ghostAccuracy: 70,
      ghostQuestionsCorrect: 1
    },
    { 
      rank: 7, 
      id: 'friend_7', 
      nickname: 'Sóc Nâu Nhanh Nhẹn', 
      mascotEmoji: '🐿️', 
      level: 1, 
      points: 170, 
      badgeEmoji: '🌰',
      statusQuote: 'Thu lượm từ vựng như những hạt dẻ ngọt lành!',
      ghostAccuracy: 65,
      ghostQuestionsCorrect: 1
    },
  ];

  const userEntry: LeaderboardUser = {
    rank: 0,
    id: 'current_user',
    nickname: currentUser.nickname + ' (Bé)',
    mascotEmoji: '🦁',
    level: currentUser.level,
    points: currentUser.totalXp,
    badgeEmoji: '🌟',
    statusQuote: 'Tớ sẽ chinh phục trọn vẹn 100 Cấp Độ behocvui!',
    isCurrentUser: true
  };

  const all = [...baseFriends, userEntry].sort((a, b) => b.points - a.points);
  const defeated = currentUser.defeatedRivals || [];

  return all.map((item, index) => ({
    ...item,
    rank: index + 1,
    isDefeated: defeated.includes(item.id)
  }));
};
