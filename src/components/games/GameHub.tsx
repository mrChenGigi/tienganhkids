import React, { useState, useMemo } from 'react';
import { WordItem } from '../../types';
import { LEVELS } from '../../data/curriculum';
import { BubblePopGame } from './BubblePopGame';
import { MemoryFlipGame } from './MemoryFlipGame';
import { SpellingPuzzleGame } from './SpellingPuzzleGame';
import { VocabSpeedRunnerGame } from './VocabSpeedRunnerGame';
import { PictureRiddleGame } from './PictureRiddleGame';
import { AudioListenCatchGame } from './AudioListenCatchGame';
import { sound } from '../../utils/audio';
import { X, Sparkles, Gamepad2, ArrowLeft, Trophy, Star, Flame } from 'lucide-react';

interface GameHubProps {
  currentLevel: number;
  onFinishGame: (gameType: 'bubble' | 'memory' | 'spelling' | 'speed_runner' | 'picture_riddle' | 'audio_listen', score: number, coins: number) => void;
  onClose: () => void;
}

type ActiveGame = null | 'bubble' | 'memory' | 'spelling' | 'speed_runner' | 'picture_riddle' | 'audio_listen';

interface GameMetadata {
  id: NonNullable<ActiveGame>;
  title: string;
  tagline: string;
  icon: string;
  colorBg: string;
  borderColor: string;
  accentBtn: string;
  rewardText: string;
  levelsCount: number;
}

const ALL_GAMES: GameMetadata[] = [
  {
    id: 'bubble',
    title: 'Bóng Bay Từ Vựng',
    tagline: 'Nghe từ vựng và bắn vỡ quả bóng chứa hình ảnh đúng thật nhanh!',
    icon: '🎈',
    colorBg: 'from-sky-50 to-blue-100',
    borderColor: 'border-sky-300',
    accentBtn: 'bg-sky-500 hover:bg-sky-600',
    rewardText: '⭐ 25-40 Sao',
    levelsCount: 4
  },
  {
    id: 'memory',
    title: 'Lật Thẻ Trí Nhớ',
    tagline: 'Rèn luyện siêu trí nhớ bằng cách lật và ghép cặp từ tiếng Anh với hình!',
    icon: '🃏',
    colorBg: 'from-pink-50 to-purple-100',
    borderColor: 'border-pink-300',
    accentBtn: 'bg-pink-500 hover:bg-pink-600',
    rewardText: '⭐ 30-50 Sao',
    levelsCount: 4
  },
  {
    id: 'spelling',
    title: 'Xếp Chữ Thần Tốc',
    tagline: 'Kéo và bấm các chữ cái theo đúng thứ tự để tạo nên từ vựng hoàn hảo!',
    icon: '✏️',
    colorBg: 'from-emerald-50 to-teal-100',
    borderColor: 'border-emerald-300',
    accentBtn: 'bg-emerald-500 hover:bg-emerald-600',
    rewardText: '⭐ 35-55 Sao',
    levelsCount: 4
  },
  {
    id: 'speed_runner',
    title: 'Đua Thuyền Tốc Độ',
    tagline: 'Thử thách phản xạ cực nhanh với đồng hồ đếm ngược và chuỗi liên hoàn!',
    icon: '⚡',
    colorBg: 'from-indigo-50 to-purple-100',
    borderColor: 'border-indigo-300',
    accentBtn: 'bg-indigo-600 hover:bg-indigo-700',
    rewardText: '⭐ 40-70 Sao',
    levelsCount: 4
  },
  {
    id: 'picture_riddle',
    title: 'Đố Vui Hình Ảnh',
    tagline: 'Nhìn hình đoán nghĩa và giải đố các câu đố tiếng Anh ngộ nghĩnh!',
    icon: '🐾',
    colorBg: 'from-amber-50 to-orange-100',
    borderColor: 'border-amber-300',
    accentBtn: 'bg-amber-500 hover:bg-amber-600',
    rewardText: '⭐ 35 Sao + 💎 1 KC',
    levelsCount: 3
  },
  {
    id: 'audio_listen',
    title: 'Lắng Nghe Bắt Hình',
    tagline: 'Luyện đôi tai vàng: Nghe phát âm chuẩn người bản xứ và chọn tranh đúng!',
    icon: '🎧',
    colorBg: 'from-teal-50 to-cyan-100',
    borderColor: 'border-teal-300',
    accentBtn: 'bg-teal-500 hover:bg-teal-600',
    rewardText: '⭐ 40 Sao',
    levelsCount: 3
  }
];

export const GameHub: React.FC<GameHubProps> = ({ currentLevel, onFinishGame, onClose }) => {
  const [activeGame, setActiveGame] = useState<ActiveGame>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(1);
  const [filterType, setFilterType] = useState<'all' | 'word' | 'listening' | 'speed'>('all');

  // Words for games
  const gameWords: WordItem[] = useMemo(() => {
    const currentLvlData = LEVELS.find((l) => l.level === currentLevel);
    const activeWords = currentLvlData ? currentLvlData.words : LEVELS[0].words;
    if (activeWords.length >= 6) return activeWords;

    const allUnlockedWords = LEVELS
      .filter((lvl) => lvl.level <= currentLevel)
      .flatMap((lvl) => lvl.words);

    return allUnlockedWords.length >= 6 ? allUnlockedWords.slice(0, 50) : LEVELS[0].words;
  }, [currentLevel]);

  const handleSelectGame = (type: ActiveGame) => {
    sound.playClick();
    setActiveGame(type);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border-4 border-purple-400 shadow-2xl max-w-4xl w-full p-4 sm:p-6 relative max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-100 pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            {activeGame ? (
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveGame(null);
                }}
                className="w-10 h-10 rounded-2xl bg-purple-100 hover:bg-purple-200 text-purple-700 flex items-center justify-center cursor-pointer transition-colors"
                title="Quay lại danh mục trò chơi"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xl shadow-md">
                <Gamepad2 className="w-6 h-6" />
              </div>
            )}
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-purple-950 flex items-center gap-2">
                {activeGame ? 'Đang Chơi Game' : 'Khu Vui Chơi Tiếng Anh Mở Rộng'}
                {!activeGame && (
                  <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full border border-amber-300">
                    6 Trò Chơi • Đa Cấp Độ
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 font-semibold">
                Chơi vui thả ga, tích lũy Sao Vàng & Kim Cương sắm đồ Chibi 3D!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level / Difficulty Selector when selecting a game */}
        {!activeGame && (
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 bg-purple-50/70 p-2.5 rounded-2xl border border-purple-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-purple-900">
                🎯 Chọn Độ Khó / Cấp Độ Trò Chơi:
              </span>
              <div className="flex gap-1">
                {[
                  { lvl: 1, label: 'Dễ (Level 1)' },
                  { lvl: 2, label: 'Vừa (Level 2)' },
                  { lvl: 3, label: 'Khó (Level 3)' },
                  { lvl: 4, label: 'Siêu Tốc (Level 4)' },
                ].map((item) => (
                  <button
                    key={item.lvl}
                    onClick={() => {
                      sound.playClick();
                      setSelectedDifficulty(item.lvl);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      selectedDifficulty === item.lvl
                        ? 'bg-purple-600 text-white shadow-xs scale-105'
                        : 'bg-white text-slate-700 hover:bg-purple-100 border border-purple-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-purple-800 font-bold flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500" /> Cấp độ càng cao, nhận càng nhiều Sao & Kim Cương!
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          {!activeGame ? (
            <div className="space-y-4">
              {/* Games Grid (6 Games) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {ALL_GAMES.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => handleSelectGame(game.id)}
                    onMouseEnter={() => sound.playHoverPop()}
                    className={`bg-gradient-to-b ${game.colorBg} border-2 ${game.borderColor} rounded-3xl p-4 text-center cursor-pointer transition-all duration-300 hover:scale-103 hover:shadow-xl active:scale-95 group flex flex-col justify-between`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black bg-white/80 px-2 py-0.5 rounded-full text-slate-600 border border-slate-200">
                          {game.levelsCount} Cấp Độ
                        </span>
                        <span className="text-[10px] font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full shadow-2xs">
                          {game.rewardText}
                        </span>
                      </div>

                      {/* Icon */}
                      <div className="w-16 h-16 mx-auto rounded-full bg-white flex items-center justify-center text-3xl shadow-md mb-2 group-hover:scale-110 transition-transform">
                        {game.icon}
                      </div>

                      <h3 className="font-black text-slate-800 text-base mb-1">
                        {game.title}
                      </h3>
                      <p className="text-xs text-slate-600 font-medium mb-3 line-clamp-2">
                        {game.tagline}
                      </p>
                    </div>

                    <button className={`w-full py-2 ${game.accentBtn} text-white font-bold text-xs rounded-xl shadow-xs transition-colors`}>
                      Chơi Ngay (Cấp {selectedDifficulty}) 🎮
                    </button>
                  </div>
                ))}
              </div>

              {/* Tips banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center gap-2.5 text-xs text-amber-900 font-semibold">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  Bé có thể tích lũy Sao Vàng và Kim Cương từ mỗi ván chơi để vào <strong>Trang Cá Nhân</strong> sắm quần áo, giày dép, mũ nón, tóc và phụ kiện 3D cho nhân vật Chibi nhé!
                </span>
              </div>
            </div>
          ) : (
            /* Active Game Containers */
            <div className="py-2">
              {activeGame === 'bubble' && (
                <BubblePopGame
                  words={gameWords}
                  onFinish={(score, coins) => {
                    onFinishGame('bubble', score, coins * selectedDifficulty);
                    setActiveGame(null);
                  }}
                  onExit={() => setActiveGame(null)}
                />
              )}

              {activeGame === 'memory' && (
                <MemoryFlipGame
                  words={gameWords}
                  onFinish={(score, coins) => {
                    onFinishGame('memory', score, coins * selectedDifficulty);
                    setActiveGame(null);
                  }}
                  onExit={() => setActiveGame(null)}
                />
              )}

              {activeGame === 'spelling' && (
                <SpellingPuzzleGame
                  words={gameWords}
                  onFinish={(score, coins) => {
                    onFinishGame('spelling', score, coins * selectedDifficulty);
                    setActiveGame(null);
                  }}
                  onExit={() => setActiveGame(null)}
                />
              )}

              {activeGame === 'speed_runner' && (
                <VocabSpeedRunnerGame
                  words={gameWords}
                  difficultyLevel={selectedDifficulty}
                  onFinish={(score, coins) => {
                    onFinishGame('speed_runner', score, coins);
                    setActiveGame(null);
                  }}
                  onExit={() => setActiveGame(null)}
                />
              )}

              {activeGame === 'picture_riddle' && (
                <PictureRiddleGame
                  words={gameWords}
                  difficultyLevel={selectedDifficulty}
                  onFinish={(score, coins) => {
                    onFinishGame('picture_riddle', score, coins);
                    setActiveGame(null);
                  }}
                  onExit={() => setActiveGame(null)}
                />
              )}

              {activeGame === 'audio_listen' && (
                <AudioListenCatchGame
                  words={gameWords}
                  difficultyLevel={selectedDifficulty}
                  onFinish={(score, coins) => {
                    onFinishGame('audio_listen', score, coins);
                    setActiveGame(null);
                  }}
                  onExit={() => setActiveGame(null)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
