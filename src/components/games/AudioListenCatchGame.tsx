import React, { useState, useEffect } from 'react';
import { WordItem } from '../../types';
import { sound, speakEnglish } from '../../utils/audio';
import { triggerFireworks } from '../../utils/celebration';
import confetti from 'canvas-confetti';
import { Volume2, Trophy, Ear, Sparkles } from 'lucide-react';

interface AudioListenCatchGameProps {
  words: WordItem[];
  difficultyLevel: number; // 1: 3 câu, 2: 5 câu, 3: 7 câu tốc độ nhanh
  onFinish: (score: number, coins: number) => void;
  onExit: () => void;
}

export const AudioListenCatchGame: React.FC<AudioListenCatchGameProps> = ({
  words,
  difficultyLevel = 1,
  onFinish,
  onExit
}) => {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const totalRounds = difficultyLevel === 1 ? 4 : difficultyLevel === 2 ? 6 : 8;
  const currentWord = words[round % words.length] || words[0];

  const [cards, setCards] = useState<WordItem[]>([]);

  useEffect(() => {
    if (round >= totalRounds) {
      setIsGameOver(true);
      triggerFireworks();
      sound.playTada();
      return;
    }

    const current = words[round % words.length] || words[0];
    setSelectedId(null);

    // Speak the target word aloud
    speakEnglish(current.word);

    const others = words.filter((w) => w.id !== current.id);
    const shuffledOthers = [...others].sort(() => 0.5 - Math.random()).slice(0, 3);
    const roundCards = [current, ...shuffledOthers].sort(() => 0.5 - Math.random());
    setCards(roundCards);
  }, [round]);

  const handleCardClick = (w: WordItem) => {
    if (selectedId !== null) return;
    setSelectedId(w.id);

    if (w.id === currentWord.id) {
      sound.playSuccess();
      setScore((s) => s + 30);
      confetti({ particleCount: 40, spread: 60 });
    } else {
      sound.playWrong();
    }

    setTimeout(() => {
      setRound((r) => r + 1);
    }, 1200);
  };

  const coinsEarned = Math.round(score / 2) + 20;

  return (
    <div className="bg-slate-50 rounded-3xl p-4 sm:p-6 border-2 border-teal-200">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎧</span>
          <div>
            <h3 className="font-black text-sm text-slate-800">
              Lắng Nghe & Bắt Hình (Cấp Độ {difficultyLevel})
            </h3>
            <p className="text-[11px] text-slate-500 font-semibold">
              Vòng {Math.min(round + 1, totalRounds)} / {totalRounds} • Nghe giọng đọc chọn hình tương ứng
            </p>
          </div>
        </div>

        <span className="bg-teal-100 text-teal-800 font-black text-xs px-2.5 py-1 rounded-xl">
          ⭐ {score} điểm
        </span>
      </div>

      {!isGameOver ? (
        <div className="space-y-4">
          {/* Audio Speaker Box */}
          <div className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-3xl p-6 text-center text-white shadow-lg flex flex-col items-center">
            <button
              onClick={() => speakEnglish(currentWord.word)}
              className="w-20 h-20 rounded-full bg-white text-teal-600 flex items-center justify-center text-3xl shadow-xl hover:scale-110 active:scale-95 transition-transform cursor-pointer animate-pulse"
              title="Bấm để nghe lại phát âm"
            >
              <Volume2 className="w-10 h-10" />
            </button>
            <div className="mt-3 font-black text-base">
              Bấm vào chiếc loa để nghe phát âm!
            </div>
            <div className="text-xs text-teal-100 mt-0.5">
              Sau đó chọn đúng hình ảnh và nghĩa của từ ở phía dưới nhé!
            </div>
          </div>

          {/* Picture Choices */}
          <div className="grid grid-cols-2 gap-3">
            {cards.map((c) => {
              const isSelected = selectedId === c.id;
              const isCorrect = c.id === currentWord.id;

              return (
                <button
                  key={c.id}
                  onClick={() => handleCardClick(c)}
                  disabled={selectedId !== null}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center ${
                    selectedId !== null
                      ? isCorrect
                        ? 'border-emerald-500 bg-emerald-100 text-emerald-950 ring-2 ring-emerald-300 scale-102'
                        : isSelected
                        ? 'border-rose-500 bg-rose-100 text-rose-950'
                        : 'border-slate-200 bg-slate-50 opacity-50'
                      : 'border-slate-200 bg-white hover:border-teal-400 hover:bg-teal-50 hover:scale-102 text-slate-800 shadow-xs'
                  }`}
                >
                  <span className="text-4xl mb-1">{c.emoji}</span>
                  <span className="text-xs font-black text-slate-800">{c.meaning}</span>
                  {selectedId !== null && isCorrect && (
                    <span className="text-[11px] text-emerald-700 font-extrabold mt-1">
                      {c.word}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Victory Screen */
        <div className="text-center py-6 space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-teal-400 to-emerald-500 flex items-center justify-center text-4xl shadow-xl animate-bounce">
            🎧
          </div>
          <h3 className="text-xl font-black text-slate-800">
            Đôi Tai Vàng Xuất Sắc!
          </h3>
          <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto">
            Bé có khả năng lắng nghe và nhận diện từ vựng cực kỳ siêu phàm!
          </p>

          <div className="bg-teal-50 p-3 rounded-2xl border border-teal-200 max-w-xs mx-auto">
            <span className="text-xs text-teal-800 font-bold">Thưởng: </span>
            <span className="text-lg font-black text-teal-900">⭐ +{coinsEarned} Sao Vàng</span>
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
              className="px-5 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-black text-xs rounded-xl shadow-md cursor-pointer hover:from-teal-600 hover:to-emerald-700"
            >
              Nhận Thưởng & Thoát 🎁
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
