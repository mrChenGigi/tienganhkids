import React, { useState, useMemo, useEffect } from 'react';
import { LevelData, UserState, Mascot, StudyRecord } from '../types';
import { MASCOTS, LEVELS } from '../data/curriculum';
import { sound, speakVietnamese } from '../utils/audio';
import { triggerFireworks } from '../utils/celebration';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Volume2, 
  ChevronRight, 
  X, 
  RotateCcw, 
  Lightbulb, 
  Play, 
  Star, 
  BookOpen, 
  Minimize2, 
  Maximize2 
} from 'lucide-react';

interface StudyAdviceWidgetProps {
  user: UserState;
  levels: LevelData[];
  onSelectLevel: (levelData: LevelData) => void;
}

interface AdviceItem {
  id: string;
  level: LevelData;
  type: 'review_stars' | 'review_accuracy' | 'spaced_repetition' | 'next_challenge';
  badge: string;
  badgeColor: string;
  headline: string;
  adviceMessage: string;
  detailHint: string;
  starsEarned: number;
}

export const StudyAdviceWidget: React.FC<StudyAdviceWidgetProps> = ({
  user,
  levels,
  onSelectLevel
}) => {
  // Widget state: open, minimized, or dismissed
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [adviceIndex, setAdviceIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Active mascot
  const currentMascot: Mascot = useMemo(() => {
    return MASCOTS.find((m) => m.id === user.mascotId) || MASCOTS[0];
  }, [user.mascotId]);

  // Compute intelligent study advice candidates based on user's learning history
  const adviceCandidates = useMemo<AdviceItem[]>(() => {
    const list: AdviceItem[] = [];
    const studyRecords = user.studyRecords || [];
    const levelStars = user.levelStars || {};

    // 1. Look for unlocked levels with 1 or 2 stars (needs review to reach 3 stars)
    const lowStarLevels = levels.filter((lvl) => {
      const stars = levelStars[lvl.level] || 0;
      return lvl.level <= user.level && stars > 0 && stars < 3;
    });

    if (lowStarLevels.length > 0) {
      // Pick the most recent low-star level
      const targetLvl = lowStarLevels[lowStarLevels.length - 1];
      const stars = levelStars[targetLvl.level] || 0;
      list.push({
        id: `stars_${targetLvl.level}`,
        level: targetLvl,
        type: 'review_stars',
        badge: 'Cần Nâng Cấp Sao ⭐',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        headline: `Hôm nay chúng mình cùng ôn lại chủ đề "${targetLvl.title}" nhé!`,
        adviceMessage: `Lần trước bé đã đạt ${stars}/3 sao ở Cấp ${targetLvl.level}. Cùng ôn lại để giành trọn 3 Ngôi Sao Vàng rực rỡ nào! 🌟`,
        detailHint: `Ôn lại 50 từ vựng & cải thiện điểm bài kiểm tra`,
        starsEarned: stars
      });
    }

    // 2. Look for recent study records with accuracy < 80%
    const lowAccuracyRecord = [...studyRecords]
      .reverse()
      .find((r) => r.accuracy < 80 && r.level <= user.level);

    if (lowAccuracyRecord) {
      const targetLvl = levels.find((l) => l.level === lowAccuracyRecord.level);
      if (targetLvl && !list.some((a) => a.level.level === targetLvl.level)) {
        const stars = levelStars[targetLvl.level] || 0;
        list.push({
          id: `acc_${targetLvl.level}`,
          level: targetLvl,
          type: 'review_accuracy',
          badge: 'Củng Cố Kiến Thức 💡',
          badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
          headline: `Hôm nay chúng mình cùng ôn lại chủ đề "${targetLvl.title}" nhé!`,
          adviceMessage: `Lần trước bài học này bé đạt ${lowAccuracyRecord.accuracy}% độ chính xác. Luyện tập thêm một chút là bé sẽ nhớ bài siêu đỉnh luôn! 🚀`,
          detailHint: `Luyện nghe phát âm chuẩn và làm lại câu đố`,
          starsEarned: stars
        });
      }
    }

    // 3. Spaced repetition: Look for completed levels that haven't been reviewed recently
    const completedLevels = levels.filter((lvl) => {
      const stars = levelStars[lvl.level] || 0;
      return lvl.level < user.level || stars >= 3;
    });

    if (completedLevels.length > 0) {
      // Find level whose last record is oldest or not recorded
      const candidate = completedLevels[0]; // First earlier level
      if (!list.some((a) => a.level.level === candidate.level)) {
        list.push({
          id: `spaced_${candidate.level}`,
          level: candidate,
          type: 'spaced_repetition',
          badge: 'Ôn Tập Nhớ Lâu 🧠',
          badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
          headline: `Hôm nay chúng mình cùng ôn lại chủ đề "${candidate.title}" nhé!`,
          adviceMessage: `Đã vài ngày bé chưa ghé thăm Cấp ${candidate.level} rồi. Ôn lại ngay để vốn từ vựng luôn vững vàng và phản xạ thật nhanh nhé! ✨`,
          detailHint: `Nhắc lại các từ vựng thân quen`,
          starsEarned: levelStars[candidate.level] || 3
        });
      }
    }

    // 4. Current / Next unlocked Level challenge
    const currentLevelData = levels.find((l) => l.level === user.level) || levels[0];
    if (!list.some((a) => a.level.level === currentLevelData.level)) {
      list.push({
        id: `current_${currentLevelData.level}`,
        level: currentLevelData,
        type: 'next_challenge',
        badge: 'Chinh Phục Bài Mới 🎯',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        headline: `Hôm nay chúng mình cùng khám phá chủ đề "${currentLevelData.title}" nhé!`,
        adviceMessage: `Cấp ${currentLevelData.level} đang chờ đón bé với 50 từ vựng kỳ thú và huy hiệu phần thưởng hấp dẫn! Cùng bắt đầu thôi nào! 🎉`,
        detailHint: `Bài học mới nhất theo lộ trình của bé`,
        starsEarned: levelStars[currentLevelData.level] || 0
      });
    }

    return list.length > 0 ? list : [
      {
        id: 'default',
        level: levels[0],
        type: 'next_challenge',
        badge: 'Khởi Đầu Hứng Khởi 🌟',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        headline: `Hôm nay chúng mình cùng ôn lại chủ đề "${levels[0].title}" nhé!`,
        adviceMessage: `Mỗi ngày học 1 bài nhỏ giúp bé nói tiếng Anh siêu tự tin! Cùng ${currentMascot.name} học ngay nhé! 🎈`,
        detailHint: `Làm quen 50 từ vựng sinh động`,
        starsEarned: 0
      }
    ];
  }, [user.studyRecords, user.levelStars, user.level, levels, currentMascot.name]);

  // Active advice item
  const currentAdvice: AdviceItem = adviceCandidates[adviceIndex % adviceCandidates.length] || adviceCandidates[0];

  // Read advice aloud in kid-friendly Vietnamese
  const handleSpeakAdvice = () => {
    sound.playClick();
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    const speech = `${currentMascot.name} khuyên: ${currentAdvice.headline} ${currentAdvice.adviceMessage}`;
    speakVietnamese(speech, () => {
      setIsSpeaking(false);
    });
  };

  // Cycle to next advice
  const handleCycleAdvice = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    setAdviceIndex((prev) => (prev + 1) % adviceCandidates.length);
  };

  // Launch into the recommended lesson with celebratory mini fireworks
  const handleGoToLesson = () => {
    sound.playStar();
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
    }

    // Mini fireworks burst celebrating kid's great study spirit
    confetti({
      particleCount: 55,
      spread: 65,
      origin: { x: 0.86, y: 0.84 },
      colors: ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#fbbf24', '#a855f7'],
      scalar: 1.15
    });

    // Secondary burst for festive firework trail
    setTimeout(() => {
      confetti({
        particleCount: 40,
        angle: 85,
        spread: 60,
        origin: { x: 0.82, y: 0.78 },
        colors: ['#fbbf24', '#f43f5e', '#38bdf8', '#4ade80']
      });
    }, 120);

    // Short pause so child sees the fireworks burst before modal opens
    setTimeout(() => {
      onSelectLevel(currentAdvice.level);
    }, 280);
  };

  if (isDismissed) {
    return (
      <button
        onClick={() => {
          sound.playClick();
          setIsDismissed(false);
          setIsMinimized(false);
        }}
        onMouseEnter={() => sound.playHoverPop()}
        title="Mở Lời Khuyên Học Tập"
        className="fixed bottom-5 right-4 z-40 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 text-white p-3 rounded-full shadow-2xl border-2 border-white hover:scale-110 active:scale-95 transition-all cursor-pointer animate-bounce flex items-center justify-center group"
      >
        <span className="text-2xl filter drop-shadow">{currentMascot.emoji}</span>
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-yellow-300"></span>
        </span>
      </button>
    );
  }

  // Minimized floating pill view
  if (isMinimized) {
    return (
      <div className="fixed bottom-5 right-4 z-40 select-none animate-fadeIn">
        <div
          onClick={() => {
            sound.playClick();
            setIsMinimized(false);
          }}
          onMouseEnter={() => sound.playHoverPop()}
          className="bg-white/95 backdrop-blur-md border-2 border-amber-300 rounded-full px-3.5 py-2 shadow-xl flex items-center gap-2.5 cursor-pointer hover:border-amber-400 hover:shadow-2xl transition-all hover:scale-105 group"
        >
          {/* Mascot Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-300 to-orange-400 flex items-center justify-center text-xl shadow-inner border border-white shrink-0 group-hover:rotate-6 transition-transform">
            {currentMascot.emoji}
          </div>

          <div className="text-left">
            <div className="flex items-center gap-1 text-[10px] font-black text-amber-700 uppercase tracking-wide">
              <Lightbulb className="w-3 h-3 text-amber-500 fill-amber-400" />
              <span>Lời khuyên của {currentMascot.name}</span>
            </div>
            <p className="text-xs font-black text-slate-800 line-clamp-1 max-w-[170px]">
              {currentAdvice.headline}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleGoToLesson();
            }}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-1.5 rounded-full shadow-xs hover:scale-110 active:scale-95 transition-transform cursor-pointer ml-1"
            title="Vào học ngay"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(false);
            }}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
            title="Mở rộng widget"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Full Expanded Corner Widget View
  return (
    <aside 
      aria-label="Cố vấn học tập của bé"
      className="fixed bottom-5 right-4 z-40 max-w-sm w-[92vw] sm:w-[360px] select-none animate-fadeIn"
    >
      <div className="relative bg-white/95 backdrop-blur-md rounded-3xl border-4 border-amber-300 shadow-2xl p-4 overflow-hidden group">
        
        {/* Soft background glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-200/40 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-rose-200/30 rounded-full blur-xl pointer-events-none" />

        {/* Top Header Bar */}
        <div className="relative z-10 flex items-center justify-between pb-2.5 border-b border-amber-100 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-lg shadow-sm border border-white">
              {currentMascot.emoji}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-800">
                  {currentMascot.name}
                </span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-md">
                  Cố vấn học tập 💡
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons: Sound, Minimize, Dismiss */}
          <div className="flex items-center gap-1">
            {/* Speak advice aloud button */}
            <button
              onClick={handleSpeakAdvice}
              onMouseEnter={() => sound.playHoverPop()}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                isSpeaking 
                  ? 'bg-amber-500 text-white animate-pulse' 
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-700'
              }`}
              title={isSpeaking ? 'Dừng đọc' : 'Nghe linh vật đọc lời khuyên'}
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* Cycle to another advice */}
            {adviceCandidates.length > 1 && (
              <button
                onClick={handleCycleAdvice}
                onMouseEnter={() => sound.playHoverPop()}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                title="Xem lời khuyên khác"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Minimize */}
            <button
              onClick={() => {
                sound.playClick();
                setIsMinimized(true);
              }}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Thu nhỏ widget"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>

            {/* Dismiss */}
            <button
              onClick={() => {
                sound.playClick();
                setIsDismissed(true);
              }}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              title="Đóng widget"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Reason Badge */}
        <div className="relative z-10 flex items-center justify-between mb-2">
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${currentAdvice.badgeColor}`}>
            {currentAdvice.badge}
          </span>
          <span className="text-[10px] font-bold text-slate-400">
            Dựa trên lịch sử học của bé
          </span>
        </div>

        {/* Mascot Advice Speech Bubble */}
        <div className="relative z-10 bg-gradient-to-br from-amber-50 to-orange-50/60 rounded-2xl p-3 border-2 border-amber-200 shadow-inner mb-3">
          <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
            {currentAdvice.headline}
          </h4>
          <p className="text-[11px] sm:text-xs text-slate-700 font-medium mt-1 leading-relaxed">
            {currentAdvice.adviceMessage}
          </p>

          {/* Recommended Level Preview Card */}
          <div className="mt-2.5 pt-2 border-t border-amber-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-2xl filter drop-shadow">
                {currentAdvice.level.icon}
              </span>
              <div>
                <div className="font-extrabold text-slate-800 text-[11px] truncate max-w-[180px]">
                  Cấp {currentAdvice.level.level}: {currentAdvice.level.title}
                </div>
                <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                  <span>50 từ • 50 câu đố</span>
                  {currentAdvice.starsEarned > 0 && (
                    <span className="text-amber-600 font-bold flex items-center gap-0.5 ml-1">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-400 inline" />
                      <span>{currentAdvice.starsEarned}/3 sao</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Launch Button */}
        <div className="relative z-10 flex items-center gap-2">
          <button
            onClick={handleGoToLesson}
            onMouseEnter={() => sound.playHoverPop()}
            className="flex-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-xs sm:text-sm py-2.5 px-4 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] border border-amber-300"
            title="Ôn tập ngay cùng linh vật và nhận pháo hoa chúc mừng"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Ôn Tập Ngay</span>
            <Sparkles className="w-4 h-4 text-yellow-200 fill-yellow-200 animate-pulse" />
          </button>
        </div>

      </div>
    </aside>
  );
};
