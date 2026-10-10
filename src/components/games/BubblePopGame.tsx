import React, { useState, useEffect } from 'react';
import { WordItem } from '../../types';
import { sound, speakEnglish } from '../../utils/audio';
import { triggerFireworks, triggerCenterExplosion } from '../../utils/celebration';
import confetti from 'canvas-confetti';
import { Volume2, Sparkles, RefreshCw, Trophy, Heart } from 'lucide-react';

interface BubblePopGameProps {
  words: WordItem[];
  onFinish: (score: number, coins: number) => void;
  onExit: () => void;
}

interface Bubble {
  id: string;
  word: WordItem;
  x: number; // percentage 10 - 80
  y: number; // percentage 15 - 75
  color: string;
  popped: boolean;
}

const BUBBLE_COLORS = [
  'from-pink-400 to-rose-400 border-rose-300',
  'from-sky-400 to-blue-400 border-blue-300',
  'from-amber-400 to-yellow-400 border-amber-300',
  'from-emerald-400 to-teal-400 border-teal-300',
  'from-purple-400 to-indigo-400 border-purple-300',
  'from-orange-400 to-amber-500 border-orange-300'
];

export const BubblePopGame: React.FC<BubblePopGameProps> = ({ words, onFinish, onExit }) => {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [targetWord, setTargetWord] = useState<WordItem | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const totalRounds = Math.min(5, words.length);

  // Setup round
  const setupRound = (rIdx: number) => {
    if (rIdx >= totalRounds) {
      handleGameWin();
      return;
    }

    const currentTarget = words[rIdx % words.length];
    setTargetWord(currentTarget);

    // Pick 3 random distractor words
    const others = words.filter((w) => w.id !== currentTarget.id);
    const shuffledOthers = [...others].sort(() => 0.5 - Math.random()).slice(0, 3);
    const roundWords = [currentTarget, ...shuffledOthers].sort(() => 0.5 - Math.random());

    // Generate bubbles positions
    const positions = [
      { x: 15, y: 25 },
      { x: 60, y: 20 },
      { x: 25, y: 65 },
      { x: 70, y: 60 }
    ];

    const newBubbles: Bubble[] = roundWords.map((w, idx) => ({
      id: `${w.id}_${idx}_${Date.now()}`,
      word: w,
      x: positions[idx % positions.length].x + Math.floor(Math.random() * 8 - 4),
      y: positions[idx % positions.length].y + Math.floor(Math.random() * 8 - 4),
      color: BUBBLE_COLORS[idx % BUBBLE_COLORS.length],
      popped: false
    }));

    setBubbles(newBubbles);

    // Read the word out loud
    setTimeout(() => {
      speakEnglish(currentTarget.word);
    }, 300);
  };

  useEffect(() => {
    setupRound(round);
  }, [round]);

  const handleBubbleClick = (b: Bubble) => {
    if (b.popped || isGameOver || !targetWord) return;

    sound.playPop();

    if (b.word.id === targetWord.id) {
      // Correct!
      sound.playSuccess();
      setBubbles((prev) =>
        prev.map((item) => (item.id === b.id ? { ...item, popped: true } : item))
      );
      setScore((s) => s + 20);

      confetti({
        particleCount: 25,
        spread: 50,
        origin: { x: b.x / 100, y: b.y / 100 }
      });

      // Next round
      setTimeout(() => {
        setRound((r) => r + 1);
      }, 700);
    } else {
      // Wrong bubble
      sound.playWrong();
      setLives((l) => {
        const nextLives = l - 1;
        if (nextLives <= 0) {
          setIsGameOver(true);
        }
        return nextLives;
      });
    }
  };

  const handleGameWin = () => {
    setIsGameOver(true);
    sound.playLevelUp();
    triggerFireworks();
    triggerCenterExplosion();
  };

  const handleComplete = () => {
    const earnedCoins = Math.round(score * 0.8) + 15;
    onFinish(score, earnedCoins);
  };

  return (
    <div className="relative w-full h-[520px] bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-100 rounded-3xl border-4 border-amber-300 overflow-hidden shadow-xl p-4 flex flex-col justify-between select-none">
      
      {/* Top Game Bar */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-xs px-4 py-2 rounded-2xl border border-sky-300 shadow-xs z-20">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-extrabold text-sky-800">🎈 Bóng Bay Từ Vựng</span>
          <span className="text-xs bg-sky-200 text-sky-900 font-bold px-2 py-0.5 rounded-full">
            Vòng {Math.min(round + 1, totalRounds)}/{totalRounds}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-rose-500 font-bold text-sm">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 ${i < lives ? 'fill-rose-500' : 'text-slate-300'}`}
              />
            ))}
          </div>
          <div className="text-sm font-black text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-xl border border-amber-300">
            ⭐ {score} điểm
          </div>
        </div>
      </div>

      {/* Target Word Instruction Prompt */}
      {targetWord && !isGameOver && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-white/95 border-2 border-amber-400 rounded-2xl px-5 py-2.5 text-center shadow-lg">
          <div className="text-xs font-bold text-slate-500 mb-0.5">Bé hãy bấm vỡ quả bóng chứa từ:</div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl font-black text-amber-600 uppercase tracking-wide">
              {targetWord.word}
            </span>
            <button
              onClick={() => {
                sound.playClick();
                speakEnglish(targetWord.word);
              }}
              title="Nghe lại phát âm"
              className="p-1 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800 transition-colors"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
          <div className="text-[11px] font-semibold text-emerald-600">
            Nghĩa: {targetWord.meaning}
          </div>
        </div>
      )}

      {/* Floating Bubbles Arena */}
      <div className="relative flex-1 w-full h-full my-2">
        {!isGameOver &&
          bubbles.map((b) => (
            <div
              key={b.id}
              onClick={() => handleBubbleClick(b)}
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`
              }}
              className={`absolute transition-transform duration-300 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 active:scale-90 ${
                b.popped ? 'scale-0 opacity-0 pointer-events-none' : 'hover:scale-110'
              }`}
            >
              <div
                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr ${b.color} border-4 flex flex-col items-center justify-center text-white shadow-lg animate-float backdrop-blur-xs relative overflow-hidden`}
              >
                {/* Bubble highlight shine */}
                <div className="absolute top-2 left-3 w-5 h-2.5 bg-white/60 rounded-full rotate-[-30deg]" />

                <span className="text-2xl sm:text-3xl filter drop-shadow">{b.word.emoji}</span>
                <span className="text-xs sm:text-sm font-black drop-shadow mt-1 tracking-tight text-center px-1">
                  {b.word.word}
                </span>
              </div>
            </div>
          ))}
      </div>

      {/* Game Over / Victory Modal Overlay */}
      {isGameOver && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-30 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-4 border-amber-400 p-6 text-center max-w-sm w-full shadow-2xl animate-bounce">
            <div className="text-5xl mb-2">{lives > 0 ? '🏆' : '💪'}</div>
            <h3 className="text-2xl font-black text-slate-800">
              {lives > 0 ? 'Hoàn Thành Xuất Sắc!' : 'Cố Lên Bé Ơi!'}
            </h3>
            <p className="text-sm text-slate-600 font-semibold mt-1">
              Bé đạt được <span className="font-bold text-amber-600">{score} điểm</span>!
            </p>
            <div className="my-4 bg-amber-50 border border-amber-200 rounded-2xl py-2 px-4 flex items-center justify-around font-bold text-amber-800">
              <div>🪙 +{Math.round(score * 0.8) + 15} Sao Vàng</div>
              <div>✨ +30 XP</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setRound(0);
                  setScore(0);
                  setLives(3);
                  setIsGameOver(false);
                }}
                className="flex-1 flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-2xl transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Chơi Lại</span>
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold py-2.5 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Nhận Quà 🎁
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom control */}
      <div className="flex justify-end z-20">
        <button
          onClick={onExit}
          className="bg-white/80 hover:bg-white text-slate-700 font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-300 shadow-xs cursor-pointer"
        >
          Trở Về
        </button>
      </div>
    </div>
  );
};
