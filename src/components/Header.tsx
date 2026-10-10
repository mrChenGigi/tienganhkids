import React from 'react';
import { UserState, Mascot, AuthAccount } from '../types';
import { MASCOTS } from '../data/curriculum';
import { sound } from '../utils/audio';
import { 
  Trophy, 
  Gamepad2, 
  ShoppingBag, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Flame, 
  Sparkles,
  WifiOff,
  Target,
  User,
  LogIn,
  BookOpen,
  Star
} from 'lucide-react';

interface HeaderProps {
  user: UserState;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenDailyMissions: () => void;
  onOpenShop: () => void;
  onOpenGames: () => void;
  onOpenDictionary: () => void;
  onOpenLeaderboard: () => void;
  onOpenParent: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  currentAccount: AuthAccount | null;
  onOpenPersonalProfile: () => void;
  isOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  soundEnabled,
  onToggleSound,
  onOpenDailyMissions,
  onOpenShop,
  onOpenGames,
  onOpenDictionary,
  onOpenLeaderboard,
  onOpenParent,
  onOpenProfile,
  onOpenAuth,
  currentAccount,
  onOpenPersonalProfile,
  isOnline
}) => {
  const currentMascot: Mascot = MASCOTS.find((m) => m.id === user.mascotId) || MASCOTS[0];

  const unclaimedMissions = (user.dailyMissions || []).filter(
    (m) => m.current >= m.target && !m.claimed
  ).length;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b-2 border-amber-200 shadow-sm px-3 py-2.5 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Brand & Mascot Logo */}
        <div 
          onClick={() => {
            sound.playClick();
            onOpenProfile();
          }}
          onMouseEnter={() => sound.playHoverPop()}
          className="flex items-center gap-2.5 cursor-pointer group transition-transform active:scale-95"
        >
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-yellow-300 p-0.5 shadow-md flex items-center justify-center">
            <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform">
              {currentMascot.emoji}
            </span>
            <div className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-white">
              Lv.{user.level}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base sm:text-lg bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 bg-clip-text text-transparent leading-none">
                behocvui
              </h1>
              <span className="text-[11px] sm:text-xs font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-md hidden md:inline">
                Kids English
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-600 font-semibold mt-0.5">
              <span>{user.nickname}</span>
              <span className="text-amber-500 text-[10px]">✏️</span>
            </div>
          </div>
        </div>

        {/* Currency & Streak Stats */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak */}
          <div 
            title="Chuỗi ngày học liên tục"
            onMouseEnter={() => sound.playHoverPop()}
            className="flex items-center gap-1 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-xl text-orange-700 text-xs sm:text-sm font-bold shadow-xs cursor-default hover:bg-orange-100 transition-colors"
          >
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-wiggle" />
            <span>{user.streakDays} ngày</span>
          </div>

          {/* Golden Stars / Sao Vàng */}
          <button
            onClick={() => {
              sound.playStar();
              onOpenShop();
            }}
            onMouseEnter={() => sound.playHoverPop()}
            title="Sao Vàng tích lũy - Bấm để vào Cửa Hàng"
            className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 px-2.5 py-1 rounded-xl text-amber-900 text-xs sm:text-sm font-extrabold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-400 drop-shadow-xs" />
            <span>{user.coins}</span>
          </button>

          {/* Gem Badges */}
          <button
            onClick={() => {
              sound.playStar();
              onOpenShop();
            }}
            onMouseEnter={() => sound.playHoverPop()}
            title="Huy Hiệu Kim Cương"
            className="flex items-center gap-1 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 px-2 py-1 rounded-xl text-cyan-800 text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <span className="text-base">💎</span>
            <span>{user.gems}</span>
          </button>
        </div>

        {/* Quick Actions Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Offline indicator if disconnected */}
          {!isOnline && (
            <div 
              title="Chế độ ngoại tuyến (Không cần mạng)"
              className="flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-1 rounded-xl text-xs font-bold"
            >
              <WifiOff className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Ngoại Tuyến</span>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              sound.playClick();
            }}
            onMouseEnter={() => sound.playHoverPop()}
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-rose-500" />
            )}
          </button>

          {/* Daily Missions Button */}
          <button
            onClick={() => {
              sound.playStar();
              onOpenDailyMissions();
            }}
            onMouseEnter={() => sound.playHoverPop()}
            className="relative flex items-center gap-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-transform active:scale-95 cursor-pointer hover:scale-105"
          >
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Thử Thách</span>
            {unclaimedMissions > 0 && (
              <span className="absolute -top-1.5 -right-1 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce border-2 border-white">
                {unclaimedMissions}
              </span>
            )}
          </button>

          {/* Leaderboard Button */}
          <button
            onClick={() => {
              sound.playStar();
              onOpenLeaderboard();
            }}
            onMouseEnter={() => sound.playHoverPop()}
            className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-transform active:scale-95 cursor-pointer hover:scale-105"
          >
            <Trophy className="w-4 h-4 fill-white" />
            <span className="hidden sm:inline">BXH Tuần</span>
          </button>

          {/* Games Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenGames();
            }}
            onMouseEnter={() => sound.playHoverPop()}
            className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-transform active:scale-95 cursor-pointer hover:scale-105"
          >
            <Gamepad2 className="w-4 h-4" />
            <span className="hidden sm:inline">Trò Chơi</span>
          </button>

          {/* Picture Dictionary Button */}
          <button
            onClick={() => {
              sound.playStar();
              onOpenDictionary();
            }}
            onMouseEnter={() => sound.playHoverPop()}
            title="Cuốn Từ Điển Của Bé - Xem lại từ vựng & nghe phát âm"
            className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-transform active:scale-95 cursor-pointer hover:scale-105"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Từ Điển</span>
          </button>

          {/* Shop Button */}
          <button
            onClick={() => {
              sound.playCoin();
              onOpenShop();
            }}
            onMouseEnter={() => sound.playHoverPop()}
            className="flex items-center gap-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-transform active:scale-95 cursor-pointer hover:scale-105"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Kho Đồ</span>
          </button>

          {/* Auth or Personal Profile Chibi Button */}
          {currentAccount ? (
            <button
              onClick={() => {
                sound.playStar();
                onOpenPersonalProfile();
              }}
              onMouseEnter={() => sound.playHoverPop()}
              className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black shadow-sm transition-transform active:scale-95 cursor-pointer hover:scale-105"
              title="Xem Trang Cá Nhân, Tủ Đồ 3D và Chỉnh Sửa Nhân Vật"
            >
              <span className="text-sm">
                {currentAccount.chibi.gender === 'boy' ? '👦' : '👧'}
              </span>
              <span className="hidden sm:inline">Trang Cá Nhân</span>
            </button>
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                onOpenAuth();
              }}
              onMouseEnter={() => sound.playHoverPop()}
              className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black shadow-sm transition-transform active:scale-95 cursor-pointer hover:scale-105"
              title="Đăng Ký & Đăng Nhập để nhận nhân vật Chibi 3D"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng Nhập</span>
            </button>
          )}

          {/* Parent Mode Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenParent();
            }}
            onMouseEnter={() => sound.playHoverPop()}
            title="Khu vực dành cho Phụ huynh (Có mã khóa bảo vệ)"
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-900 text-amber-300 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-colors cursor-pointer hover:scale-105"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden md:inline">Phụ Huynh</span>
          </button>
        </div>

      </div>
    </header>
  );
};
