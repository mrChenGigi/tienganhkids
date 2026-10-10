/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  UserState, 
  ParentSettings, 
  LevelData, 
  UserItem, 
  EquippedItems,
  StudyRecord,
  DailyMission,
  LeaderboardUser,
  AuthAccount
} from './types';
import { 
  loadUserState, 
  saveUserState, 
  loadParentSettings, 
  saveParentSettings 
} from './utils/storage';
import { 
  getCurrentAuthAccount, 
  setCurrentAuthAccount 
} from './utils/authStorage';
import { sound, speakEnglish } from './utils/audio';
import { Header } from './components/Header';
import { MascotDisplay } from './components/MascotDisplay';
import { LevelMap } from './components/LevelMap';
import { LessonModal } from './components/LessonModal';
import { GameHub } from './components/games/GameHub';
import { ShopModal } from './components/ShopModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { ParentModal } from './components/ParentModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { PersonalProfileModal } from './components/PersonalProfileModal';
import { BabyDictionaryModal } from './components/BabyDictionaryModal';
import { Chibi3DAvatar } from './components/Chibi3DAvatar';
import { TimeLimitAlert } from './components/TimeLimitAlert';
import { DailyMissionsModal } from './components/DailyMissionsModal';
import { LevelUpCelebrationModal } from './components/LevelUpCelebrationModal';
import { FriendChallengeModal } from './components/FriendChallengeModal';
import { DailyWordCard } from './components/DailyWordCard';
import { HonorCorner } from './components/HonorCorner';
import { NotificationBanner } from './components/NotificationBanner';
import { StudyAdviceWidget } from './components/StudyAdviceWidget';
import { triggerFireworks, triggerCenterExplosion, triggerGoldenShower } from './utils/celebration';
import { sendStudyNotification, getReminderMessage } from './utils/notifications';
import { LEVELS } from './data/curriculum';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Trophy, 
  Gamepad2, 
  Flame, 
  Compass, 
  Volume2, 
  HeartHandshake,
  WifiOff,
  Target,
  Gift,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  Star
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserState>(() => loadUserState());
  const [parentSettings, setParentSettings] = useState<ParentSettings>(() => loadParentSettings());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Modals
  const [selectedLevel, setSelectedLevel] = useState<LevelData | null>(null);
  const [isDailyMissionsOpen, setIsDailyMissionsOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isGamesOpen, setIsGamesOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isParentOpen, setIsParentOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPersonalProfileOpen, setIsPersonalProfileOpen] = useState(false);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<AuthAccount | null>(() => getCurrentAuthAccount());
  const [isTimeAlertOpen, setIsTimeAlertOpen] = useState(false);
  const [challengingRival, setChallengingRival] = useState<LeaderboardUser | null>(null);
  const [levelUpCelebration, setLevelUpCelebration] = useState<{
    newLevel: number;
    coinReward: number;
    badgeEmoji: string;
    badgeName: string;
  } | null>(null);

  // Save changes to localStorage
  useEffect(() => {
    saveUserState(user);
  }, [user]);

  useEffect(() => {
    saveParentSettings(parentSettings);
  }, [parentSettings]);

  // Online / Offline monitor
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Screen time tracking interval (every 1 minute)
  useEffect(() => {
    const interval = setInterval(() => {
      setUser((prev) => {
        const nextMins = prev.dailyMinutesSpent + 1;
        // Check if exceeded parent limit
        if (
          parentSettings.screenTimeLimitMinutes > 0 &&
          nextMins >= parentSettings.screenTimeLimitMinutes &&
          !isTimeAlertOpen
        ) {
          setIsTimeAlertOpen(true);
        }
        return {
          ...prev,
          dailyMinutesSpent: nextMins
        };
      });
    }, 60000); // 1 min

    return () => clearInterval(interval);
  }, [parentSettings.screenTimeLimitMinutes, isTimeAlertOpen]);

  // Daily study reminder check (triggers push notification & in-app banner)
  useEffect(() => {
    let lastRemindedDate = '';
    const reminderInterval = setInterval(() => {
      if (!parentSettings.pushNotificationsEnabled) return;
      const now = new Date();
      const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

      if (currentHHMM === parentSettings.reminderTime && lastRemindedDate !== todayStr) {
        lastRemindedDate = todayStr;
        const msg = getReminderMessage(parentSettings.reminderPreset || 'fun', user.nickname, user.streakDays);
        sendStudyNotification(msg.title, msg.body, '🦁');
      }
    }, 30000);

    return () => clearInterval(reminderInterval);
  }, [parentSettings.pushNotificationsEnabled, parentSettings.reminderTime, parentSettings.reminderPreset, user.nickname, user.streakDays]);

  // Mission incrementer helper
  const incrementMission = (type: DailyMission['type'], amount: number = 1) => {
    setUser((prev) => {
      const missions = prev.dailyMissions || [];
      let updated = false;
      const newMissions = missions.map((m) => {
        if (m.type === type && !m.claimed && m.current < m.target) {
          const nextVal = Math.min(m.target, m.current + amount);
          if (nextVal !== m.current) {
            updated = true;
            return { ...m, current: nextVal };
          }
        }
        return m;
      });
      return updated ? { ...prev, dailyMissions: newMissions } : prev;
    });
  };

  // Handle toggling sound
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setSoundEnabled(next);
  };

  // Track word learned
  const handleWordLearned = (wordId: string) => {
    setUser((prev) => {
      if (prev.completedWords.includes(wordId)) return prev;
      return {
        ...prev,
        completedWords: [...prev.completedWords, wordId]
      };
    });
    incrementMission('learn_words', 1);
  };

  // Toggle mastered word in dictionary
  const handleToggleMasteredWord = (wordId: string) => {
    setUser((prev) => {
      const isMastered = prev.completedWords.includes(wordId);
      const nextCompleted = isMastered
        ? prev.completedWords.filter((id) => id !== wordId)
        : [...prev.completedWords, wordId];
      return {
        ...prev,
        completedWords: nextCompleted
      };
    });
  };

  // Reward reviewing words in dictionary
  const handleRewardReview = (coins: number, xp: number) => {
    setUser((prev) => ({
      ...prev,
      coins: prev.coins + coins,
      totalXp: prev.totalXp + xp
    }));
  };

  // Complete a level quiz
  const handleCompleteLevel = (
    level: number,
    stars: number,
    coinReward: number,
    badgeId: string
  ) => {
    incrementMission('complete_quiz', 1);

    const isLevelingUp = level === user.level && level < 100;
    const nextLevelNum = isLevelingUp ? level + 1 : user.level;

    if (isLevelingUp) {
      const nextLvlData = LEVELS.find((l) => l.level === nextLevelNum);
      setTimeout(() => {
        setLevelUpCelebration({
          newLevel: nextLevelNum,
          coinReward: coinReward,
          badgeEmoji: nextLvlData?.badgeReward.emoji || '👑',
          badgeName: nextLvlData?.badgeReward.name || 'Huy Hiệu Mới'
        });
      }, 500);
    }

    setUser((prev) => {
      const nextLevel = level === prev.level && level < 100 ? level + 1 : prev.level;
      const currentStarsForLevel = prev.levelStars[level] || 0;
      const newStars = Math.max(currentStarsForLevel, stars);

      const badges = prev.badges.includes(badgeId)
        ? prev.badges
        : [...prev.badges, badgeId];

      const newRecord: StudyRecord = {
        id: `rec_${Date.now()}`,
        timestamp: Date.now(),
        level: level,
        lessonTitle: `Cấp độ ${level} - Bài thi kiểm tra`,
        score: stars,
        maxScore: 3,
        durationMinutes: 6,
        activityType: 'lesson',
        accuracy: stars === 3 ? 100 : stars === 2 ? 80 : 60
      };

      return {
        ...prev,
        level: nextLevel,
        levelStars: {
          ...prev.levelStars,
          [level]: newStars
        },
        coins: prev.coins + coinReward,
        gems: prev.gems + (level === prev.level ? 1 : 0),
        totalXp: prev.totalXp + 100,
        badges: badges,
        studyRecords: [newRecord, ...prev.studyRecords]
      };
    });
  };

  // Add reward when child repeats / practices pronunciation
  const handleAddWordPracticeReward = (stars: number, coins: number) => {
    incrementMission('practice_speech', 1);

    setUser((prev) => {
      const newRecord: StudyRecord = {
        id: `rec_${Date.now()}`,
        timestamp: Date.now(),
        level: prev.level,
        lessonTitle: `Luyện đọc phát âm chuẩn`,
        score: stars,
        maxScore: 3,
        durationMinutes: 2,
        activityType: 'speech_test',
        accuracy: stars === 3 ? 100 : 80
      };

      return {
        ...prev,
        coins: prev.coins + coins,
        totalXp: prev.totalXp + 20,
        studyRecords: [newRecord, ...prev.studyRecords]
      };
    });
  };

  // Complete a minigame
  const handleFinishGame = (
    gameType: 'bubble' | 'memory' | 'spelling' | 'speed_runner' | 'picture_riddle' | 'audio_listen',
    score: number,
    earnedCoins: number
  ) => {
    incrementMission('play_game', 1);

    const gameTitleMap: Record<string, string> = {
      bubble: 'Bóng bay từ vựng',
      memory: 'Lật thẻ trí nhớ',
      spelling: 'Xếp chữ thần tốc',
      speed_runner: 'Đua thuyền tốc độ',
      picture_riddle: 'Đố vui hình ảnh',
      audio_listen: 'Lắng nghe bắt hình'
    };

    setUser((prev) => {
      const newRecord: StudyRecord = {
        id: `rec_${Date.now()}`,
        timestamp: Date.now(),
        level: prev.level,
        lessonTitle: `Trò chơi: ${gameTitleMap[gameType] || 'Vui học tiếng Anh'}`,
        score: 3,
        maxScore: 3,
        durationMinutes: 4,
        activityType:
          gameType === 'bubble'
            ? 'game_bubble'
            : gameType === 'memory'
            ? 'game_memory'
            : 'game_spelling',
        accuracy: 95
      };

      // If playing picture_riddle or high score, grant bonus gems occasionally
      const gemBonus = gameType === 'picture_riddle' ? 1 : 0;

      return {
        ...prev,
        coins: prev.coins + earnedCoins,
        gems: prev.gems + gemBonus,
        totalXp: prev.totalXp + 35,
        studyRecords: [newRecord, ...prev.studyRecords]
      };
    });
  };

  // Finish listening to an English story (passive listening)
  const handleFinishStory = (earnedCoins: number, earnedXp: number) => {
    incrementMission('learn_words', 1);

    setUser((prev) => {
      const newRecord: StudyRecord = {
        id: `rec_${Date.now()}`,
        timestamp: Date.now(),
        level: selectedLevel ? selectedLevel.level : prev.level,
        lessonTitle: `Truyện kể: ${selectedLevel ? selectedLevel.title : 'Truyện tiếng Anh'}`,
        score: 3,
        maxScore: 3,
        durationMinutes: 3,
        activityType: 'story',
        accuracy: 100
      };

      return {
        ...prev,
        coins: prev.coins + earnedCoins,
        totalXp: prev.totalXp + earnedXp,
        studyRecords: [newRecord, ...prev.studyRecords]
      };
    });
  };

  // Claim single daily mission
  const handleClaimMission = (missionId: string) => {
    setUser((prev) => {
      const missions = prev.dailyMissions || [];
      const mission = missions.find((m) => m.id === missionId);
      if (!mission || mission.claimed) return prev;

      const updatedMissions = missions.map((m) =>
        m.id === missionId ? { ...m, claimed: true } : m
      );

      return {
        ...prev,
        coins: prev.coins + mission.coinReward,
        gems: prev.gems + mission.gemReward,
        totalXp: prev.totalXp + 30,
        dailyMissions: updatedMissions
      };
    });
  };

  // Claim grand daily chest
  const handleClaimDailyChest = () => {
    setUser((prev) => {
      if (prev.dailyChestClaimed) return prev;
      const updatedBadges = prev.badges.includes('badge_daily_champion')
        ? prev.badges
        : [...prev.badges, 'badge_daily_champion'];

      return {
        ...prev,
        coins: prev.coins + 80,
        gems: prev.gems + 2,
        totalXp: prev.totalXp + 150,
        dailyChestClaimed: true,
        badges: updatedBadges
      };
    });
  };

  // Go to activity from mission
  const handleGoToActivity = (type: DailyMission['type']) => {
    if (type === 'play_game') {
      setIsGamesOpen(true);
    } else {
      // Open current level lesson
      const currentLevelData = LEVELS.find((l) => l.level === user.level) || LEVELS[0];
      setSelectedLevel(currentLevelData);
    }
  };

  // Handle beating rival friend in 1vs1 challenge
  const handleWinChallenge = (rivalId: string, bonusXp: number, bonusCoins: number) => {
    setUser((prev) => {
      const defeated = prev.defeatedRivals.includes(rivalId)
        ? prev.defeatedRivals
        : [...prev.defeatedRivals, rivalId];

      const newRecord: StudyRecord = {
        id: `rec_${Date.now()}`,
        timestamp: Date.now(),
        level: prev.level,
        lessonTitle: 'Thách đấu bạn bè 1vs1',
        score: 3,
        maxScore: 3,
        durationMinutes: 3,
        activityType: 'speech_test',
        accuracy: 100
      };

      return {
        ...prev,
        coins: prev.coins + bonusCoins,
        totalXp: prev.totalXp + bonusXp,
        defeatedRivals: defeated,
        studyRecords: [newRecord, ...prev.studyRecords]
      };
    });
  };

  // Shop purchases
  const handleBuyItem = (item: UserItem) => {
    setUser((prev) => {
      const nextCoins = item.currency === 'coins' ? prev.coins - item.price : prev.coins;
      const nextGems = item.currency === 'gems' ? prev.gems - item.price : prev.gems;
      return {
        ...prev,
        coins: Math.max(0, nextCoins),
        gems: Math.max(0, nextGems),
        inventory: [...prev.inventory, item.id],
        equipped: {
          ...prev.equipped,
          [item.type]: item.id
        }
      };
    });
  };

  // Equip / unequip
  const handleEquipItem = (type: keyof EquippedItems, itemId?: string) => {
    setUser((prev) => ({
      ...prev,
      equipped: {
        ...prev.equipped,
        [type]: itemId
      }
    }));
  };

  // Profile update
  const handleUpdateProfile = (nickname: string, mascotId: string) => {
    setUser((prev) => ({
      ...prev,
      nickname,
      mascotId
    }));
  };

  // Restore user from sync code
  const handleRestoreUser = (restored: UserState) => {
    setUser(restored);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/40 to-sky-50 flex flex-col font-fredoka selection:bg-amber-300">
      
      {/* Offline banner if offline */}
      {!isOnline && (
        <div className="bg-emerald-600 text-white text-xs font-bold py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-xs">
          <WifiOff className="w-4 h-4" />
          <span>Bé đang học ngoại tuyến - Mọi bài học và trò chơi vẫn hoạt động 100% mượt mà!</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        user={user}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenDailyMissions={() => setIsDailyMissionsOpen(true)}
        onOpenShop={() => setIsShopOpen(true)}
        onOpenGames={() => setIsGamesOpen(true)}
        onOpenDictionary={() => setIsDictionaryOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenParent={() => setIsParentOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        currentAccount={currentAccount}
        onOpenPersonalProfile={() => setIsPersonalProfileOpen(true)}
        isOnline={isOnline}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6">
        
        {/* Hero Interactive Mascot Hub */}
        <section className="bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-white mb-6 relative overflow-hidden">
          {/* Decorative floating shapes */}
          <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/20 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-amber-400/30 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Mascot on the left */}
            <div className="shrink-0 flex flex-col items-center">
              <MascotDisplay
                mascotId={user.mascotId}
                equipped={user.equipped}
                size="lg"
                speechText={`Xin chào ${user.nickname}! Hôm nay cùng chinh phục Cấp ${user.level} nhé! 🌟`}
              />
              <button
                onClick={() => {
                  sound.playClick();
                  setIsProfileOpen(true);
                }}
                onMouseEnter={() => sound.playHoverPop()}
                className="mt-1.5 text-xs text-amber-900/90 hover:text-amber-950 font-bold bg-white/70 hover:bg-white px-2.5 py-1 rounded-full border border-amber-300 shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1 hover:scale-105"
                title="Đổi linh vật hoặc ảnh đại diện"
              >
                <span>Đổi linh vật 🔄</span>
              </button>
            </div>

            {/* Middle Welcome & Action */}
            <div className="text-center md:text-left flex-1">
              <div className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-xs text-orange-900 font-extrabold text-xs px-3 py-1 rounded-full mb-2 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                <span>Học Vui • Nhớ Lâu • Phát Âm Chuẩn</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Vương Quốc Tiếng Anh behocvui
              </h2>
              <p className="text-xs sm:text-sm text-slate-800 font-semibold max-w-xl mt-1">
                Luyện nghe, nhắc lại từ vựng, chơi trò chơi bắn bóng và nhận thưởng Sao Vàng để sắm trang phục lộng lẫy cho linh vật của bé!
              </p>

              {/* Quick Action Badges */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mt-4">
                <button
                  onClick={() => {
                    sound.playStar();
                    setIsDailyMissionsOpen(true);
                  }}
                  onMouseEnter={() => sound.playHoverPop()}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2 hover:scale-105"
                >
                  <Target className="w-4 h-4" />
                  <span>Thử Thách Mỗi Ngày 🎯</span>
                </button>

                <button
                  onClick={() => {
                    sound.playStar();
                    setIsGamesOpen(true);
                  }}
                  onMouseEnter={() => sound.playHoverPop()}
                  className="bg-white hover:bg-slate-50 text-purple-700 font-black text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2 border-2 border-purple-200 hover:scale-105"
                >
                  <Gamepad2 className="w-4 h-4 text-purple-600" />
                  <span>Chơi Trò Chơi Thú Vị 🎮</span>
                </button>

                <button
                  onClick={() => {
                    sound.playStar();
                    setIsDictionaryOpen(true);
                  }}
                  onMouseEnter={() => sound.playHoverPop()}
                  className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 hover:scale-105 border border-amber-300"
                >
                  <BookOpen className="w-4 h-4 text-white" />
                  <span>Cuốn Từ Điển Của Bé 📖</span>
                </button>

                <button
                  onClick={() => {
                    sound.playCoin();
                    setIsShopOpen(true);
                  }}
                  onMouseEnter={() => sound.playHoverPop()}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-black text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 hover:scale-105"
                >
                  <span>🛍️ Đổi Thưởng Kho Đồ</span>
                </button>

                <button
                  onClick={() => {
                    sound.playStar();
                    document.getElementById('honor-corner')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  onMouseEnter={() => sound.playHoverPop()}
                  className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:from-amber-500 hover:to-yellow-400 text-amber-950 font-black text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 hover:scale-105 border border-amber-200"
                >
                  <Trophy className="w-4 h-4 text-amber-900 fill-amber-700" />
                  <span>Góc Vinh Danh ✨</span>
                </button>

                <button
                  onClick={() => {
                    sound.playStar();
                    if (currentAccount) {
                      setIsPersonalProfileOpen(true);
                    } else {
                      setIsAuthOpen(true);
                    }
                  }}
                  onMouseEnter={() => sound.playHoverPop()}
                  className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 hover:scale-105 border border-purple-300"
                >
                  <span>{currentAccount?.chibi.gender === 'girl' ? '👧' : '👦'} Nhân Vật 3D & Tủ Đồ 👗</span>
                </button>
              </div>
            </div>

            {/* Right Summary Level Status */}
            <div className="bg-white/90 backdrop-blur-xs border-2 border-amber-300 rounded-3xl p-4 text-center shadow-lg min-w-[200px]">
              <div className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                Cấp Độ Hiện Tại
              </div>
              <div className="text-3xl font-black text-slate-800 my-0.5">
                Cấp {user.level} / 100
              </div>
              <div className="flex items-center justify-center gap-1 text-xs text-slate-700 font-bold mb-2">
                <span>Đã thu thập {user.coins}</span>
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 inline drop-shadow-xs" />
                <span className="text-amber-800 font-extrabold">Sao Vàng</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(user.level / 100) * 100}%` }}
                />
              </div>
            </div>

          </div>
        </section>

        {/* Word of the Day - Gợi ý 'Từ vựng của ngày' dựa trên chủ đề của cấp độ hiện tại */}
        <DailyWordCard
          currentLevel={LEVELS.find((l) => l.level === user.level) || LEVELS[0]}
          user={user}
          onStartLesson={(lvl) => setSelectedLevel(lvl)}
          onRewardWord={handleAddWordPracticeReward}
          onWordLearned={handleWordLearned}
        />

        {/* Góc Vinh Danh - Trưng bày các huy hiệu quý hiếm nhất kèm hiệu ứng lấp lánh */}
        <HonorCorner
          user={user}
          onOpenProfile={() => setIsProfileOpen(true)}
          onSelectLevel={(lvl) => setSelectedLevel(lvl)}
        />

        {/* Daily Challenges Quick Banner Widget */}
        <section className="bg-white/90 border-2 border-amber-300 rounded-3xl p-4 sm:p-5 shadow-md mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl shadow-sm shrink-0">
              🎯
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-slate-900">
                  Thử Thách Mỗi Ngày Của Bé
                </h3>
                <span className="text-xs font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  {(user.dailyMissions || []).filter((m) => m.current >= m.target).length}/{(user.dailyMissions || []).length} xong
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Hoàn thành nhiệm vụ nhận thêm hàng chục Sao Vàng và mở Rương Thần Kỳ!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {(user.dailyMissions || []).map((m) => (
                <div
                  key={m.id}
                  title={`${m.title}: ${m.current}/${m.target}`}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border-2 transition-all ${
                    m.claimed
                      ? 'bg-slate-100 border-slate-300 opacity-60'
                      : m.current >= m.target
                      ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-300 animate-bounce'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  {m.icon}
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                sound.playStar();
                setIsDailyMissionsOpen(true);
              }}
              onMouseEnter={() => sound.playHoverPop()}
              className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer whitespace-nowrap hover:scale-105"
            >
              <span>Xem Thử Thách</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* 10-Level Adventure Map */}
        <section>
          <LevelMap
            user={user}
            onSelectLevel={(lvl) => setSelectedLevel(lvl)}
          />
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white/80 border-t border-amber-200 py-6 px-4 text-center mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 font-semibold">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌟</span>
            <span className="font-bold text-slate-800">behocvui Kids English</span>
            <span>• Học Tiếng Anh Cho Trẻ Em</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsParentOpen(true)}
              className="text-amber-700 hover:underline cursor-pointer"
            >
              Khu Vực Phụ Huynh
            </button>
            <button
              onClick={() => setIsProfileOpen(true)}
              className="text-amber-700 hover:underline cursor-pointer"
            >
              Đổi Biệt Hiệu
            </button>
            <span className="text-emerald-700 font-bold">
              ✓ Hoạt động ngoại tuyến
            </span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Lesson & Practice Modal */}
      {selectedLevel && (
        <LessonModal
          levelData={selectedLevel}
          onCompleteLevel={handleCompleteLevel}
          onAddWordPracticeReward={handleAddWordPracticeReward}
          onWordLearned={handleWordLearned}
          onStoryFinished={handleFinishStory}
          onClose={() => setSelectedLevel(null)}
        />
      )}

      {/* Daily Missions Modal */}
      {isDailyMissionsOpen && (
        <DailyMissionsModal
          user={user}
          onClaimMission={handleClaimMission}
          onClaimDailyChest={handleClaimDailyChest}
          onGoToActivity={handleGoToActivity}
          onClose={() => setIsDailyMissionsOpen(false)}
        />
      )}

      {/* 2. Interactive Games Hub */}
      {isGamesOpen && (
        <GameHub
          currentLevel={user.level}
          onFinishGame={handleFinishGame}
          onClose={() => setIsGamesOpen(false)}
        />
      )}

      {/* 3. Shop & Avatar Dressing Room */}
      {isShopOpen && (
        <ShopModal
          user={user}
          onBuyItem={handleBuyItem}
          onEquipItem={handleEquipItem}
          onClose={() => setIsShopOpen(false)}
        />
      )}

      {/* 4. Weekly Leaderboard */}
      {isLeaderboardOpen && (
        <LeaderboardModal
          user={user}
          onStartChallenge={(rival) => {
            setIsLeaderboardOpen(false);
            setChallengingRival(rival);
          }}
          onClose={() => setIsLeaderboardOpen(false)}
        />
      )}

      {/* 5. Parent Dashboard */}
      {isParentOpen && (
        <ParentModal
          user={user}
          settings={parentSettings}
          onUpdateSettings={(s) => setParentSettings(s)}
          onRestoreUser={handleRestoreUser}
          onClose={() => setIsParentOpen(false)}
        />
      )}

      {/* 6. Profile & Nickname Selection */}
      {isProfileOpen && (
        <ProfileModal
          user={user}
          onUpdateProfile={handleUpdateProfile}
          onClose={() => setIsProfileOpen(false)}
        />
      )}

      {/* 7. Screen Time Alert */}
      {isTimeAlertOpen && (
        <TimeLimitAlert
          onDismiss={() => setIsTimeAlertOpen(false)}
          onOpenParent={() => {
            setIsTimeAlertOpen(false);
            setIsParentOpen(true);
          }}
        />
      )}

      {/* 8. Level Up Fireworks Celebration Modal */}
      {levelUpCelebration && (
        <LevelUpCelebrationModal
          newLevel={levelUpCelebration.newLevel}
          mascotId={user.mascotId}
          equipped={user.equipped}
          nickname={user.nickname}
          coinReward={levelUpCelebration.coinReward}
          badgeEmoji={levelUpCelebration.badgeEmoji}
          badgeName={levelUpCelebration.badgeName}
          onClose={() => setLevelUpCelebration(null)}
        />
      )}

      {/* 9. Friend Rival Challenge Modal */}
      {challengingRival && (
        <FriendChallengeModal
          user={user}
          rival={challengingRival}
          onWinChallenge={handleWinChallenge}
          onClose={() => setChallengingRival(null)}
        />
      )}

      {/* 10. Daily Study Reminder Notification Banner */}
      <NotificationBanner
        onActionClick={() => {
          const lvl = LEVELS.find((l) => l.level === user.level) || LEVELS[0];
          setSelectedLevel(lvl);
        }}
      />

      {/* 11. Auth Modal (Đăng Ký, Đăng Nhập, Quên Mật Khẩu) */}
      {isAuthOpen && (
        <AuthModal
          currentAccount={currentAccount}
          onLoginSuccess={(acc) => {
            setCurrentAccount(acc);
            setCurrentAuthAccount(acc);
            // Sync nickname with user
            setUser((prev) => ({
              ...prev,
              nickname: acc.nickname
            }));
            setIsAuthOpen(false);
            setIsPersonalProfileOpen(true);
          }}
          onClose={() => setIsAuthOpen(false)}
        />
      )}

      {/* 12. Personal Profile Modal (Nhân vật Chibi 3D Nam & Nữ, Tủ Đồ 60 Món, Kiếm Sao & Kim Cương, Đổi Mật Khẩu) */}
      {isPersonalProfileOpen && currentAccount && (
        <PersonalProfileModal
          account={currentAccount}
          userState={user}
          onUpdateAccount={(updated) => {
            setCurrentAccount(updated);
            setCurrentAuthAccount(updated);
          }}
          onUpdateUserState={(modifier) => setUser(modifier)}
          onLogout={() => {
            setCurrentAccount(null);
            setCurrentAuthAccount(null);
            setIsPersonalProfileOpen(false);
          }}
          onClose={() => setIsPersonalProfileOpen(false)}
          onOpenGames={() => {
            setIsPersonalProfileOpen(false);
            setIsGamesOpen(true);
          }}
        />
      )}

      {/* 13. Baby Picture Dictionary Modal (Cuốn từ điển của bé - Hình ảnh sinh động & Phát âm lại để ôn tập) */}
      {isDictionaryOpen && (
        <BabyDictionaryModal
          levels={LEVELS}
          user={user}
          onClose={() => setIsDictionaryOpen(false)}
          onRewardReview={handleRewardReview}
          onToggleMasteredWord={handleToggleMasteredWord}
        />
      )}

      {/* 14. Floating Corner Study Advice Widget (Lời khuyên học tập dựa trên lịch sử học của bé) */}
      <StudyAdviceWidget
        user={user}
        levels={LEVELS}
        onSelectLevel={(lvl) => setSelectedLevel(lvl)}
      />

    </div>
  );
}
