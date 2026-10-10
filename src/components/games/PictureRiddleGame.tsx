import React, { useState, useEffect } from 'react';
import { WordItem } from '../../types';
import { sound, speakEnglish } from '../../utils/audio';
import { triggerFireworks } from '../../utils/celebration';
import confetti from 'canvas-confetti';
import { Trophy, RefreshCw, Eye, Sparkles } from 'lucide-react';

interface PictureRiddleGameProps {
  words: WordItem[];
  difficultyLevel: number; // 1: 3 câu, 2: 5 câu, 3: 7 câu kèm gợi ý ẩn
  onFinish: (score: number, coins: number) => void;
  onExit: () => void;
}

export const PictureRiddleGame: React.FC<PictureRiddleGameProps> = ({
  words,
  difficultyLevel = 1,
  onFinish,
  onExit
}) => {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const totalRounds = difficultyLevel === 1 ? 4 : difficultyLevel === 2 ? 6 : 8;
  const currentWord = words[round % words.length] || words[0];

  // Distractors
  const [choices, setChoices] = useState<WordItem[]>([]);

  useEffect(() => {
    if (round >= totalRounds) {
      setIsGameOver(true);
      triggerFireworks();
      sound.playTada();
      return;
    }

    const current = words[round % words.length] || words[0];
    setIsRevealed(false);
    setSelectedWord(null);

    const others = words.filter((w) => w.id !== current.id);
    const shuffledOthers = [...others].sort(() => 0.5 - Math.random()).slice(0, 3);
    const shuffledChoices = [current, ...shuffledOthers].sort(() => 0.5 - Math.random());
    setChoices(shuffledChoices);
  }, [round]);

  const handleChoice = (w: WordItem) => {
    if (selectedWord !== null) return;
    setSelectedWord(w.id);

    if (w.id === currentWord.id) {
      sound.playSuccess();
      speakEnglish(currentWord.word);
      setScore((s) => s + 25);
      confetti({ particleCount: 35, spread: 60 });
    } else {
      sound.playWrong();
    }

    setTimeout(() => {
      setRound((r) => r + 1);
    }, 1200);
  };

  const coinsEarned = Math.round(score / 2) + 15;

  return (
    <div className="bg-slate-50 rounded-3xl p-4 sm:p-6 border-2 border-amber-200">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐾</span>
          <div>
            <h3 className="font-black text-sm text-slate-800">
              Đố Vui Hình Ảnh & Nghĩa (Cấp Độ {difficultyLevel})
            </h3>
            <p className="text-[11px] text-slate-500 font-semibold">
              Vòng {Math.min(round + 1, totalRounds)} / {totalRounds} • Nhìn gợi ý đoán từ vựng
            </p>
          </div>
        </div>

        <span className="bg-amber-100 text-amber-800 font-black text-xs px-2.5 py-1 rounded-xl">
          ⭐ {score} điểm
        </span>
      </div>

      {!isGameOver ? (
        <div className="space-y-4">
          {/* Riddle Card */}
          <div className="bg-white rounded-3xl border-3 border-amber-300 p-6 text-center shadow-md relative overflow-hidden">
            <div className="text-7xl mb-3 animate-bounce">
              {currentWord.emoji}
            </div>

            <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 max-w-md mx-auto">
              <p className="text-sm font-black text-amber-950 mb-1">
                "Mình là gì trong tiếng Anh nhỉ?"
              </p>
              <p className="text-xs text-amber-800 font-medium">
                Gợi ý nghĩa: <span className="font-bold underline">{currentWord.meaning}</span>
              </p>
              {currentWord.example && (
                <p className="text-[11px] text-slate-500 italic mt-1">
                  Ví dụ: "{currentWord.example}"
                </p>
              )}
            </div>
          </div>

          {/* Choices Grid */}
          <div className="grid grid-cols-2 gap-3">
            {choices.map((c) => {
              const isSelected = selectedWord === c.id;
              const isCorrect = c.id === currentWord.id;

              return (
                <button
                  key={c.id}
                  onClick={() => handleChoice(c)}
                  disabled={selectedWord !== null}
                  className={`p-4 rounded-2xl border-2 font-black transition-all cursor-pointer flex flex-col items-center justify-center ${
                    selectedWord !== null
                      ? isCorrect
                        ? 'border-emerald-500 bg-emerald-100 text-emerald-950 ring-2 ring-emerald-300 scale-102'
                        : isSelected
                        ? 'border-rose-500 bg-rose-100 text-rose-950'
                        : 'border-slate-200 bg-slate-50 opacity-50'
                      : 'border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50 hover:scale-102 text-slate-800 shadow-xs'
                  }`}
                >
                  <span className="text-lg font-black">{c.word}</span>
                  <span className="text-xs font-semibold text-slate-500">{c.phonetic}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Win screen */
        <div className="text-center py-6 space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-4xl shadow-xl animate-bounce">
            🎉
          </div>
          <h3 className="text-xl font-black text-slate-800">
            Thám Tử Nhí Toàn Năng!
          </h3>
          <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto">
            Bé đã giải đố thành công tất cả các bức tranh từ vựng!
          </p>

          <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 max-w-xs mx-auto">
            <span className="text-xs text-amber-800 font-bold">Thưởng: </span>
            <span className="text-lg font-black text-amber-900">⭐ +{coinsEarned} Sao Vàng & 💎 +1 Kim Cương</span>
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
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs rounded-xl shadow-md cursor-pointer hover:from-amber-600 hover:to-orange-600"
            >
              Nhận Thưởng & Về Hub 🎁
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
