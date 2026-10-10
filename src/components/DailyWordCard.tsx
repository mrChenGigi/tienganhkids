import React, { useState, useEffect } from 'react';
import { WordItem, LevelData, UserState } from '../types';
import { sound, speakEnglish, speakVietnamese } from '../utils/audio';
import { MASCOTS } from '../data/curriculum';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Volume2, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Mic, 
  Play, 
  Award, 
  Star, 
  Compass, 
  BookOpen,
  VolumeX,
  Shuffle
} from 'lucide-react';

interface DailyWordCardProps {
  currentLevel: LevelData;
  user: UserState;
  onStartLesson: (level: LevelData) => void;
  onRewardWord: (stars: number, coins: number) => void;
  onWordLearned?: (wordId: string) => void;
}

export const DailyWordCard: React.FC<DailyWordCardProps> = ({
  currentLevel,
  user,
  onStartLesson,
  onRewardWord,
  onWordLearned
}) => {
  // Compute initial daily word index based on today's calendar date & current level
  const words = currentLevel.words && currentLevel.words.length > 0 
    ? currentLevel.words 
    : [
        {
          id: 'default_1',
          word: 'Hello',
          phonetic: '/həˈloʊ/',
          meaning: 'Xin chào',
          example: 'Hello, how are you today?',
          exampleMeaning: 'Xin chào, hôm nay bạn thế nào?',
          category: 'Chào hỏi',
          emoji: '👋',
          difficulty: 'easy' as const
        }
      ];

  const getDayBasedIndex = () => {
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return (dayOfYear + currentLevel.level * 3) % words.length;
  };

  const [currentIndex, setCurrentIndex] = useState<number>(() => getDayBasedIndex());
  const [isPlayingWord, setIsPlayingWord] = useState(false);
  const [isPlayingExample, setIsPlayingExample] = useState(false);
  const [isPracticingMic, setIsPracticingMic] = useState(false);
  const [micFeedback, setMicFeedback] = useState<string | null>(null);
  const [familiarizedWords, setFamiliarizedWords] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('behocvui_daily_familiarized');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Keep within bounds when level changes
  useEffect(() => {
    setCurrentIndex(getDayBasedIndex());
    setMicFeedback(null);
  }, [currentLevel.level]);

  const currentWord: WordItem = words[currentIndex] || words[0];
  const isFamiliarized = familiarizedWords.includes(currentWord.id);

  // Get active mascot
  const activeMascot = MASCOTS.find((m) => m.id === user.mascotId) || MASCOTS[0];

  // Play English pronunciation
  const handlePlayWord = () => {
    sound.playHoverPop(680);
    setIsPlayingWord(true);
    speakEnglish(currentWord.word, 0.85, () => {
      setIsPlayingWord(false);
    });
  };

  // Play English example sentence
  const handlePlayExample = () => {
    sound.playHoverPop(580);
    setIsPlayingExample(true);
    speakEnglish(currentWord.example, 0.9, () => {
      setIsPlayingExample(false);
    });
  };

  // Mark as familiarized and grant coin bonus
  const handleMarkFamiliarized = () => {
    if (isFamiliarized) {
      sound.playSuccess();
      return;
    }

    sound.playStar();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 }
    });

    const nextList = [...familiarizedWords, currentWord.id];
    setFamiliarizedWords(nextList);
    try {
      localStorage.setItem('behocvui_daily_familiarized', JSON.stringify(nextList));
    } catch {
      // ignore
    }

    onRewardWord(3, 5); // +3 stars, +5 coins
    if (onWordLearned) {
      onWordLearned(currentWord.id);
    }
    setMicFeedback('🌟 Giỏi lắm! Bé đã nhận được 5 Sao Vàng thưởng!');
  };

  // Speech practice simulation/recognition
  const handlePracticeMic = () => {
    sound.playClick();
    setIsPracticingMic(true);
    setMicFeedback('🎧 Đang lắng nghe... Bé hãy đọc to: "' + currentWord.word + '"');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 2;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          setIsPracticingMic(false);
          const transcript = event.results[0][0].transcript.toLowerCase().trim();
          const target = currentWord.word.toLowerCase().trim();

          if (transcript.includes(target) || target.includes(transcript)) {
            sound.playLevelUp();
            confetti({
              particleCount: 50,
              spread: 70,
              origin: { y: 0.6 }
            });
            setMicFeedback(`🎉 Tuyệt vời! Bé phát âm rất chuẩn: "${currentWord.word}" (100 điểm)`);
            handleMarkFamiliarized();
          } else {
            sound.playSuccess();
            setMicFeedback(`👏 Rất đáng khen! Bé vừa đọc "${transcript}". Cố lên nhé!`);
            handleMarkFamiliarized();
          }
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = () => {
          simulatePracticeSuccess();
        };

        recognition.onend = () => {
          setIsPracticingMic(false);
        };

        recognition.start();
        return;
      } catch {
        simulatePracticeSuccess();
        return;
      }
    }

    // Fallback if browser doesn't expose speech recognition
    simulatePracticeSuccess();
  };

  const simulatePracticeSuccess = () => {
    setTimeout(() => {
      setIsPracticingMic(false);
      sound.playLevelUp();
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 }
      });
      setMicFeedback(`🌟 Giỏi lắm! Bé đã đọc to từ "${currentWord.word}" thật tự tin!`);
      handleMarkFamiliarized();
    }, 1800);
  };

  // Previous word in this level
  const handlePrev = () => {
    sound.playHoverPop();
    setMicFeedback(null);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : words.length - 1));
  };

  // Next word in this level
  const handleNext = () => {
    sound.playHoverPop();
    setMicFeedback(null);
    setCurrentIndex((prev) => (prev < words.length - 1 ? prev + 1 : 0));
  };

  // Random word in this level
  const handleRandom = () => {
    sound.playHoverPop();
    setMicFeedback(null);
    const rand = Math.floor(Math.random() * words.length);
    setCurrentIndex(rand);
  };

  return (
    <section className="bg-gradient-to-br from-amber-100 via-orange-50 to-amber-50 border-3 border-amber-300 rounded-3xl p-4 sm:p-6 shadow-xl mb-8 relative overflow-hidden transition-all">
      {/* Decorative background badges */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-200/40 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-200/30 rounded-full blur-2xl pointer-events-none" />

      {/* Header bar: Badge and Level Theme Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-amber-200/80 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-xl shadow-md shrink-0 animate-pulse">
            🌟
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-white font-black text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs">
                Từ Vựng Của Ngày • Word of the Day
              </span>
              <span className="text-xs font-bold text-amber-800 hidden md:inline">
                Chủ đề hôm nay
              </span>
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-800 flex items-center gap-1.5 mt-0.5">
              <span>{currentLevel.icon} Cấp {currentLevel.level}:</span>
              <span className="text-orange-950 font-black">{currentLevel.title}</span>
              <span className="text-slate-700 hidden sm:inline">({currentLevel.subtitle})</span>
            </div>
          </div>
        </div>

        {/* Word Switcher & Level Progress */}
        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <span className="text-xs font-bold text-amber-800 bg-white/90 border border-amber-200 px-2.5 py-1 rounded-xl shadow-2xs">
            Từ {currentIndex + 1} / {words.length}
          </span>
          <button
            onClick={handlePrev}
            onMouseEnter={() => sound.playHoverPop()}
            title="Từ trước"
            className="w-8 h-8 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleRandom}
            onMouseEnter={() => sound.playHoverPop()}
            title="Gợi ý từ ngẫu nhiên trong chủ đề"
            className="w-8 h-8 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            onMouseEnter={() => sound.playHoverPop()}
            title="Từ kế tiếp"
            className="w-8 h-8 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Flashcard Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center relative z-10">
        {/* Left: Big Visual Card */}
        <div className="md:col-span-5 bg-white rounded-3xl p-5 border-2 border-amber-200 shadow-md text-center flex flex-col items-center justify-center relative group">
          {/* Difficulty & Category pill */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
              {currentWord.category || 'Từ vựng'}
            </span>
          </div>

          {/* Familiarized Ribbon */}
          {isFamiliarized && (
            <div className="absolute top-3 right-3 flex items-center gap-1 text-[11px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Đã làm quen</span>
            </div>
          )}

          {/* Big Mascot / Word Emoji */}
          <div 
            onClick={handlePlayWord}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-b from-amber-50 to-orange-100 border-2 border-amber-200 flex items-center justify-center text-5xl sm:text-6xl my-2 cursor-pointer shadow-inner hover:scale-110 active:scale-95 transition-transform duration-300 select-none group-hover:rotate-3"
            title="Bấm để nghe phát âm"
          >
            {currentWord.emoji}
          </div>

          {/* English Word */}
          <div className="flex items-center justify-center gap-2 mt-1">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {currentWord.word}
            </h3>
            <button
              onClick={handlePlayWord}
              onMouseEnter={() => sound.playHoverPop()}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isPlayingWord 
                  ? 'bg-amber-500 text-white scale-110 animate-bounce' 
                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200 hover:scale-105'
              }`}
              title="Phát âm từ vựng"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* Phonetic Pronunciation */}
          <div className="text-xs sm:text-sm font-semibold text-amber-700 bg-amber-50 px-3 py-0.5 rounded-full mt-1 border border-amber-200">
            {currentWord.phonetic}
          </div>

          {/* Vietnamese Meaning */}
          <div className="text-base sm:text-lg font-extrabold text-orange-950 mt-2">
            👉 {currentWord.meaning}
          </div>
        </div>

        {/* Right: Example sentence, Mascot tips & Action buttons */}
        <div className="md:col-span-7 flex flex-col justify-between h-full space-y-4">
          {/* Example Sentence Box */}
          <div className="bg-white/95 rounded-2xl p-4 border border-amber-200 shadow-xs relative">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wide flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                Câu ví dụ sinh động
              </span>
              <button
                onClick={handlePlayExample}
                onMouseEnter={() => sound.playHoverPop()}
                className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  isPlayingExample
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Nghe cả câu</span>
              </button>
            </div>

            <p className="text-sm sm:text-base font-bold text-slate-900 italic">
              "{currentWord.example}"
            </p>
            <p className="text-xs sm:text-sm text-slate-800 font-semibold mt-1">
              → {currentWord.exampleMeaning}
            </p>
          </div>

          {/* Feedback & Mascot encouragement banner */}
          <div className="bg-amber-200/50 rounded-2xl p-3 border border-amber-300/80 flex items-center gap-3">
            <div className="text-2xl shrink-0">
              {activeMascot.emoji}
            </div>
            <div className="text-xs sm:text-sm text-amber-950 font-bold flex-1">
              {micFeedback ? (
                <span className="text-emerald-900 font-extrabold">{micFeedback}</span>
              ) : (
                <span>
                  {activeMascot.name} nhắc bé: <strong className="text-orange-900">"{currentWord.word}"</strong> là từ vựng nổi bật của Cấp {currentLevel.level}. Bé hãy nghe rồi đọc to theo nhé!
                </span>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {/* Listen button */}
            <button
              onClick={handlePlayWord}
              onMouseEnter={() => sound.playHoverPop()}
              className="bg-white hover:bg-amber-50 text-slate-800 font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-2xl border-2 border-amber-300 shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 hover:scale-105"
            >
              <Volume2 className="w-4 h-4 text-amber-600" />
              <span>Nghe Phát Âm</span>
            </button>

            {/* Practice Speaking button */}
            <button
              onClick={handlePracticeMic}
              disabled={isPracticingMic}
              onMouseEnter={() => sound.playHoverPop()}
              className={`font-black text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 hover:scale-105 ${
                isPracticingMic
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>{isPracticingMic ? 'Bé đọc to nhé...' : 'Bé Tập Đọc (+5 ⭐)'}</span>
            </button>

            {/* Jump straight to this Level Lesson */}
            <button
              onClick={() => {
                sound.playStar();
                onStartLesson(currentLevel);
              }}
              onMouseEnter={() => sound.playHoverPop()}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ml-auto hover:scale-105"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Học Cấp {currentLevel.level} Ngay</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
