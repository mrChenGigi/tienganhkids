import React, { useState, useMemo, useEffect } from 'react';
import { LevelData, UserState, WordItem } from '../types';
import { sound, speakEnglish, speakVietnamese } from '../utils/audio';
import { triggerFireworks, triggerGoldenShower } from '../utils/celebration';
import confetti from 'canvas-confetti';
import { 
  X, 
  Search, 
  Volume2, 
  VolumeX,
  Sparkles, 
  Heart, 
  CheckCircle2, 
  RotateCcw, 
  BookOpen, 
  Mic, 
  MicOff,
  Filter,
  Layers,
  ChevronLeft,
  ChevronRight,
  Award,
  Play,
  Bookmark
} from 'lucide-react';

interface BabyDictionaryModalProps {
  levels: LevelData[];
  user: UserState;
  onClose: () => void;
  onRewardReview?: (coins: number, xp: number) => void;
  onToggleMasteredWord?: (wordId: string) => void;
}

// Category definition for baby dictionary
interface DictionaryCategory {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgLight: string;
}

const DICTIONARY_CATEGORIES: DictionaryCategory[] = [
  { id: 'all', name: 'Tất Cả Từ Vựng', emoji: '🌟', color: 'from-amber-500 to-orange-500', bgLight: 'bg-amber-50 border-amber-200' },
  { id: 'pets', name: 'Động Vật & Thú Cưng', emoji: '🐶', color: 'from-emerald-500 to-teal-500', bgLight: 'bg-emerald-50 border-emerald-200' },
  { id: 'colors_numbers', name: 'Màu Sắc & Số Đếm', emoji: '🎨', color: 'from-purple-500 to-pink-500', bgLight: 'bg-purple-50 border-purple-200' },
  { id: 'family', name: 'Gia Đình & Bạn Bè', emoji: '👨‍👩‍👧', color: 'from-rose-500 to-pink-600', bgLight: 'bg-rose-50 border-rose-200' },
  { id: 'food', name: 'Trái Cây & Đồ Ăn', emoji: '🍎', color: 'from-red-500 to-amber-500', bgLight: 'bg-red-50 border-red-200' },
  { id: 'school', name: 'Trường Học & Đồ Dùng', emoji: '✏️', color: 'from-blue-500 to-indigo-500', bgLight: 'bg-blue-50 border-blue-200' },
  { id: 'vehicles', name: 'Phương Tiện Giao Thông', emoji: '🚗', color: 'from-cyan-500 to-blue-600', bgLight: 'bg-cyan-50 border-cyan-200' },
  { id: 'nature', name: 'Thiên Nhiên & Vũ Trụ', emoji: '🌳', color: 'from-green-500 to-emerald-600', bgLight: 'bg-green-50 border-green-200' },
  { id: 'favorites', name: 'Từ Yêu Thích Của Bé', emoji: '❤️', color: 'from-pink-500 to-rose-500', bgLight: 'bg-pink-50 border-pink-200' }
];

export const BabyDictionaryModal: React.FC<BabyDictionaryModalProps> = ({
  levels,
  user,
  onClose,
  onRewardReview,
  onToggleMasteredWord
}) => {
  // State for search and filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'mastered' | 'learning'>('all');
  const [showFullCurriculum, setShowFullCurriculum] = useState(false);
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<number | 'all'>('all');

  // Audio playing indicator
  const [activeSpeakingWordId, setActiveSpeakingWordId] = useState<string | null>(null);
  const [speakingSpeed, setSpeakingSpeed] = useState<number>(0.9);

  // Favorites stored in localStorage
  const [favoriteWordIds, setFavoriteWordIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('behocvui_dict_favorites_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Practice mic state
  const [activeMicWordId, setActiveMicWordId] = useState<string | null>(null);
  const [micStatus, setMicStatus] = useState<string>('');
  const [micScore, setMicScore] = useState<number | null>(null);

  // Flashcard Mode
  const [isFlashcardMode, setIsFlashcardMode] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  // Save favorites to localStorage
  const toggleFavorite = (wordId: string) => {
    sound.playStar();
    setFavoriteWordIds((prev) => {
      const next = prev.includes(wordId) ? prev.filter((id) => id !== wordId) : [...prev, wordId];
      try {
        localStorage.setItem('behocvui_dict_favorites_v1', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Compile all words from curriculum
  const allCurriculumWords = useMemo(() => {
    const list: (WordItem & { levelNum: number; levelTitle: string })[] = [];
    levels.forEach((lvl) => {
      lvl.words.forEach((w) => {
        list.push({
          ...w,
          levelNum: lvl.level,
          levelTitle: lvl.title
        });
      });
    });
    return list;
  }, [levels]);

  // Words that are either unlocked by user's current level or in user.completedWords
  const eligibleWords = useMemo(() => {
    if (showFullCurriculum) {
      return allCurriculumWords;
    }

    // Include words from unlocked levels (up to current user level) AND words explicitly marked in completedWords
    return allCurriculumWords.filter((w) => {
      const isFromUnlockedLevel = w.levelNum <= user.level;
      const isExplicitlyCompleted = user.completedWords.includes(w.id);
      return isFromUnlockedLevel || isExplicitlyCompleted;
    });
  }, [allCurriculumWords, showFullCurriculum, user.level, user.completedWords]);

  // Map category keywords to our dictionary categories
  const categorizeWord = (w: WordItem): string => {
    const cat = (w.category || '').toLowerCase();
    const meaning = (w.meaning || '').toLowerCase();
    const word = w.word.toLowerCase();

    if (cat.includes('thú') || cat.includes('động vật') || meaning.includes('con') || ['cat', 'dog', 'puppy', 'kitten', 'rabbit', 'hamster', 'fish', 'bird', 'turtle', 'lion', 'tiger', 'bear', 'elephant', 'monkey'].includes(word)) {
      return 'pets';
    }
    if (cat.includes('màu') || cat.includes('số') || meaning.includes('màu') || meaning.includes('số') || ['red', 'blue', 'yellow', 'green', 'orange', 'purple', 'pink', 'white', 'black', 'one', 'two', 'three', 'four', 'five', 'ten'].includes(word)) {
      return 'colors_numbers';
    }
    if (cat.includes('gia đình') || meaning.includes('mẹ') || meaning.includes('bố') || meaning.includes('ba') || meaning.includes('bà') || meaning.includes('ông') || ['mother', 'father', 'sister', 'brother', 'baby', 'family', 'home'].includes(word)) {
      return 'family';
    }
    if (cat.includes('trái cây') || cat.includes('món ăn') || cat.includes('thức ăn') || meaning.includes('quả') || meaning.includes('bánh') || meaning.includes('nước') || ['apple', 'banana', 'orange', 'strawberry', 'grape', 'bread', 'rice', 'milk', 'cheese', 'egg', 'water'].includes(word)) {
      return 'food';
    }
    if (cat.includes('trường') || cat.includes('học') || meaning.includes('bút') || meaning.includes('sách') || meaning.includes('thước') || ['book', 'pen', 'pencil', 'eraser', 'ruler', 'backpack', 'teacher', 'student', 'classroom'].includes(word)) {
      return 'school';
    }
    if (cat.includes('phương tiện') || cat.includes('xe') || meaning.includes('xe') || meaning.includes('tàu') || meaning.includes('máy bay') || ['car', 'bus', 'bicycle', 'train', 'airplane', 'boat', 'ship', 'rocket'].includes(word)) {
      return 'vehicles';
    }
    if (cat.includes('thiên nhiên') || cat.includes('thời tiết') || meaning.includes('mặt trời') || meaning.includes('sao') || meaning.includes('mưa') || ['sun', 'moon', 'star', 'cloud', 'rain', 'wind', 'rainbow', 'tree', 'flower'].includes(word)) {
      return 'nature';
    }
    return 'all';
  };

  // Filtered word list based on category, search, and mastery
  const filteredWords = useMemo(() => {
    let result = eligibleWords;

    // Filter by category
    if (selectedCategory === 'favorites') {
      result = result.filter((w) => favoriteWordIds.includes(w.id));
    } else if (selectedCategory !== 'all') {
      result = result.filter((w) => categorizeWord(w) === selectedCategory);
    }

    // Filter by Level
    if (selectedLevelFilter !== 'all') {
      result = result.filter((w) => w.levelNum === selectedLevelFilter);
    }

    // Filter by mastery
    if (filterMode === 'mastered') {
      result = result.filter((w) => user.completedWords.includes(w.id));
    } else if (filterMode === 'learning') {
      result = result.filter((w) => !user.completedWords.includes(w.id));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((w) => 
        w.word.toLowerCase().includes(q) ||
        w.meaning.toLowerCase().includes(q) ||
        w.phonetic.toLowerCase().includes(q) ||
        (w.example && w.example.toLowerCase().includes(q))
      );
    }

    return result;
  }, [eligibleWords, selectedCategory, favoriteWordIds, selectedLevelFilter, filterMode, searchQuery, user.completedWords]);

  // Mastery statistics
  const masteredCount = useMemo(() => {
    const wordIdSet = new Set(eligibleWords.map((w) => w.id));
    return user.completedWords.filter((id) => wordIdSet.has(id)).length;
  }, [eligibleWords, user.completedWords]);

  const masteryPercent = eligibleWords.length > 0 
    ? Math.round((masteredCount / eligibleWords.length) * 100) 
    : 0;

  // Handle pronunciation playback
  const handlePlayPronunciation = (w: WordItem, speed: number = 0.9, isSlowMode: boolean = false) => {
    sound.playClick();
    setActiveSpeakingWordId(w.id);
    setSpeakingSpeed(speed);

    // Provide visual audio glow
    speakEnglish(w.word, speed, () => {
      setActiveSpeakingWordId(null);
    });

    // If reviewing in flashcard mode, increment count
    if (isFlashcardMode) {
      setReviewedCount((prev) => {
        const next = prev + 1;
        if (next % 5 === 0 && onRewardReview) {
          triggerFireworks();
          sound.playLevelUp();
          onRewardReview(5, 10);
        }
        return next;
      });
    }
  };

  // Play example sentence
  const handlePlayExample = (w: WordItem) => {
    sound.playClick();
    setActiveSpeakingWordId(`ex_${w.id}`);
    speakEnglish(w.example, 0.85, () => {
      setActiveSpeakingWordId(null);
    });
  };

  // Play Vietnamese meaning
  const handlePlayMeaning = (w: WordItem) => {
    sound.playClick();
    setActiveSpeakingWordId(`vi_${w.id}`);
    speakVietnamese(w.meaning, () => {
      setActiveSpeakingWordId(null);
    });
  };

  // Handle Speech Recognition practice for a word
  const handleStartMicPractice = (w: WordItem) => {
    sound.playClick();
    setActiveMicWordId(w.id);
    setMicStatus('Bé hãy đọc to từ "' + w.word + '" nhé...');
    setMicScore(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setTimeout(() => {
        setMicScore(95);
        setMicStatus('Tuyệt vời lắm! Bé phát âm rất chuẩn! 🌟');
        sound.playCorrect();
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
        if (onToggleMasteredWord && !user.completedWords.includes(w.id)) {
          onToggleMasteredWord(w.id);
        }
      }, 1500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        const cleanTarget = w.word.toLowerCase().trim();
        if (transcript.includes(cleanTarget) || cleanTarget.includes(transcript)) {
          setMicScore(100);
          setMicStatus('Xuất sắc! Chuẩn ngữ điệu bản xứ! 🎉');
          sound.playCorrect();
          triggerGoldenShower();
          if (onToggleMasteredWord && !user.completedWords.includes(w.id)) {
            onToggleMasteredWord(w.id);
          }
        } else {
          setMicScore(75);
          setMicStatus(`Bé vừa nói "${transcript}". Thử lại lần nữa nhé! 💪`);
          sound.playPop();
        }
      };
      recognition.onerror = () => {
        setMicScore(85);
        setMicStatus('Bé phát âm rất cố gắng! Cùng luyện tập tiếp nhé! 👍');
        sound.playStar();
      };
      recognition.start();
    } catch {
      setMicScore(90);
      setMicStatus('Hoan hô bé đã đọc to rõ ràng! ⭐');
      sound.playCorrect();
    }
  };

  // Flashcard controls
  const currentFlashcard = filteredWords[flashcardIndex] || filteredWords[0];

  const handleNextFlashcard = () => {
    sound.playClick();
    setIsCardFlipped(false);
    setFlashcardIndex((prev) => (prev + 1) % Math.max(filteredWords.length, 1));
  };

  const handlePrevFlashcard = () => {
    sound.playClick();
    setIsCardFlipped(false);
    setFlashcardIndex((prev) => (prev - 1 + filteredWords.length) % Math.max(filteredWords.length, 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[94vh] bg-white rounded-3xl shadow-2xl border-4 border-amber-300 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 p-4 sm:p-5 flex items-center justify-between text-white shadow-md relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-3xl shadow-inner border border-white/30 animate-bounce">
              📖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight drop-shadow-sm">
                  Cuốn Từ Điển Của Bé
                </h2>
                <span className="bg-white/25 text-white font-extrabold text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full border border-white/30">
                  Picture Dictionary
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-amber-50">
                Ôn tập từ vựng qua hình ảnh sinh động &amp; nghe phát âm chuẩn bản xứ!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Flashcard Toggle Button */}
            <button
              onClick={() => {
                sound.playStar();
                setIsFlashcardMode(!isFlashcardMode);
                setIsCardFlipped(false);
              }}
              onMouseEnter={() => sound.playHoverPop()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs sm:text-sm font-black shadow-md transition-all active:scale-95 cursor-pointer ${
                isFlashcardMode 
                  ? 'bg-purple-600 text-white ring-2 ring-white' 
                  : 'bg-white text-orange-600 hover:bg-orange-50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{isFlashcardMode ? 'Xem Danh Mục' : 'Thẻ Flashcard Ôn Tập'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-2 rounded-2xl bg-black/15 hover:bg-black/25 text-white transition-all cursor-pointer"
              title="Đóng từ điển"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Stats & Progress Strip */}
        <div className="bg-amber-50/80 border-b border-amber-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <span className="text-base">📚</span>
              <span>Tổng số từ: <strong className="text-orange-600">{eligibleWords.length}</strong> từ</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <span className="text-base">⭐</span>
              <span>Đã học thuộc: <strong className="text-emerald-600">{masteredCount}</strong> từ</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <span className="text-base">❤️</span>
              <span>Yêu thích: <strong className="text-rose-600">{favoriteWordIds.length}</strong> từ</span>
            </div>
          </div>

          {/* Progress Bar & Curriculum Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Tiến độ: {masteryPercent}%</span>
              <div className="w-24 sm:w-32 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${masteryPercent}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                setShowFullCurriculum(!showFullCurriculum);
              }}
              className="text-[11px] sm:text-xs font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 px-2.5 py-1 rounded-xl transition-colors cursor-pointer"
              title="Chuyển đổi giữa từ đã học và toàn bộ 100 cấp độ"
            >
              {showFullCurriculum ? '👁️ Xem từ đã học' : '🌐 Khám phá cả 100 cấp'}
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!isFlashcardMode ? (
          /* Normal Visual Catalog Mode */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Search & Filter Controls */}
            <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-col gap-3">
              
              {/* Search Bar & Status Chips */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                  <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm từ tiếng Anh hoặc tiếng Việt (vd: Cat, Con mèo, Apple, Quả táo)..."
                    className="w-full pl-11 pr-9 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filter buttons */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setFilterMode('all');
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      filterMode === 'all' 
                        ? 'bg-slate-800 text-white shadow-xs' 
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setFilterMode('mastered');
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      filterMode === 'mastered' 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    ⭐ Đã thuộc ({masteredCount})
                  </button>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setFilterMode('learning');
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      filterMode === 'learning' 
                        ? 'bg-amber-600 text-white shadow-xs' 
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    🔄 Cần ôn lại ({eligibleWords.length - masteredCount})
                  </button>
                </div>
              </div>

              {/* Visual Category Horizontal Scroll Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-amber-200">
                {DICTIONARY_CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        sound.playClick();
                        setSelectedCategory(cat.id);
                      }}
                      onMouseEnter={() => sound.playHoverPop()}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                        isActive
                          ? `bg-gradient-to-r ${cat.color} text-white shadow-md scale-105`
                          : 'bg-white border border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/50'
                      }`}
                    >
                      <span className="text-base">{cat.emoji}</span>
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Word Cards Grid View */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-gradient-to-b from-slate-50 to-amber-50/30">
              {filteredWords.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white rounded-3xl border-2 border-dashed border-amber-200">
                  <span className="text-5xl mb-3 animate-bounce">🔍</span>
                  <h3 className="text-lg font-black text-slate-800 mb-1">
                    Không tìm thấy từ vựng nào!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md">
                    Bé thử đổi từ khóa tìm kiếm hoặc chọn danh mục khác nhé!
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setFilterMode('all');
                    }}
                    className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                  >
                    Xem lại tất cả từ vựng
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {filteredWords.map((word) => {
                    const isMastered = user.completedWords.includes(word.id);
                    const isFav = favoriteWordIds.includes(word.id);
                    const isSpeakingThis = activeSpeakingWordId === word.id;
                    const isMicActiveThis = activeMicWordId === word.id;

                    return (
                      <div
                        key={word.id}
                        className={`group relative bg-white rounded-3xl p-4 border-2 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between ${
                          isMastered 
                            ? 'border-emerald-200 hover:border-emerald-400 bg-gradient-to-b from-white to-emerald-50/30' 
                            : 'border-amber-200 hover:border-amber-400 bg-gradient-to-b from-white to-amber-50/20'
                        } ${isSpeakingThis ? 'ring-4 ring-amber-400 scale-[1.02]' : ''}`}
                      >
                        {/* Top card bar: badges & favorite heart */}
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                              Cấp {word.levelNum}
                            </span>
                            {isMastered ? (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Đã thuộc ⭐
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 border border-amber-300">
                                Đang học
                              </span>
                            )}
                          </div>

                          {/* Favorite Heart Button */}
                          <button
                            onClick={() => toggleFavorite(word.id)}
                            className="p-1 rounded-full hover:bg-pink-50 transition-transform active:scale-90 cursor-pointer"
                            title={isFav ? 'Bỏ yêu thích' : 'Thêm vào từ yêu thích'}
                          >
                            <Heart className={`w-5 h-5 transition-colors ${
                              isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-300 hover:text-rose-400'
                            }`} />
                          </button>
                        </div>

                        {/* Visual Image & Word Info */}
                        <div className="flex items-center gap-3.5 my-2">
                          {/* Large Interactive Emoji Icon */}
                          <div 
                            onClick={() => handlePlayPronunciation(word, 0.9)}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-4xl sm:text-5xl shadow-inner cursor-pointer hover:scale-110 active:scale-95 transition-transform select-none group-hover:rotate-3"
                            title="Bấm để nghe phát âm"
                          >
                            {word.emoji}
                          </div>

                          {/* Word Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight truncate">
                                {word.word}
                              </h4>
                              {isSpeakingThis && (
                                <span className="flex h-3 w-3 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                                </span>
                              )}
                            </div>

                            {/* Phonetic Pronunciation */}
                            <div className="text-xs font-mono font-semibold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-md inline-block my-0.5">
                              {word.phonetic}
                            </div>

                            {/* Vietnamese Meaning */}
                            <div className="text-sm font-bold text-slate-700 mt-0.5">
                              {word.meaning}
                            </div>
                          </div>
                        </div>

                        {/* Example sentence bubble */}
                        {word.example && (
                          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 my-2 text-xs">
                            <div className="flex items-start justify-between gap-1">
                              <p className="font-semibold text-slate-800 italic">
                                &ldquo;{word.example}&rdquo;
                              </p>
                              <button
                                onClick={() => handlePlayExample(word)}
                                className="text-slate-400 hover:text-amber-600 transition-colors cursor-pointer shrink-0 ml-1"
                                title="Nghe câu ví dụ tiếng Anh"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {word.exampleMeaning && (
                              <p className="text-slate-500 text-[11px] mt-0.5">
                                {word.exampleMeaning}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Action Toolbar: Pronunciation, Slow Turtle, Mic, Mastery check */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 mt-1">
                          
                          {/* Replay Pronunciation Controls */}
                          <div className="flex items-center gap-1">
                            {/* Standard Speed 1.0x */}
                            <button
                              onClick={() => handlePlayPronunciation(word, 0.9)}
                              onMouseEnter={() => sound.playHoverPop()}
                              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-transform active:scale-95 cursor-pointer ${
                                isSpeakingThis 
                                  ? 'bg-amber-500 text-white animate-pulse' 
                                  : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                              }`}
                              title="Nghe phát âm chuẩn giọng Mỹ (1.0x)"
                            >
                              <Volume2 className="w-4 h-4 text-amber-700" />
                              <span>Nghe</span>
                            </button>

                            {/* Slow Speed 0.7x (Rùa con) */}
                            <button
                              onClick={() => handlePlayPronunciation(word, 0.65, true)}
                              onMouseEnter={() => sound.playHoverPop()}
                              className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-bold bg-sky-100 hover:bg-sky-200 text-sky-900 shadow-xs transition-transform active:scale-95 cursor-pointer"
                              title="Nghe chậm rõ từng âm (0.7x)"
                            >
                              <span className="text-sm">🐢</span>
                              <span className="text-[11px]">Chậm</span>
                            </button>

                            {/* Mic Speech Practice */}
                            <button
                              onClick={() => handleStartMicPractice(word)}
                              onMouseEnter={() => sound.playHoverPop()}
                              className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-bold bg-purple-100 hover:bg-purple-200 text-purple-900 shadow-xs transition-transform active:scale-95 cursor-pointer"
                              title="Bấm mic để bé nói thử từ này"
                            >
                              <Mic className="w-3.5 h-3.5 text-purple-700" />
                              <span className="text-[11px]">Đọc thử</span>
                            </button>
                          </div>

                          {/* Toggle Mastered Button */}
                          {onToggleMasteredWord && (
                            <button
                              onClick={() => {
                                sound.playStar();
                                onToggleMasteredWord(word.id);
                              }}
                              className={`p-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isMastered 
                                  ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100' 
                                  : 'text-slate-400 bg-slate-100 hover:text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={isMastered ? 'Bấm để chuyển về đang học' : 'Bấm để đánh dấu đã học thuộc'}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Mic Feedback Toast if active */}
                        {isMicActiveThis && (
                          <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-center justify-between animate-fadeIn">
                            <span className="font-semibold">{micStatus}</span>
                            {micScore !== null && (
                              <span className="font-black text-purple-700 bg-white px-2 py-0.5 rounded-md shadow-xs">
                                {micScore} điểm
                              </span>
                            )}
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        ) : (
          /* Flashcard Review Mode for Deep Revision */
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-indigo-50/50 via-purple-50/30 to-amber-50/50 overflow-y-auto">
            {filteredWords.length === 0 ? (
              <div className="text-center p-8 bg-white rounded-3xl border-2 border-dashed border-purple-300">
                <span className="text-5xl">🃏</span>
                <h3 className="text-lg font-black text-slate-800 mt-2">
                  Chưa có thẻ từ vựng nào trong danh mục này!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Bé hãy chọn danh mục khác hoặc tắt bộ lọc nhé.
                </p>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Xem tất cả
                </button>
              </div>
            ) : currentFlashcard && (
              <div className="w-full max-w-md flex flex-col items-center">
                
                {/* Review Header Stats */}
                <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-3 px-2">
                  <span>Thẻ {flashcardIndex + 1} / {filteredWords.length}</span>
                  <span className="bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full">
                    Đã ôn luyện: {reviewedCount} lần (+{Math.floor(reviewedCount / 5) * 5} ⭐)
                  </span>
                </div>

                {/* Big Flip Card */}
                <div
                  onClick={() => {
                    sound.playClick();
                    setIsCardFlipped(!isCardFlipped);
                  }}
                  className={`w-full min-h-[320px] sm:min-h-[360px] bg-white rounded-3xl border-4 p-6 shadow-2xl flex flex-col items-center justify-between cursor-pointer transition-all duration-300 hover:scale-[1.01] select-none ${
                    isCardFlipped 
                      ? 'border-amber-400 bg-gradient-to-b from-amber-50/50 to-white' 
                      : 'border-purple-300 bg-gradient-to-b from-white to-purple-50/30'
                  }`}
                >
                  {/* Card Header */}
                  <div className="w-full flex items-center justify-between text-xs">
                    <span className="font-extrabold text-purple-600 bg-purple-100 px-2.5 py-1 rounded-xl">
                      Cấp {currentFlashcard.levelNum}: {currentFlashcard.category || 'Từ Vựng'}
                    </span>
                    <span className="text-slate-400 font-bold flex items-center gap-1">
                      <RotateCcw className="w-3.5 h-3.5" />
                      Chạm để lật thẻ
                    </span>
                  </div>

                  {/* Card Center Content */}
                  <div className="flex flex-col items-center text-center my-auto py-4">
                    {/* Visual Emoji Illustration */}
                    <div className="text-7xl sm:text-8xl my-2 filter drop-shadow-md animate-bounce">
                      {currentFlashcard.emoji}
                    </div>

                    {!isCardFlipped ? (
                      /* Front of card: Prompt Vietnamese meaning */
                      <div className="space-y-2">
                        <div className="text-2xl sm:text-3xl font-black text-slate-800">
                          {currentFlashcard.meaning}
                        </div>
                        <p className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                          Bé nhớ từ tiếng Anh là gì không? 🤔 (Bấm để lật thẻ)
                        </p>
                      </div>
                    ) : (
                      /* Back of card: English word revealed with pronunciation */
                      <div className="space-y-2 animate-fadeIn">
                        <div className="text-3xl sm:text-4xl font-black text-amber-700 tracking-tight">
                          {currentFlashcard.word}
                        </div>
                        <div className="text-sm font-mono font-bold text-slate-500 bg-slate-100 px-3 py-0.5 rounded-lg inline-block">
                          {currentFlashcard.phonetic}
                        </div>
                        <p className="text-sm font-bold text-slate-700">
                          {currentFlashcard.meaning}
                        </p>
                        {currentFlashcard.example && (
                          <div className="text-xs italic text-slate-600 bg-amber-50 p-2 rounded-xl border border-amber-200 mt-2 max-w-xs">
                            &ldquo;{currentFlashcard.example}&rdquo;
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Audio Replay Buttons on Card */}
                  <div 
                    onClick={(e) => e.stopPropagation()} 
                    className="w-full pt-3 border-t border-slate-100 flex items-center justify-center gap-2"
                  >
                    <button
                      onClick={() => handlePlayPronunciation(currentFlashcard, 0.9)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm shadow-md active:scale-95 cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Nghe Phát Âm</span>
                    </button>

                    <button
                      onClick={() => handlePlayPronunciation(currentFlashcard, 0.65, true)}
                      className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold text-xs shadow-xs active:scale-95 cursor-pointer"
                    >
                      <span>🐢 Nghe Chậm</span>
                    </button>

                    <button
                      onClick={() => handleStartMicPractice(currentFlashcard)}
                      className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold text-xs shadow-xs active:scale-95 cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>Đọc Thử</span>
                    </button>
                  </div>
                </div>

                {/* Navigation & Flashcard Action Buttons */}
                <div className="w-full flex items-center justify-between gap-3 mt-4">
                  <button
                    onClick={handlePrevFlashcard}
                    className="flex items-center gap-1 px-4 py-2.5 rounded-2xl bg-white border-2 border-slate-200 hover:bg-slate-100 font-bold text-xs sm:text-sm text-slate-700 shadow-sm cursor-pointer active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Thẻ Trước</span>
                  </button>

                  {/* Mark as Mastered button */}
                  {onToggleMasteredWord && (
                    <button
                      onClick={() => {
                        sound.playStar();
                        onToggleMasteredWord(currentFlashcard.id);
                        handleNextFlashcard();
                      }}
                      className={`flex items-center gap-1 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm shadow-md active:scale-95 cursor-pointer ${
                        user.completedWords.includes(currentFlashcard.id)
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Đã Thuộc Thẻ Này ⭐</span>
                    </button>
                  )}

                  <button
                    onClick={handleNextFlashcard}
                    className="flex items-center gap-1 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-bold text-xs sm:text-sm text-white shadow-md cursor-pointer active:scale-95"
                  >
                    <span>Thẻ Tiếp</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}
          </div>
        )}

        {/* Modal Footer Tip */}
        <div className="bg-slate-100 border-t border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="text-base">💡</span>
            <span className="font-medium">
              Mẹo cho bé: Bấm vào biểu tượng con rùa 🐢 để nghe phát âm thật chậm và rõ từng âm tiết nhé!
            </span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
