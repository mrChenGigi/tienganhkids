import React, { useState, useRef, useEffect } from 'react';
import { Mascot, EquippedItems } from '../types';
import { MASCOTS } from '../data/curriculum';
import { SHOP_ITEMS } from '../data/shopItems';
import { sound } from '../utils/audio';

interface MascotDisplayProps {
  mascotId: string;
  equipped: EquippedItems;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSpeechBubble?: boolean;
  speechText?: string;
  onClick?: () => void;
}

interface LaughParticle {
  id: number;
  emoji: string;
  x: number;
}

const LAUGH_QUOTES = [
  'Hihihi! Nhột quá à bé ơi! 😆💖',
  'Hahaha! Vui quá đi! Cùng học nhé! 🎉',
  'Hehehe! Bé cù mình cười hoài à! ✨😄',
  'Hihi! Bé giỏi và đáng yêu quá! 🌟🎈',
  'Meo meo! Bé cù Gigi nhột quá đi thôi! 🐱✨',
  'Hì hì! Gấu trúc Chen đang ăn lá trúc cũng phải phì cười! 🐼🎉',
  'Hahaha! Bạn làm mình cười toe toét nè! 🥰'
];

export const MascotDisplay: React.FC<MascotDisplayProps> = ({
  mascotId,
  equipped,
  size = 'md',
  showSpeechBubble = true,
  speechText = "Hello friend! Let's learn English together! 🎉",
  onClick
}) => {
  const mascot: Mascot = MASCOTS.find((m) => m.id === mascotId) || MASCOTS[0];

  const equippedHat = SHOP_ITEMS.find((item) => item.id === equipped.hat);
  const equippedOutfit = SHOP_ITEMS.find((item) => item.id === equipped.outfit);
  const equippedWand = SHOP_ITEMS.find((item) => item.id === equipped.wand);
  const equippedCompanion = SHOP_ITEMS.find((item) => item.id === equipped.companion);

  const [isLaughing, setIsLaughing] = useState<boolean>(false);
  const [currentLaughText, setCurrentLaughText] = useState<string | null>(null);
  const [particles, setParticles] = useState<LaughParticle[]>([]);
  const laughTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (laughTimeoutRef.current) {
        clearTimeout(laughTimeoutRef.current);
      }
    };
  }, []);

  const sizeClasses = {
    sm: 'w-16 h-16 text-3xl',
    md: 'w-24 h-24 text-5xl',
    lg: 'w-36 h-36 text-7xl',
    xl: 'w-48 h-48 text-8xl'
  };

  const handleMascotClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Phát âm thanh cười vui vẻ từ thư viện âm thanh có sẵn
    sound.playLaugh();

    // Kích hoạt hiệu ứng cười vui vẻ cho linh vật
    setIsLaughing(true);
    if (laughTimeoutRef.current) clearTimeout(laughTimeoutRef.current);
    laughTimeoutRef.current = window.setTimeout(() => {
      setIsLaughing(false);
      setCurrentLaughText(null);
    }, 2200);

    // Đổi câu nói trong bóng thoại sang câu cười vui vẻ ngẫu nhiên
    const randomQuote = LAUGH_QUOTES[Math.floor(Math.random() * LAUGH_QUOTES.length)];
    setCurrentLaughText(randomQuote);

    // Tạo các hiệu ứng cảm xúc cười bay lên
    const burstEmojis = ['😆', '✨', '💖', '🎉', '😂', '🌟'];
    const newParticle: LaughParticle = {
      id: Date.now() + Math.random(),
      emoji: burstEmojis[Math.floor(Math.random() * burstEmojis.length)],
      x: (Math.random() - 0.5) * 50
    };
    setParticles((prev) => [...prev.slice(-3), newParticle]);

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
    }, 1200);

    if (onClick) onClick();
  };

  const displayText = currentLaughText || speechText;

  return (
    <div className="relative inline-flex flex-col items-center select-none">
      {/* Speech bubble */}
      {showSpeechBubble && displayText && (
        <div
          className={`mb-2 relative bg-white/95 backdrop-blur-xs text-amber-900 border-2 rounded-2xl px-4 py-2 text-xs md:text-sm font-semibold shadow-md max-w-[220px] text-center transition-all duration-300 ${
            isLaughing
              ? 'border-pink-400 bg-pink-50/95 scale-105 animate-bounce'
              : 'border-amber-300 animate-bounce duration-1000'
          }`}
        >
          <span>{displayText}</span>
          <div
            className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 ${
              isLaughing ? 'border-t-pink-400' : 'border-t-amber-300'
            }`}
          />
        </div>
      )}

      {/* Floating laugh particles */}
      <div className="absolute top-8 pointer-events-none z-30">
        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute text-2xl animate-bounce duration-700 transition-all filter drop-shadow"
            style={{
              transform: `translate(${p.x}px, -28px)`,
              opacity: 0.95
            }}
          >
            {p.emoji}
          </span>
        ))}
      </div>

      {/* Mascot Container */}
      <div
        onClick={handleMascotClick}
        onMouseEnter={() => sound.playHoverPop()}
        title="Nhấn vào để cù mình cười nhé! 😆"
        className={`relative ${
          sizeClasses[size]
        } rounded-full flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95 shadow-lg bg-gradient-to-b ${
          mascot.color
        } border-4 border-white ${isLaughing ? 'animate-giggle ring-4 ring-pink-300' : ''}`}
      >
        {/* Glow halo */}
        <div
          className={`absolute inset-0 rounded-full ${
            isLaughing ? 'bg-pink-300/40 animate-pulse' : 'bg-white/20 animate-pulse-glow'
          }`}
        />

        {/* Mascot Base Emoji */}
        <span
          className={`relative z-10 drop-shadow-md select-none transition-transform duration-200 ${
            isLaughing ? 'scale-115 rotate-6' : 'animate-float'
          }`}
        >
          {mascot.emoji}
        </span>

        {/* Equipped Hat */}
        {equippedHat && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 text-2xl md:text-3xl filter drop-shadow">
            {equippedHat.emoji}
          </div>
        )}

        {/* Equipped Outfit Badge */}
        {equippedOutfit && (
          <div className="absolute -bottom-1 right-0 z-20 text-xl md:text-2xl filter drop-shadow">
            {equippedOutfit.emoji}
          </div>
        )}

        {/* Equipped Wand */}
        {equippedWand && (
          <div className="absolute top-2 -right-3 z-20 text-xl md:text-2xl filter drop-shadow animate-wiggle">
            {equippedWand.emoji}
          </div>
        )}

        {/* Equipped Companion */}
        {equippedCompanion && (
          <div className="absolute -bottom-2 -left-3 z-20 text-2xl md:text-3xl filter drop-shadow animate-float">
            {equippedCompanion.emoji}
          </div>
        )}

        {/* Tickle hint tag */}
        <div className="absolute -bottom-1.5 bg-amber-400 text-slate-900 text-[10px] font-black px-1.5 py-0.2 rounded-full border border-white shadow-xs z-25 pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
          Cù mình nè 😆
        </div>
      </div>

      <div className="mt-1.5 text-center flex items-center gap-1 justify-center">
        <span className="text-xs md:text-sm font-bold text-slate-800 bg-white/85 px-2.5 py-0.5 rounded-full border border-amber-200 shadow-xs flex items-center gap-1">
          <span>{mascot.name}</span>
          <span className="text-xs">✨</span>
        </span>
      </div>
    </div>
  );
};
