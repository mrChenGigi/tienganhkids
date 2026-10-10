import React, { useState, useEffect } from 'react';
import { WordItem } from '../../types';
import { sound, speakEnglish } from '../../utils/audio';
import { triggerFireworks, triggerCenterExplosion } from '../../utils/celebration';
import confetti from 'canvas-confetti';
import { Trophy, RefreshCw, Zap, Award, Flame } from 'lucide-react';

interface VocabSpeedRunnerGameProps {
  words: WordItem[];
  difficultyLevel: number; // 1: Dễ (20s/câu, 2 options), 2: Trung Bình (12s, 3 options), 3: Nâng Cao (8s, 4 options), 4: Siêu Tốc (5s, 4 options)
  onFinish: (score: number, coins: number) => void;
  onExit: () => void;
}

export const VocabSpeedRunnerGame: React.FC<VocabSpeedRunnerGameProps> = ({
  words,
  difficultyLevel = 1,
  onFinish,
  onExit
}) => {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isGameOver, setIsGameOver] = useState(false);
  const [options, setOptions] = useState<{ id: string; text: string; emoji: string; isCorrect: boolean }[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const totalRounds = 5;
  const timePerQuestion = difficultyLevel === 1 ? 18 : difficultyLevel === 2 ? 12 : difficultyLevel === 3 ? 8 : 5;
  const currentWord = words[round % words.length] || words[0];

  // Setup round
  const setupRound = (rIdx: number) => {
    if (rIdx >= totalRounds) {
      handleGameWin();
      return;
    }

    const target = words[rIdx % words.length];
    setTimeLeft(timePerQuestion);
    setFeedback(null);
    speakEnglish(target.word);

    // Number of options based on difficulty
    const numDistractors = difficultyLevel === 1 ? 1 : difficultyLevel === 2 ? 2 : 3;
    const others = words.filter((w) => w.id !== target.id);
    const shuffledOthers = [...others].sort(() => 0.5 - Math.random()).slice(0, numDistractors);

    const roundList = [
      { id: target.id, text: target.meaning, emoji: target.emoji, isCorrect: true },
      ...shuffledOthers.map((o) => ({ id: o.id, text: o.meaning, emoji: o.emoji, isCorrect: false }))
    ].sort(() => 0.5 - Math.random());

    setOptions(roundList);
  };

  useEffect(() => {
    setupRound(round);
  }, [round]);

  // Timer countdown
  useEffect(() => {
    if (isGameOver || feedback !== null) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [round, isGameOver, feedback]);

  const handleTimeout = () => {
    sound.playWrong();
    setFeedback('wrong');
    setStreak(0);
    setTimeout(() => {
      setRound((r) => r + 1);
    }, 1200);
  };

  const handleSelectOption = (isCorrect: boolean) => {
    if (feedback !== null || isGameOver) return;

    if (isCorrect) {
      sound.playSuccess();
      setFeedback('correct');
      const bonusStreak = streak + 1;
      setStreak(bonusStreak);
      const points = 10 + bonusStreak * 5 + timeLeft * 2;
      setScore((s) => s + points);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    } else {
      sound.playWrong();
      setFeedback('wrong');
      setStreak(0);
    }

    setTimeout(() => {
      setRound((r) => r + 1);
    }, 1100);
  };

  const handleGameWin = () => {
    setIsGameOver(true);
    triggerFireworks();
    sound.playTada();
  };

  const coinsEarned = Math.round(score / 3) + 20;

  return (
    <div className="bg-slate-50 rounded-3xl p-4 sm:p-6 border-2 border-indigo-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <div>
            <h3 className="font-black text-sm text-indigo-950">
              Đua Thuyền Tốc Độ (Cấp Độ {difficultyLevel})
            </h3>
            <p className="text-[11px] text-slate-500 font-semibold">
              Vòng {Math.min(round + 1, totalRounds)} / {totalRounds} • Thời gian giới hạn!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {streak > 1 && (
            <span className="flex items-center gap-1 bg-orange-100 text-orange-700 font-black text-xs px-2 py-1 rounded-xl animate-pulse">
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" /> Chuỗi x{streak}
            </span>
          )}
          <span className="bg-amber-100 text-amber-800 font-black text-xs px-2.5 py-1 rounded-xl">
            ⭐ {score} điểm
          </span>
        </div>
      </div>

      {!isGameOver ? (
        <div className="space-y-4">
          {/* Timer Progress Bar */}
          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                timeLeft > 5 ? 'bg-indigo-500' : 'bg-rose-500 animate-pulse'
              }`}
              style={{ width: `${(timeLeft / timePerQuestion) * 100}%` }}
            />
          </div>

          <div className="text-center font-bold text-xs text-slate-500">
            Còn lại: <span className="text-rose-600 font-black text-sm">{timeLeft}s</span>
          </div>

          {/* Prompt English Word */}
          <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-3xl p-5 text-center shadow-lg relative">
            <button
              onClick={() => speakEnglish(currentWord.word)}
              className="absolute right-4 top-4 bg-white/20 hover:bg-white/30 text-white text-xs px-2.5 py-1 rounded-xl cursor-pointer"
            >
              🔊 Nghe lại
            </button>
            <div className="text-4xl sm:text-5xl font-black mb-1 tracking-wide">
              {currentWord.word}
            </div>
            <div className="text-indigo-200 text-xs font-semibold">
              {currentWord.phonetic}
            </div>
            <div className="mt-2 text-xs text-amber-200 font-medium">
              👉 Chọn nghĩa tiếng Việt đúng thật nhanh để tăng tốc!
            </div>
          </div>

          {/* Options Grid */}
          <div className={`grid gap-2.5 ${options.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-2'}`}>
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.isCorrect)}
                disabled={feedback !== null}
                className={`p-3.5 rounded-2xl border-2 font-black text-sm transition-all cursor-pointer flex items-center gap-3 ${
                  feedback !== null
                    ? opt.isCorrect
                      ? 'border-emerald-500 bg-emerald-100 text-emerald-900 shadow-md ring-2 ring-emerald-400'
                      : 'border-slate-200 bg-slate-100 text-slate-400 opacity-60'
                    : 'border-indigo-200 bg-white hover:border-indigo-500 hover:bg-indigo-50/50 hover:scale-102 active:scale-95 text-slate-800 shadow-xs'
                }`}
              >
                <span className="text-3xl shrink-0">{opt.emoji}</span>
                <span className="text-left leading-tight text-xs sm:text-sm">{opt.text}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Game Over / Victory Screen */
        <div className="text-center py-6 space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-4xl shadow-xl animate-bounce">
            🏆
          </div>
          <h3 className="text-xl font-black text-slate-800">
            Chiến Thắng Xuất Sắc!
          </h3>
          <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto">
            Bé đã hoàn thành xuất sắc thử thách Đua Thuyền Tốc Độ cấp độ {difficultyLevel}!
          </p>

          <div className="flex justify-center gap-4 bg-amber-50 p-4 rounded-2xl border border-amber-200 max-w-xs mx-auto">
            <div>
              <div className="text-xs text-amber-800 font-bold">Tổng Điểm</div>
              <div className="text-2xl font-black text-amber-900">{score}</div>
            </div>
            <div className="w-px bg-amber-300" />
            <div>
              <div className="text-xs text-amber-800 font-bold">Phần Thưởng</div>
              <div className="text-2xl font-black text-amber-900">⭐ +{coinsEarned}</div>
            </div>
          </div>

          <div className="flex gap-2 justify-center pt-2">
            <button
              onClick={() => {
                sound.playClick();
                setRound(0);
                setScore(0);
                setIsGameOver(false);
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-xl cursor-pointer"
            >
              Chơi Lại 🔄
            </button>
            <button
              onClick={() => {
                sound.playCoin();
                onFinish(score, coinsEarned);
              }}
              className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-xs rounded-xl shadow-md cursor-pointer hover:from-indigo-600 hover:to-purple-700"
            >
              Nhận Thưởng & Thoát 🎁
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
