export interface WordItem {
  id: string;
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  exampleMeaning: string;
  category: string;
  emoji: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizQuestion {
  id: string;
  question: string;
  audioPrompt?: string;
  options: {
    id: string;
    text: string;
    emoji?: string;
    isCorrect: boolean;
  }[];
  explanation: string;
}

export interface LevelData {
  level: number;
  title: string;
  subtitle: string;
  themeColor: string;
  icon: string;
  requiredStars: number;
  xpReward: number;
  coinReward: number;
  badgeReward: {
    id: string;
    name: string;
    emoji: string;
    description: string;
  };
  words: WordItem[];
  quizzes: QuizQuestion[];
}

export interface UserItem {
  id: string;
  name: string;
  type: 'hat' | 'outfit' | 'wand' | 'companion' | 'badge';
  emoji: string;
  price: number;
  currency: 'coins' | 'gems';
  description: string;
}

export interface EquippedItems {
  hat?: string;
  outfit?: string;
  wand?: string;
  companion?: string;
}

export interface Mascot {
  id: string;
  name: string;
  title: string;
  emoji: string;
  color: string;
  avatarBg: string;
}

export interface StudyRecord {
  id: string;
  timestamp: number;
  level: number;
  lessonTitle: string;
  score: number;
  maxScore: number;
  durationMinutes: number;
  activityType: 'lesson' | 'game_bubble' | 'game_memory' | 'game_spelling' | 'speech_test' | 'story';
  accuracy: number;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'learn_words' | 'play_game' | 'practice_speech' | 'complete_quiz';
  target: number;
  current: number;
  coinReward: number;
  gemReward: number;
  claimed: boolean;
}

export interface UserState {
  nickname: string;
  mascotId: string;
  level: number; // Current unlocked level (1-100)
  levelStars: Record<number, number>; // level -> stars (0-3)
  coins: number;
  gems: number;
  totalXp: number;
  streakDays: number;
  lastActiveDate: string;
  inventory: string[]; // item ids owned
  equipped: EquippedItems;
  badges: string[]; // badge ids unlocked
  completedWords: string[]; // word ids mastered
  studyRecords: StudyRecord[];
  dailyMinutesSpent: number;
  todayDate: string;
  dailyMissions: DailyMission[];
  dailyChestClaimed: boolean;
  defeatedRivals: string[]; // friend ids defeated in challenges
}

export interface ParentSettings {
  screenTimeLimitMinutes: number; // 0 = unlimited, 15, 30, 45, 60
  pinCode: string; // default "1234"
  breakReminders: boolean;
  dailyGoalWords: number;
  voiceSpeed: number; // 0.8 to 1.0
  pushNotificationsEnabled: boolean;
  reminderTime: string; // e.g. "19:30"
  reminderPreset: 'fun' | 'streak' | 'reward';
}

export interface LeaderboardUser {
  rank: number;
  id: string;
  nickname: string;
  mascotEmoji: string;
  level: number;
  points: number;
  badgeEmoji: string;
  isCurrentUser?: boolean;
  statusQuote?: string;
  ghostAccuracy?: number;
  ghostQuestionsCorrect?: number;
  isDefeated?: boolean;
}

export interface MonthlyMilestone {
  monthKey: string;
  monthLabel: string;
  isCurrent: boolean;
  levelsCompleted: number;
  wordsMastered: number;
  studyMinutes: number;
  accuracyRate: number;
  starsEarned: number;
  xpEarned: number;
  badgeName: string;
  badgeEmoji: string;
  grade: 'A+' | 'A' | 'B+' | 'B';
  gradeLabel: string;
  goalTargetWords: number;
  goalProgressPercent: number;
  highlights: string[];
  teacherFeedback: string;
  growthComparedToLastMonth?: {
    wordsDelta: number;
    accuracyDelta: number;
    timeDeltaMinutes: number;
  };
}

// Chibi 3D Avatar Types
export type ChibiGender = 'boy' | 'girl';
export type WardrobeCategory = 'outfit' | 'hat' | 'shoes' | 'glasses' | 'earrings' | 'hair';

export interface WardrobeItem {
  id: string;
  name: string;
  category: WardrobeCategory;
  emoji: string;
  price: number;
  currency: 'coins' | 'gems'; // 'coins' = Sao vàng, 'gems' = Kim cương
  description: string;
  previewColor?: string;
  modelStyle?: string; // identifier for rendering visual style
  targetGender?: 'boy' | 'girl' | 'unisex';
}

export interface ChibiEquipped {
  hair: string;
  outfit: string;
  hat?: string;
  shoes: string;
  glasses?: string;
  earrings?: string;
}

export interface ChibiCharacter {
  gender: ChibiGender;
  skinTone: string;
  equipped: ChibiEquipped;
  ownedWardrobe: string[]; // item ids owned
  pose?: 'happy' | 'wave' | 'dance' | 'hero';
}

export interface AuthAccount {
  id: string;
  username: string;
  email: string;
  nickname: string;
  passwordHash: string; // stored for demo verification
  securityQuestion: string;
  securityAnswer: string;
  createdAt: number;
  chibi: ChibiCharacter;
}

