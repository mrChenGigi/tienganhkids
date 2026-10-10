import React, { useState, useEffect } from 'react';
import { WordItem } from '../../types';
import { sound, speakEnglish } from '../../utils/audio';
import { triggerFireworks, triggerCenterExplosion } from '../../utils/celebration';
import confetti from 'canvas-confetti';
import { RefreshCw, Trophy } from 'lucide-react';

interface MemoryFlipGameProps {
  words: WordItem[];
  onFinish: (score: number, coins: number) => void;
  onExit: () => void;
}

interface CardItem {
  uid: string;
  wordId: string;
  type: 'word' | 'image';
  label: string;
  emoji?: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryFlipGame: React.FC<MemoryFlipGameProps> = ({ words, onFinish, onExit }) => {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedUids, setFlippedUids] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  // Take 4 words for an 8-card grid (friendly for kids)
  const selectedWords = words.slice(0, 4);

  const initGame = () => {
    const deck: CardItem[] = [];
    selectedWords.forEach((w) => {
      // Card 1: Text
      deck.push({
        uid: `${w.id}_word_${Math.random()}`,
        wordId: w.id,
        type: 'word',
        label: w.word,
        isFlipped: false,
        isMatched: false
      });
      // Card 2: Emoji + Vietnamese
      deck.push({
        uid: `${w.id}_img_${Math.random()}`,
        wordId: w.id,
        type: 'image',
        label: w.meaning,
        emoji: w.emoji,
        isFlipped: false,
        isMatched: false
      });
    });

    setCards(deck.sort(() => 0.5 - Math.random()));
    setFlippedUids([]);
    setMoves(0);
    setIsWon(false);
  };

  useEffect(() => {
    initGame();
  }, [words]);

  const handleCardClick = (card: CardItem) => {
    if (card.isFlipped || card.isMatched || flippedUids.length >= 2) return;

    sound.playClick();

    // Flip this card
    const nextFlipped = [...flippedUids, card.uid];
    setFlippedUids(nextFlipped);

    setCards((prev) =>
      prev.map((c) => (c.uid === card.uid ? { ...c, isFlipped: true } : c))
    );

    if (card.type === 'word') {
      speakEnglish(card.label);
    }

    // Check match if 2 cards flipped
    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      const card1 = cards.find((c) => c.uid === nextFlipped[0]);
      const card2 = card;

      if (card1 && card2 && card1.wordId === card2.wordId) {
        // Matched!
        sound.playSuccess();
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.wordId === card1.wordId ? { ...c, isMatched: true } : c
            )
          );
          setFlippedUids([]);

          // Check if all matched
          const remaining = cards.filter(
            (c) => !c.isMatched && c.wordId !== card1.wordId
          );
          if (remaining.length === 0) {
            handleVictory();
          }
        }, 500);
      } else {
        // Not a match
        sound.playWrong();
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              nextFlipped.includes(c.uid) ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedUids([]);
        }, 1000);
      }
    }
  };

  const handleVictory = () => {
    setIsWon(true);
    sound.playLevelUp();
    triggerFireworks();
    triggerCenterExplosion();
  };

  const handleClaim = () => {
    const earnedCoins = Math.max(10, 40 - moves * 2);
    const score = Math.max(50, 100 - moves * 5);
    onFinish(score, earnedCoins);
  };

  return (
    <div className="relative w-full min-h-[500px] bg-gradient-to-b from-purple-100 via-pink-50 to-amber-50 rounded-3xl border-4 border-purple-300 p-4 shadow-xl flex flex-col justify-between select-none">
      
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white/90 px-4 py-2 rounded-2xl border border-purple-200 shadow-xs mb-3">
        <div className="flex items-center gap-1.5 font-black text-purple-900 text-sm">
          <span>🃏 Lật Thẻ Trí Nhớ</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-purple-100 text-purple-800 font-bold px-3 py-1 rounded-full">
            Lượt lật: {moves}
          </span>
          <button
            onClick={initGame}
            title="Chơi lại"
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-slate-600 mb-2">
        Bé hãy tìm các cặp thẻ tương ứng giữa <span className="font-bold text-purple-700">Từ tiếng Anh</span> và <span className="font-bold text-pink-700">Hình ảnh / Nghĩa tiếng Việt</span>!
      </div>

      {/* Cards 4x2 Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-auto max-w-lg mx-auto w-full">
        {cards.map((card) => (
          <div
            key={card.uid}
            onClick={() => handleCardClick(card)}
            className={`h-28 sm:h-32 rounded-2xl flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-all duration-300 border-3 shadow-md transform active:scale-95 ${
              card.isMatched
                ? 'bg-emerald-100 border-emerald-400 opacity-90 scale-95'
                : card.isFlipped
                ? 'bg-white border-amber-400 rotate-0 scale-100'
                : 'bg-gradient-to-br from-purple-500 to-indigo-600 border-purple-300 hover:scale-102 hover:shadow-lg'
            }`}
          >
            {card.isFlipped || card.isMatched ? (
              <div className="flex flex-col items-center justify-center gap-1">
                {card.emoji && <span className="text-3xl">{card.emoji}</span>}
                <span className={`font-black ${card.emoji ? 'text-xs text-slate-700' : 'text-base sm:text-lg text-purple-700 uppercase'}`}>
                  {card.label}
                </span>
                {card.isMatched && <span className="text-[10px] text-emerald-600 font-bold">✓ Đúng rồi</span>}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-white">
                <span className="text-3xl animate-pulse">⭐</span>
                <span className="text-[10px] font-bold mt-1 text-purple-200">behocvui</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Victory Overlay */}
      {isWon && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-30 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-4 border-amber-400 p-6 text-center max-w-sm w-full shadow-2xl animate-bounce">
            <div className="text-5xl mb-2">🎉</div>
            <h3 className="text-2xl font-black text-slate-800">Trí Nhớ Siêu Đỉnh!</h3>
            <p className="text-sm text-slate-600 font-semibold mt-1">
              Bé đã ghép đúng tất cả các thẻ trong <span className="text-purple-600 font-bold">{moves} lượt</span>!
            </p>
            <div className="my-4 bg-amber-50 border border-amber-200 rounded-2xl py-2 px-4 flex items-center justify-around font-bold text-amber-800">
              <div>🪙 +{Math.max(15, 40 - moves * 2)} Sao Vàng</div>
              <div>✨ +35 XP</div>
            </div>
            <button
              onClick={handleClaim}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-extrabold py-3 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
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
