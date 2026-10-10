import React, { useState, useMemo } from 'react';
import { UserState, LevelData } from '../types';
import { LEVELS } from '../data/curriculum';
import { sound } from '../utils/audio';
import { 
  Lock, 
  Star, 
  CheckCircle, 
  Sparkles, 
  Trophy, 
  Search, 
  Compass, 
  Grid, 
  MapPin, 
  ChevronLeft, 
  ChevronRight,
  Flame,
  Award
} from 'lucide-react';

interface LevelMapProps {
  user: UserState;
  onSelectLevel: (levelData: LevelData) => void;
}

interface ZoneInfo {
  id: number;
  name: string;
  startLevel: number;
  endLevel: number;
  icon: string;
  themeColor: string;
  bgColor: string;
}

const ZONES: ZoneInfo[] = [
  { id: 1, name: 'Đảo Khởi Đầu & Bạn Bè', startLevel: 1, endLevel: 10, icon: '🏝️', themeColor: 'from-emerald-400 to-teal-500', bgColor: 'bg-emerald-50' },
  { id: 2, name: 'Vương Quốc Đời Sống', startLevel: 11, endLevel: 20, icon: '🏰', themeColor: 'from-amber-400 to-orange-500', bgColor: 'bg-amber-50' },
  { id: 3, name: 'Xứ Sở Thiên Nhiên', startLevel: 21, endLevel: 30, icon: '🌿', themeColor: 'from-green-500 to-emerald-600', bgColor: 'bg-green-50' },
  { id: 4, name: 'Thành Phố Muôn Màu', startLevel: 31, endLevel: 40, icon: '🏙️', themeColor: 'from-sky-400 to-blue-500', bgColor: 'bg-sky-50' },
  { id: 5, name: 'Thung Lũng Khoa Học', startLevel: 41, endLevel: 50, icon: '🔬', themeColor: 'from-indigo-400 to-purple-500', bgColor: 'bg-indigo-50' },
  { id: 6, name: 'Thế Giới Sinh Thái', startLevel: 51, endLevel: 60, icon: '🌍', themeColor: 'from-teal-400 to-cyan-500', bgColor: 'bg-teal-50' },
  { id: 7, name: 'Nếp Sống Đẹp', startLevel: 61, endLevel: 70, icon: '💖', themeColor: 'from-rose-400 to-pink-500', bgColor: 'bg-rose-50' },
  { id: 8, name: 'Kỳ Quan Thế Giới', startLevel: 71, endLevel: 80, icon: '🏛️', themeColor: 'from-purple-500 to-indigo-600', bgColor: 'bg-purple-50' },
  { id: 9, name: 'Khám Phá Muôn Loài', startLevel: 81, endLevel: 90, icon: '🦁', themeColor: 'from-orange-500 to-amber-600', bgColor: 'bg-orange-50' },
  { id: 10, name: 'Đỉnh Cao Trí Tuệ', startLevel: 91, endLevel: 100, icon: '👑', themeColor: 'from-yellow-400 to-amber-500', bgColor: 'bg-yellow-50' }
];

export const LevelMap: React.FC<LevelMapProps> = ({ user, onSelectLevel }) => {
  // Determine current active zone based on user's current level
  const userZoneId = useMemo(() => {
    const matched = ZONES.find((z) => user.level >= z.startLevel && user.level <= z.endLevel);
    return matched ? matched.id : 1;
  }, [user.level]);

  const [activeZoneId, setActiveZoneId] = useState<number>(userZoneId);
  const [viewMode, setViewMode] = useState<'adventure' | 'grid'>('adventure');
  const [searchQuery, setSearchQuery] = useState('');

  const activeZone = ZONES.find((z) => z.id === activeZoneId) || ZONES[0];

  // Levels for the currently selected zone
  const zoneLevels = useMemo(() => {
    return LEVELS.filter((lvl) => lvl.level >= activeZone.startLevel && lvl.level <= activeZone.endLevel);
  }, [activeZone]);

  // Filtered levels for search
  const searchedLevels = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return LEVELS.filter(
      (lvl) =>
        lvl.title.toLowerCase().includes(query) ||
        lvl.subtitle.toLowerCase().includes(query) ||
        `cấp ${lvl.level}`.includes(query) ||
        lvl.level.toString() === query
    );
  }, [searchQuery]);

  const handlePrevZone = () => {
    sound.playClick();
    if (activeZoneId > 1) {
      setActiveZoneId((prev) => prev - 1);
    }
  };

  const handleNextZone = () => {
    sound.playClick();
    if (activeZoneId < ZONES.length) {
      setActiveZoneId((prev) => prev + 1);
    }
  };

  const handleJumpToMyLevel = () => {
    sound.playStar();
    setSearchQuery('');
    setActiveZoneId(userZoneId);
    setViewMode('adventure');
  };

  return (
    <div className="relative max-w-5xl mx-auto px-3 sm:px-6 py-6">
      
      {/* Map Header Banner */}
      <div className="text-center mb-6 relative">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 text-white font-extrabold text-sm sm:text-base px-6 py-2 rounded-full shadow-lg border-2 border-white animate-float">
          <Sparkles className="w-5 h-5 text-yellow-200 fill-yellow-200" />
          <span>Hành Trình 100 Cấp Độ & Chủ Đề Anh Ngữ</span>
          <Sparkles className="w-5 h-5 text-yellow-200 fill-yellow-200" />
        </div>
        <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-2">
          Mỗi cấp độ là 1 chủ đề kỳ thú với 50 từ vựng và 50 bài kiểm tra tương tác hấp dẫn!
        </p>
      </div>

      {/* Control Bar: Jump to level, Search, and View Mode Toggle */}
      <div className="bg-white/95 backdrop-blur-xs border-2 border-amber-300 rounded-3xl p-3.5 shadow-md mb-6 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm chủ đề hoặc cấp (1 - 100)..."
            className="w-full bg-slate-100 hover:bg-slate-200/70 focus:bg-white border border-slate-200 focus:border-amber-400 rounded-2xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Center Quick Stats */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleJumpToMyLevel}
            onMouseEnter={() => sound.playHoverPop()}
            className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-black text-xs px-3.5 py-2 rounded-2xl transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-xs hover:scale-105"
          >
            <MapPin className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>Đến Cấp Hiện Tại (Cấp {user.level})</span>
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => {
              sound.playClick();
              setViewMode('adventure');
            }}
            onMouseEnter={() => sound.playHoverPop()}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              viewMode === 'adventure'
                ? 'bg-amber-400 text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Đường Phiêu Lưu</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setViewMode('grid');
            }}
            onMouseEnter={() => sound.playHoverPop()}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-amber-400 text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Lưới 100 Cấp</span>
          </button>
        </div>
      </div>

      {/* SEARCH RESULTS VIEW (IF SEARCHING) */}
      {searchQuery.trim() && (
        <div className="mb-8 bg-white border-2 border-amber-300 rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-sm text-slate-800">
              Kết Quả Tìm Kiếm ({searchedLevels.length} cấp độ)
            </h3>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-amber-700 font-bold hover:underline"
            >
              Đóng kết quả
            </button>
          </div>

          {searchedLevels.length === 0 ? (
            <p className="text-center py-8 text-xs text-slate-500 font-semibold">
              Không tìm thấy cấp độ nào phù hợp với "{searchQuery}".
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {searchedLevels.map((lvl) => {
                const isUnlocked = lvl.level <= user.level;
                const stars = user.levelStars[lvl.level] || 0;
                return (
                  <button
                    key={lvl.level}
                    onClick={() => {
                      if (isUnlocked) {
                        sound.playStar();
                        onSelectLevel(lvl);
                      } else {
                        sound.playWrong();
                      }
                    }}
                    onMouseEnter={() => sound.playHoverPop()}
                    className={`p-3.5 rounded-2xl border-2 text-left flex items-center gap-3 transition-all cursor-pointer ${
                      isUnlocked
                        ? 'bg-white hover:border-amber-400 shadow-sm hover:scale-102'
                        : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${lvl.themeColor} flex items-center justify-center text-2xl text-white shadow-xs shrink-0`}>
                      {isUnlocked ? lvl.icon : <Lock className="w-5 h-5 text-slate-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.2 rounded-full">
                          Cấp {lvl.level}
                        </span>
                        {stars > 0 && (
                          <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-400 inline" />
                            <span>{stars}/3</span>
                          </span>
                        )}
                      </div>
                      <h4 className="font-extrabold text-xs text-slate-800 truncate mt-0.5">
                        {lvl.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate">
                        50 từ vựng • 50 câu đố
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ZONE CAROUSEL TABS (When not in full search mode) */}
      {!searchQuery.trim() && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Chọn Vùng Đất Khám Phá (10 Vùng Đất Kỳ Diệu):
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevZone}
                onMouseEnter={() => sound.playHoverPop()}
                disabled={activeZoneId === 1}
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextZone}
                onMouseEnter={() => sound.playHoverPop()}
                disabled={activeZoneId === ZONES.length}
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {ZONES.map((zone) => {
              const isActive = zone.id === activeZoneId;
              const isZoneUnlocked = user.level >= zone.startLevel;
              const isUserInZone = user.level >= zone.startLevel && user.level <= zone.endLevel;

              return (
                <button
                  key={zone.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveZoneId(zone.id);
                  }}
                  onMouseEnter={() => sound.playHoverPop()}
                  className={`shrink-0 px-3.5 py-2 rounded-2xl border-2 transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? `bg-gradient-to-r ${zone.themeColor} text-white border-white shadow-md scale-102 font-black`
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 font-bold hover:scale-102'
                  }`}
                >
                  <span className="text-lg">{zone.icon}</span>
                  <div className="text-left">
                    <div className="text-xs whitespace-nowrap">{zone.name}</div>
                    <div className={`text-[10px] ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                      Cấp {zone.startLevel} - {zone.endLevel}
                      {isUserInZone && ' • Bé ở đây'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ADVENTURE WINDING ROAD VIEW */}
      {!searchQuery.trim() && viewMode === 'adventure' && (
        <div className={`relative rounded-3xl p-6 sm:p-10 border-4 border-white shadow-xl ${activeZone.bgColor} overflow-hidden`}>
          
          {/* Zone Title Header Banner */}
          <div className="text-center mb-10">
            <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${activeZone.themeColor} text-white text-xs sm:text-sm font-black px-4 py-1.5 rounded-full shadow-sm`}>
              <span>{activeZone.icon}</span>
              <span>Vùng Đất {activeZone.id}: {activeZone.name} (Cấp {activeZone.startLevel} - {activeZone.endLevel})</span>
            </div>
          </div>

          {/* 10 Level Nodes for this Zone */}
          <div className="relative flex flex-col items-center gap-10 sm:gap-14">
            {zoneLevels.map((levelItem, idx) => {
              const isUnlocked = levelItem.level <= user.level;
              const isCurrent = levelItem.level === user.level;
              const starsEarned = (user.levelStars && user.levelStars[levelItem.level]) || 0;
              const isCompleted = levelItem.level < user.level || starsEarned > 0;

              // Alternating winding pattern
              const horizontalOffset =
                idx % 2 === 0
                  ? 'sm:-translate-x-16 md:-translate-x-28'
                  : 'sm:translate-x-16 md:translate-x-28';

              return (
                <div
                  key={levelItem.level}
                  className={`relative flex flex-col items-center transition-transform duration-300 ${horizontalOffset}`}
                >
                  {/* Connector Line */}
                  {idx < zoneLevels.length - 1 && (
                    <div className="absolute top-24 sm:top-28 w-1.5 h-12 sm:h-16 bg-amber-300 -z-10 border-r-2 border-dashed border-amber-400" />
                  )}

                  {/* Mascot Pointer */}
                  {isCurrent && (
                    <div className="absolute -top-9 z-20 flex flex-col items-center animate-bounce">
                      <div className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md border border-white whitespace-nowrap">
                        Bé đang ở đây! 👇
                      </div>
                    </div>
                  )}

                  {/* Main Circle Button */}
                  <div
                    onClick={() => {
                      if (isUnlocked) {
                        sound.playStar();
                        onSelectLevel(levelItem);
                      } else {
                        sound.playWrong();
                      }
                    }}
                    onMouseEnter={() => sound.playHoverPop()}
                    className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-all duration-300 border-4 shadow-xl select-none group ${
                      isUnlocked
                        ? `bg-gradient-to-tr ${levelItem.themeColor} border-white hover:scale-110 active:scale-95 ${
                            isCurrent ? 'ring-8 ring-amber-300/80 shadow-amber-300/50' : ''
                          }`
                        : 'bg-slate-200 border-slate-300 text-slate-400 opacity-80 cursor-not-allowed'
                    }`}
                  >
                    {/* Level Number Pill */}
                    <div className="absolute -top-2.5 bg-white text-slate-900 border-2 border-amber-300 text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs">
                      Cấp {levelItem.level}
                    </div>

                    {/* Icon or Lock */}
                    {isUnlocked ? (
                      <div className="text-3xl sm:text-4xl filter drop-shadow group-hover:scale-110 transition-transform">
                        {levelItem.icon}
                      </div>
                    ) : (
                      <Lock className="w-8 h-8 text-slate-400" />
                    )}

                    {/* Completed Check Badge */}
                    {isCompleted && (
                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow-md border-2 border-white">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Level Details Card Underneath */}
                  <div
                    onClick={() => {
                      if (isUnlocked) {
                        sound.playStar();
                        onSelectLevel(levelItem);
                      }
                    }}
                    onMouseEnter={() => sound.playHoverPop()}
                    className={`mt-2 bg-white/95 backdrop-blur-xs border-2 rounded-2xl px-3.5 py-2 text-center shadow-md max-w-[210px] cursor-pointer transition-transform hover:scale-105 ${
                      isUnlocked
                        ? isCurrent
                          ? 'border-amber-400 ring-2 ring-amber-300'
                          : 'border-slate-200'
                        : 'border-slate-200 opacity-70'
                    }`}
                  >
                    <div className="font-black text-xs text-slate-800 line-clamp-1">
                      {levelItem.title}
                    </div>
                    <div className="text-[10px] text-slate-500 font-semibold line-clamp-1 mt-0.5">
                      50 từ • 50 câu đố
                    </div>

                    {/* Stars */}
                    <div className="flex items-center justify-center gap-1 mt-1.5">
                      {[1, 2, 3].map((starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-3.5 h-3.5 transition-colors ${
                            starIdx <= starsEarned
                              ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                              : 'text-slate-300 fill-slate-100'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Bottom Zone Navigation Pagers */}
          <div className="mt-12 flex items-center justify-between pt-6 border-t border-amber-200/60">
            <button
              onClick={handlePrevZone}
              onMouseEnter={() => sound.playHoverPop()}
              disabled={activeZoneId === 1}
              className="bg-white hover:bg-slate-50 text-slate-800 disabled:opacity-40 font-bold text-xs px-4 py-2 rounded-xl border border-slate-200 shadow-xs flex items-center gap-1.5 cursor-pointer hover:scale-105"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Vùng Đất Trước</span>
            </button>

            <span className="text-xs font-black text-slate-600">
              {activeZoneId} / {ZONES.length}
            </span>

            <button
              onClick={handleNextZone}
              onMouseEnter={() => sound.playHoverPop()}
              disabled={activeZoneId === ZONES.length}
              className="bg-white hover:bg-slate-50 text-slate-800 disabled:opacity-40 font-bold text-xs px-4 py-2 rounded-xl border border-slate-200 shadow-xs flex items-center gap-1.5 cursor-pointer hover:scale-105"
            >
              <span>Vùng Đất Kế Tiếp</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* PANORAMIC 100-LEVEL GRID VIEW */}
      {!searchQuery.trim() && viewMode === 'grid' && (
        <div className="bg-white border-2 border-amber-300 rounded-3xl p-5 sm:p-7 shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-black text-base text-slate-900">
                Toàn Cảnh 100 Cấp Độ & Chủ Đề
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Đã mở khóa: Cấp 1 đến Cấp {user.level} (Tổng 100 Cấp)
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-black bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                {Object.keys(user.levelStars).length}/100 đã hoàn thành
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {LEVELS.map((lvl) => {
              const isUnlocked = lvl.level <= user.level;
              const isCurrent = lvl.level === user.level;
              const stars = user.levelStars[lvl.level] || 0;

              return (
                <button
                  key={lvl.level}
                  onClick={() => {
                    if (isUnlocked) {
                      sound.playStar();
                      onSelectLevel(lvl);
                    } else {
                      sound.playWrong();
                    }
                  }}
                  onMouseEnter={() => sound.playHoverPop()}
                  className={`p-3 rounded-2xl border-2 text-center flex flex-col items-center justify-between gap-1 transition-all cursor-pointer ${
                    isUnlocked
                      ? isCurrent
                        ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300 shadow-sm scale-102'
                        : 'bg-white hover:border-amber-300 hover:shadow-xs hover:scale-103'
                      : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between w-full text-[10px] font-black text-slate-500">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded-md text-slate-700">
                      Cấp {lvl.level}
                    </span>
                    {stars > 0 && (
                      <span className="text-amber-600 font-bold flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-400 inline" />
                        <span>{stars}</span>
                      </span>
                    )}
                  </div>

                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${lvl.themeColor} flex items-center justify-center text-2xl text-white shadow-2xs my-1`}>
                    {isUnlocked ? lvl.icon : <Lock className="w-5 h-5 text-slate-300" />}
                  </div>

                  <div className="font-extrabold text-[11px] text-slate-800 line-clamp-1 w-full">
                    {lvl.title}
                  </div>

                  <div className="text-[9px] text-slate-400 font-semibold">
                    50 từ • 50 câu
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
