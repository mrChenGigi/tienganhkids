import React, { useState } from 'react';
import { ChibiCharacter } from '../types';
import { CHIBI_WARDROBE_ITEMS } from '../data/chibiWardrobe';

interface Chibi3DAvatarProps {
  chibi: ChibiCharacter;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  onPoseChange?: (pose: 'happy' | 'wave' | 'dance' | 'hero') => void;
  className?: string;
}

export const Chibi3DAvatar: React.FC<Chibi3DAvatarProps> = ({
  chibi,
  size = 'md',
  interactive = true,
  className = ''
}) => {
  const [internalPose, setInternalPose] = useState<'happy' | 'wave' | 'dance' | 'hero'>(
    chibi.pose || 'happy'
  );
  const [isWiggling, setIsWiggling] = useState(false);

  // Look up equipped items
  const outfitItem = CHIBI_WARDROBE_ITEMS.find((i) => i.id === chibi.equipped.outfit);
  const hairItem = CHIBI_WARDROBE_ITEMS.find((i) => i.id === chibi.equipped.hair);
  const hatItem = CHIBI_WARDROBE_ITEMS.find((i) => i.id === chibi.equipped.hat);
  const shoesItem = CHIBI_WARDROBE_ITEMS.find((i) => i.id === chibi.equipped.shoes);
  const glassesItem = CHIBI_WARDROBE_ITEMS.find((i) => i.id === chibi.equipped.glasses);
  const earringsItem = CHIBI_WARDROBE_ITEMS.find((i) => i.id === chibi.equipped.earrings);

  const isBoy = chibi.gender === 'boy';

  // Size dimensions
  const dims = {
    sm: { w: 120, h: 150, scale: 'scale-75' },
    md: { w: 180, h: 220, scale: 'scale-95' },
    lg: { w: 230, h: 290, scale: 'scale-110' },
    xl: { w: 280, h: 360, scale: 'scale-125' },
  }[size];

  const handleAvatarClick = () => {
    if (!interactive) return;
    setIsWiggling(true);
    const poses: ('happy' | 'wave' | 'dance' | 'hero')[] = ['happy', 'wave', 'dance', 'hero'];
    const nextPose = poses[(poses.indexOf(internalPose) + 1) % poses.length];
    setInternalPose(nextPose);
    setTimeout(() => setIsWiggling(false), 800);
  };

  // Color palettes
  const skinColor = chibi.skinTone || (isBoy ? '#ffd9b3' : '#ffe4cc');
  const blushColor = isBoy ? '#fca5a5' : '#fda4af';
  const outfitColor = outfitItem?.previewColor || (isBoy ? '#3b82f6' : '#ec4899');
  const hairColor = hairItem?.previewColor || (isBoy ? '#451a03' : '#78350f');
  const shoesColor = shoesItem?.previewColor || '#0284c7';
  const hatColor = hatItem?.previewColor || '#eab308';
  const glassesColor = glassesItem?.previewColor || '#334155';
  const earringColor = earringsItem?.previewColor || '#fbbf24';

  return (
    <div
      onClick={handleAvatarClick}
      className={`relative inline-flex flex-col items-center justify-center select-none ${interactive ? 'cursor-pointer group' : ''} ${className}`}
      style={{ width: `${dims.w}px`, height: `${dims.h}px` }}
      title={interactive ? 'Bấm vào nhân vật để tạo dáng dễ thương!' : undefined}
    >
      {/* 3D Circular Platform / Shadow with Glow */}
      <div className="absolute bottom-2 w-32 h-8 rounded-full bg-slate-900/15 blur-sm transform scale-x-125 group-hover:scale-x-135 transition-transform duration-300" />
      <div className="absolute bottom-3 w-28 h-6 rounded-full bg-gradient-to-r from-amber-400/40 via-purple-400/40 to-pink-400/40 blur-[2px] animate-pulse" />

      {/* SVG 3D Chibi Character Model */}
      <svg
        viewBox="0 0 200 260"
        className={`w-full h-full filter drop-shadow-lg transition-transform duration-300 ${
          isWiggling ? 'animate-wiggle scale-105' : 'hover:scale-102'
        }`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 3D Gradients */}
          <radialGradient id={`chibi_skin_${chibi.gender}`} cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#fff1e6" />
            <stop offset="70%" stopColor={skinColor} />
            <stop offset="100%" stopColor="#e2a87a" />
          </radialGradient>

          <linearGradient id={`chibi_outfit_${chibi.gender}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="40%" stopColor={outfitColor} />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id={`chibi_hair_${chibi.gender}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
            <stop offset="50%" stopColor={hairColor} />
            <stop offset="100%" stopColor="#1c1917" />
          </linearGradient>

          <filter id="chibi-soft-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* ================= BACKGROUND HAIR (for long hair / twintails) ================= */}
        {!isBoy && (
          <g id="back-hair">
            {hairItem?.id === 'hair_twin_tails' ? (
              <>
                {/* Left ponytail */}
                <path
                  d="M 60 70 C 30 75 20 120 40 145 C 50 155 65 125 65 95 Z"
                  fill={`url(#chibi_hair_${chibi.gender})`}
                  className={internalPose === 'dance' ? 'animate-bounce' : ''}
                />
                <circle cx="62" cy="74" r="5" fill="#f43f5e" />
                {/* Right ponytail */}
                <path
                  d="M 140 70 C 170 75 180 120 160 145 C 150 155 135 125 135 95 Z"
                  fill={`url(#chibi_hair_${chibi.gender})`}
                  className={internalPose === 'dance' ? 'animate-bounce' : ''}
                />
                <circle cx="138" cy="74" r="5" fill="#f43f5e" />
              </>
            ) : (
              <path
                d="M 50 65 C 35 110 40 160 65 175 C 135 175 160 160 150 65 Z"
                fill={`url(#chibi_hair_${chibi.gender})`}
              />
            )}
          </g>
        )}

        {/* ================= BODY & OUTFIT ================= */}
        {/* Legs & Shoes */}
        <g id="legs-and-shoes">
          {/* Left leg */}
          <rect x="80" y="195" width="14" height="28" rx="6" fill={skinColor} />
          {/* Right leg */}
          <rect x="106" y="195" width="14" height="28" rx="6" fill={skinColor} />

          {/* Left shoe */}
          <g transform={internalPose === 'dance' ? 'rotate(-6 85 220)' : ''}>
            <ellipse cx="85" cy="226" rx="12" ry="7" fill={shoesColor} />
            <ellipse cx="85" cy="223" rx="8" ry="3" fill="#ffffff" opacity="0.3" />
            <rect x="80" y="218" width="10" height="6" rx="2" fill={shoesColor} />
          </g>

          {/* Right shoe */}
          <g transform={internalPose === 'dance' ? 'rotate(6 115 220)' : ''}>
            <ellipse cx="115" cy="226" rx="12" ry="7" fill={shoesColor} />
            <ellipse cx="115" cy="223" rx="8" ry="3" fill="#ffffff" opacity="0.3" />
            <rect x="110" y="218" width="10" height="6" rx="2" fill={shoesColor} />
          </g>
        </g>

        {/* Torso & Clothing */}
        <g id="torso-clothing">
          {/* Main outfit body */}
          <path
            d={
              isBoy
                ? "M 74 135 C 72 170 70 196 76 200 L 124 200 C 130 196 128 170 126 135 Z"
                : "M 76 135 C 72 160 55 195 52 205 L 148 205 C 145 195 128 160 124 135 Z"
            }
            fill={outfitColor}
          />
          {/* 3D shading overlay on outfit */}
          <path
            d={
              isBoy
                ? "M 76 136 Q 100 148 124 136 L 124 200 Q 100 205 76 200 Z"
                : "M 77 136 Q 100 148 123 136 L 145 204 Q 100 215 55 204 Z"
            }
            fill={`url(#chibi_outfit_${chibi.gender})`}
          />

          {/* Outfit details (Collar, buttons, or tie) */}
          <polygon points="100,136 94,148 106,148" fill="#ffffff" />
          <polygon points="97,148 103,148 100,165" fill="#ef4444" />
          <circle cx="100" cy="172" r="2.5" fill="#facc15" />
          <circle cx="100" cy="182" r="2.5" fill="#facc15" />
        </g>

        {/* Arms and Hands */}
        <g id="arms-hands">
          {/* Left Arm */}
          {internalPose === 'wave' ? (
            <g className="animate-wiggle origin-[70px_140px]">
              <path d="M 75 140 Q 55 120 50 100" stroke={skinColor} strokeWidth="12" strokeLinecap="round" />
              <circle cx="50" cy="98" r="7" fill={skinColor} />
            </g>
          ) : internalPose === 'hero' ? (
            <g>
              <path d="M 75 140 Q 60 155 70 170" stroke={skinColor} strokeWidth="12" strokeLinecap="round" />
              <circle cx="70" cy="170" r="7" fill={skinColor} />
            </g>
          ) : (
            <g>
              <path d="M 75 140 Q 62 160 68 178" stroke={skinColor} strokeWidth="11" strokeLinecap="round" />
              <circle cx="68" cy="180" r="6.5" fill={skinColor} />
            </g>
          )}

          {/* Right Arm */}
          {internalPose === 'wave' || internalPose === 'dance' ? (
            <g className="animate-bounce origin-[125px_140px]">
              <path d="M 125 140 Q 145 120 150 98" stroke={skinColor} strokeWidth="12" strokeLinecap="round" />
              <circle cx="150" cy="96" r="7" fill={skinColor} />
            </g>
          ) : internalPose === 'hero' ? (
            <g>
              <path d="M 125 140 Q 140 155 130 170" stroke={skinColor} strokeWidth="12" strokeLinecap="round" />
              <circle cx="130" cy="170" r="7" fill={skinColor} />
            </g>
          ) : (
            <g>
              <path d="M 125 140 Q 138 160 132 178" stroke={skinColor} strokeWidth="11" strokeLinecap="round" />
              <circle cx="132" cy="180" r="6.5" fill={skinColor} />
            </g>
          )}
        </g>

        {/* ================= HEAD & FACE ================= */}
        {/* Neck */}
        <rect x="94" y="124" width="12" height="15" rx="4" fill={skinColor} />

        {/* Head 3D Sphere */}
        <circle
          cx="100"
          cy="85"
          r="45"
          fill={`url(#chibi_skin_${chibi.gender})`}
          filter="url(#chibi-soft-shadow)"
        />

        {/* Ears */}
        {/* Left ear */}
        <circle cx="56" cy="88" r="9" fill={skinColor} />
        <circle cx="57" cy="88" r="5" fill="#fca5a5" opacity="0.6" />
        {/* Right ear */}
        <circle cx="144" cy="88" r="9" fill={skinColor} />
        <circle cx="143" cy="88" r="5" fill="#fca5a5" opacity="0.6" />

        {/* Earrings if equipped */}
        {earringsItem && (
          <g id="earrings">
            <circle cx="55" cy="96" r="4" fill={earringColor} className="animate-pulse" />
            <circle cx="55" cy="95" r="1.5" fill="#ffffff" />
            <circle cx="145" cy="96" r="4" fill={earringColor} className="animate-pulse" />
            <circle cx="145" cy="95" r="1.5" fill="#ffffff" />
          </g>
        )}

        {/* Cheek Blush */}
        <ellipse cx="74" cy="97" rx="9" ry="5" fill={blushColor} opacity="0.65" />
        <ellipse cx="126" cy="97" rx="9" ry="5" fill={blushColor} opacity="0.65" />

        {/* Big Shiny Chibi Eyes */}
        <g id="eyes">
          {/* Left Eye */}
          <ellipse cx="80" cy="84" rx="9" ry="12" fill="#1e1b4b" />
          <ellipse cx="80" cy="87" rx="6" ry="7" fill="#3b82f6" opacity="0.75" />
          <circle cx="77" cy="79" r="4" fill="#ffffff" />
          <circle cx="83" cy="90" r="1.8" fill="#ffffff" />
          {/* Right Eye */}
          <ellipse cx="120" cy="84" rx="9" ry="12" fill="#1e1b4b" />
          <ellipse cx="120" cy="87" rx="6" ry="7" fill="#3b82f6" opacity="0.75" />
          <circle cx="117" cy="79" r="4" fill="#ffffff" />
          <circle cx="123" cy="90" r="1.8" fill="#ffffff" />

          {/* Eyelashes for Girl */}
          {!isBoy && (
            <>
              <path d="M 72 75 Q 76 72 82 73" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 118 73 Q 124 72 128 75" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" />
            </>
          )}

          {/* Eyebrows */}
          <path d="M 74 69 Q 80 66 87 68" stroke={hairColor} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 113 68 Q 120 66 126 69" stroke={hairColor} strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* Cute Smiling Mouth */}
        <g id="mouth">
          {internalPose === 'happy' || internalPose === 'wave' ? (
            <path d="M 94 99 Q 100 108 106 99 Z" fill="#e11d48" stroke="#be123c" strokeWidth="1" />
          ) : (
            <path d="M 93 100 Q 100 106 107 100" stroke="#be123c" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          )}
        </g>

        {/* Nose dot */}
        <circle cx="100" cy="92" r="1.5" fill="#f87171" opacity="0.7" />

        {/* Glasses if equipped */}
        {glassesItem && (
          <g id="glasses" filter="url(#chibi-soft-shadow)">
            {/* Left frame */}
            <circle cx="80" cy="84" r="14" stroke={glassesColor} strokeWidth="3" fill="#38bdf8" fillOpacity="0.2" />
            {/* Right frame */}
            <circle cx="120" cy="84" r="14" stroke={glassesColor} strokeWidth="3" fill="#38bdf8" fillOpacity="0.2" />
            {/* Bridge */}
            <line x1="94" y1="84" x2="106" y2="84" stroke={glassesColor} strokeWidth="3" />
            {/* Temples */}
            <line x1="66" y1="84" x2="56" y2="84" stroke={glassesColor} strokeWidth="2.5" />
            <line x1="134" y1="84" x2="144" y2="84" stroke={glassesColor} strokeWidth="2.5" />
          </g>
        )}

        {/* ================= FRONT HAIR & BANGS ================= */}
        <g id="front-hair">
          {isBoy ? (
            // Boy Short/Spiky Hair
            <path
              d="M 56 75 C 55 45 75 35 100 35 C 125 35 145 45 144 75 C 140 70 135 62 125 65 C 115 68 110 58 100 62 C 90 58 85 68 75 65 C 65 62 60 70 56 75 Z"
              fill={`url(#chibi_hair_${chibi.gender})`}
            />
          ) : (
            // Girl Bob / Fringe Hair
            <path
              d="M 56 75 C 55 42 75 35 100 35 C 125 35 145 42 144 75 C 140 70 130 60 120 66 C 110 72 105 60 95 62 C 85 64 80 72 70 66 C 60 60 58 70 56 75 Z"
              fill={`url(#chibi_hair_${chibi.gender})`}
            />
          )}

          {/* Hair shine highlight */}
          <path
            d="M 75 45 Q 100 40 125 45"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.4"
          />
        </g>

        {/* ================= HAT / HEADWEAR ================= */}
        {hatItem && (
          <g id="hat" filter="url(#chibi-soft-shadow)">
            {hatItem.id === 'hat_golden_crown' ? (
              // Crown
              <g transform="translate(75, 20)">
                <polygon points="0,25 5,5 15,18 25,2 35,18 45,5 50,25" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
                <circle cx="5" cy="5" r="3" fill="#ef4444" />
                <circle cx="25" cy="2" r="3.5" fill="#3b82f6" />
                <circle cx="45" cy="5" r="3" fill="#10b981" />
                <rect x="0" y="24" width="50" height="6" rx="2" fill="#eab308" />
              </g>
            ) : hatItem.id === 'hat_halo_angel' ? (
              // Angel Halo
              <ellipse cx="100" cy="22" rx="32" ry="9" stroke="#38bdf8" strokeWidth="4" fill="none" className="animate-pulse" />
            ) : (
              // Cap / Hat general
              <g transform="translate(62, 22)">
                <path d="M 5 28 C 5 5 70 5 70 28 Z" fill={hatColor} />
                <path d="M 0 28 Q 40 33 80 28" stroke="#ca8a04" strokeWidth="4" strokeLinecap="round" />
                <ellipse cx="40" cy="28" rx="38" ry="6" fill={hatColor} />
                {/* Button on top */}
                <circle cx="38" cy="10" r="4" fill="#ffffff" />
              </g>
            )}
          </g>
        )}
      </svg>

      {/* Gender & Pose Tag */}
      <div className="absolute top-1 left-2 bg-white/90 backdrop-blur-xs text-[10px] font-black px-2 py-0.5 rounded-full border border-purple-200 text-purple-700 shadow-xs flex items-center gap-1">
        <span>{isBoy ? '👦 Bé Trai 3D' : '👧 Bé Gái 3D'}</span>
      </div>

      {interactive && (
        <div className="absolute bottom-1 right-2 bg-amber-400 text-amber-950 text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs opacity-75 group-hover:opacity-100 transition-opacity">
          Tạo dáng 👆
        </div>
      )}
    </div>
  );
};
