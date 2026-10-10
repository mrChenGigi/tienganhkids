import React, { useState, useEffect } from 'react';
import { WordItem } from '../../types';
import { sound, speakEnglish } from '../../utils/audio';
import { triggerFireworks, triggerCenterExplosion } from '../../utils/celebration';
import confetti from 'canvas-confetti';
import { Volume2, RotateCcw, Check, Trophy } from 'lucide-react';

interface SpellingPuzzleGameProps {
  words: WordItem[];
  onFinish: (score: number, coins: number) => void;
  onExit: () => void;
}

export const SpellingPuzzleGame: React.FC<SpellingPuzzleGameProps> = ({ words, onFinish, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [availableTiles, setAvailableTiles] = useState<{ id: string; letter: string; used: boolean }[]>([]);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentWord = words[currentIndex % words.length];

  const setupWord = (w: WordItem) => {
    setSelectedLetters([]);
    const letters = w.word.toUpperCase().split('');
    const tiles = letters.map((char, idx) => ({
      id: `${char}_${idx}_${Date.now()}`,
      letter: char,
      used: false
    }));
    // Shuffle tiles
    setAvailableTiles(tiles.sort(() => 0.5 - Math.random()));
    speakEnglish(w.word);
  };

  useEffect(() => {
    if (currentWord) {
      setupWord(currentWord);
    }
  }, [currentIndex]);

  const handleTileClick = (tileId: string) => {
    const tile = availableTiles.find((t) => t.id === tileId);
    if (!tile || tile.used) return;

    sound.playClick();
    const nextLetters = [...selectedLetters, tile.letter];
    setSelectedLetters(nextLetters);

    setAvailableTiles((prev) =>
      prev.map((t) => (t.id === tileId ? { ...t, used: true } : t))
    );

    // Check if word is complete
    const targetWordStr = currentWord.word.toUpperCase();
    if (nextLetters.length === targetWordStr.length) {
      const spelledWord = nextLetters.join('');
      if (spelledWord === targetWordStr) {
        // Correct!
        sound.playSuccess();
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 }
        });
        setScore((s) => s + 25);
        speakEnglish(currentWord.word);

        setTimeout(() => {
          if (currentIndex + 1 >= Math.min(5, words.length)) {
            setIsFinished(true);
            sound.playLevelUp();
            triggerFireworks();
            triggerCenterExplosion();
          } else {
            setCurrentIndex((idx) => idx + 1);
          }
        }, 1200);
      } else {
        // Wrong spelling
        sound.playWrong();
        setTimeout(() => {
          // Reset tiles for this word
          setupWord(currentWord);
        }, 600);
      }
    }
  };

  const handleResetCurrentWord = () => {
    sound.playClick();
    setupWord(currentWord);
  };

  const handleComplete = () => {
    const earnedCoins = Math.round(score * 0.8) + 15;
    onFinish(score, earnedCoins);
  };

  return (
    <div className="relative w-full min-h-[500px] bg-gradient-to-b from-emerald-100 via-teal-50 to-amber-50 rounded-3xl border-4 border-emerald-300 p-4 shadow-xl flex flex-col justify-between select-none">
      
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white/90 px-4 py-2 rounded-2xl border border-emerald-200 shadow-xs mb-3">
        <div className="flex items-center gap-1.5 font-black text-emerald-900 text-sm">
          <span>✏️ Xếp Chữ Thần Tốc</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">
            Từ {currentIndex + 1}/{Math.min(5, words.length)}
          </span>
          <span className="text-xs font-black text-amber-700 bg-amber-100 px-2.5 py-1 rounded-xl">
            ⭐ {score} điểm
          </span>
        </div>
      </div>

      {/* Main puzzle board */}
      <div className="my-auto text-center max-w-md mx-auto w-full">
        {/* Big emoji & meaning */}
        <div className="text-6xl mb-2 animate-bounce">{currentWord.emoji}</div>
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-base font-bold text-slate-700">
            Nghĩa: <span className="text-emerald-700 font-extrabold">{currentWord.meaning}</span>
          </span>
          <button
            onClick={() => {
              sound.playClick();
              speakEnglish(currentWord.word);
            }}
            title="Nghe lại phát âm"
            className="p-1 rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Word slots */}
        <div className="flex items-center justify-center gap-2 my-5">
          {currentWord.word.split('').map((_, idx) => {
            const letter = selectedLetters[idx];
            return (
              <div
                key={idx}
                className={`w-12 h-14 rounded-2xl border-3 flex items-center justify-center text-2xl font-black transition-all shadow-sm ${
                  letter
                    ? 'bg-amber-400 border-amber-500 text-white shadow-md'
                    : 'bg-white border-dashed border-slate-300 text-transparent'
                }`}
              >
                {letter || '_'}
              </div>
            );
          })}
        </div>

        {/* Letter tiles to choose */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          {availableTiles.map((tile) => (
            <button
              key={tile.id}
              onClick={() => handleTileClick(tile.id)}
              disabled={tile.used}
              className={`w-12 h-12 rounded-2xl font-black text-xl transition-all shadow-md transform active:scale-95 cursor-pointer ${
                tile.used
                  ? 'bg-slate-200 text-slate-400 opacity-40 cursor-not-allowed scale-90'
                  : 'bg-gradient-to-b from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white hover:scale-105'
              }`}
            >
              {tile.letter}
            </button>
          ))}
        </div>

        <button
          onClick={handleResetCurrentWord}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-800 font-bold bg-white/70 px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Xếp Lại Từ Này</span>
        </button>
      </div>

      {/* Victory Overlay */}
      {isFinished && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-30 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-4 border-amber-400 p-6 text-center max-w-sm w-full shadow-2xl animate-bounce">
            <div className="text-5xl mb-2">🏆</div>
            <h3 className="text-2xl font-black text-slate-800">Bậc Thầy Đánh Vần!</h3>
            <p className="text-sm text-slate-600 font-semibold mt-1">
              Bé đã xếp chuẩn toàn bộ các từ vựng xuất sắc!
            </p>
            <div className="my-4 bg-amber-50 border border-amber-200 rounded-2xl py-2 px-4 flex items-center justify-around font-bold text-amber-800">
              <div>🪙 +{Math.round(score * 0.8) + 15} Sao Vàng</div>
              <div>✨ +35 XP</div>
            </div>
            <button
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold py-3 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Nhận Thưởng Ngay 🌟
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end mt-2">
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
