import React, { useState } from 'react';
import { UserState, LevelData } from '../types';
import { LEVELS } from '../data/curriculum';
import { sound, speakEnglish } from '../utils/audio';
import { triggerCenterExplosion, triggerGoldenShower } from '../utils/celebration';
import { 
  Trophy, 
  Sparkles, 
  Star, 
  Crown, 
  Flame, 
  ShieldCheck, 
  ExternalLink, 
  Award,
  ChevronRight,
  Sparkle
} from 'lucide-react';

export type BadgeRarity = 'mythic' | 'legendary' | 'epic' | 'rare' | 'special';

export interface HonorBadge {
  id: string;
  name: string;
  nameEnglish?: string;
  emoji: string;
  rarity: BadgeRarity;
  rarityLabel: string;
  rarityColor: string;
  rarityBadgeBg: string;
  stars: number;
  description: string;
  earnedCondition: string;
  isEarned: boolean;
  earnedDateLabel?: string;
  level?: number;
  glowColor: string;
  sparkleType: string;
}

interface HonorCornerProps {
  user: UserState;
  onOpenProfile?: () => void;
  onSelectLevel?: (level: LevelData) => void;
}

export const HonorCorner: React.FC<HonorCornerProps> = ({
  user,
  onOpenProfile,
  onSelectLevel
}) => {
  const [selectedBadge, setSelectedBadge] = useState<HonorBadge | null>(null);
  const [activeTab, setActiveTab] = useState<'rarest' | 'all'>('rarest');
  const [isCelebrated, setIsCelebrated] = useState(false);

  // Define All possible badges in the system with their rarity
  const allBadges: HonorBadge[] = React.useMemo(() => {
    const list: HonorBadge[] = [];

    // 1. Starter Badge
    list.push({
      id: 'badge_starter',
      name: 'Hạt Giống Tri Thức',
      nameEnglish: 'Seed of Wisdom',
      emoji: '🌱',
      rarity: 'special',
      rarityLabel: 'Đặc Biệt',
      rarityColor: 'text-emerald-700 border-emerald-300 bg-emerald-100',
      rarityBadgeBg: 'from-emerald-400 to-teal-500',
      stars: 1,
      description: 'Bước chân đầu tiên khám phá vương quốc tiếng Anh kỳ diệu!',
      earnedCondition: 'Bắt đầu hành trình tại behocvui',
      isEarned: user.badges.includes('badge_starter') || true,
      glowColor: 'shadow-emerald-300',
      sparkleType: '✨'
    });

    // 2. Milestone / Achievement Badges
    const hasStreak3 = user.streakDays >= 3;
    list.push({
      id: 'badge_streak_3',
      name: 'Chiến Binh Chăm Chỉ',
      nameEnglish: 'Daily Habit Hero',
      emoji: '⚡',
      rarity: 'rare',
      rarityLabel: 'Hiếm',
      rarityColor: 'text-cyan-800 border-cyan-300 bg-cyan-100',
      rarityBadgeBg: 'from-blue-500 to-cyan-500',
      stars: 2,
      description: 'Học tập liên tục không ngừng nghỉ 3 ngày liên tiếp!',
      earnedCondition: 'Chuỗi học tập từ 3 ngày trở lên',
      isEarned: hasStreak3 || user.badges.includes('badge_streak_3'),
      glowColor: 'shadow-cyan-400',
      sparkleType: '⚡'
    });

    const hasStreak7 = user.streakDays >= 7;
    list.push({
      id: 'badge_streak_7',
      name: 'Chiến Binh Kiên Trì',
      nameEnglish: 'Persistent Champion',
      emoji: '🦁',
      rarity: 'legendary',
      rarityLabel: 'Huyền Thoại',
      rarityColor: 'text-amber-800 border-amber-400 bg-amber-100',
      rarityBadgeBg: 'from-amber-400 to-orange-500',
      stars: 4,
      description: 'Bản lĩnh phi thường khi giữ vững chuỗi 7 ngày học tập!',
      earnedCondition: 'Chuỗi học tập từ 7 ngày trở lên',
      isEarned: hasStreak7 || user.badges.includes('badge_streak_7'),
      glowColor: 'shadow-amber-400',
      sparkleType: '🌟'
    });

    list.push({
      id: 'badge_monthly_master',
      name: 'Bậc Thầy Chăm Chỉ Tháng',
      nameEnglish: 'Monthly Milestone Master',
      emoji: '🌟',
      rarity: 'legendary',
      rarityLabel: 'Huyền Thoại',
      rarityColor: 'text-amber-800 border-amber-400 bg-amber-100',
      rarityBadgeBg: 'from-amber-400 to-yellow-500',
      stars: 4,
      description: 'Đạt thành tích nổi bật và hoàn thành cột mốc tháng xuất sắc!',
      earnedCondition: 'Đạt cột mốc tháng loại A/A+',
      isEarned: user.badges.includes('badge_monthly_master') || user.level >= 2,
      glowColor: 'shadow-yellow-400',
      sparkleType: '💫'
    });

    const hasWordsMaster = user.completedWords.length >= 10 || user.level >= 3;
    list.push({
      id: 'badge_words_master',
      name: 'Kho Tàng Từ Vựng',
      nameEnglish: 'Vocabulary Treasury',
      emoji: '📚',
      rarity: 'epic',
      rarityLabel: 'Sử Thi',
      rarityColor: 'text-purple-800 border-purple-300 bg-purple-100',
      rarityBadgeBg: 'from-purple-500 to-indigo-500',
      stars: 3,
      description: 'Làm chủ và phát âm chuẩn xác hơn 10 từ vựng phong phú!',
      earnedCondition: 'Thu thập từ 10 từ vựng đã nhớ',
      isEarned: hasWordsMaster || user.badges.includes('badge_words_master'),
      glowColor: 'shadow-purple-400',
      sparkleType: '✨'
    });

    const hasRivalDefeat = (user.defeatedRivals && user.defeatedRivals.length > 0);
    list.push({
      id: 'badge_rival_victor',
      name: 'Nhà Vô Địch Thách Đấu',
      nameEnglish: 'Challenge Conqueror',
      emoji: '🏆',
      rarity: 'legendary',
      rarityLabel: 'Huyền Thoại',
      rarityColor: 'text-amber-900 border-yellow-400 bg-amber-100',
      rarityBadgeBg: 'from-amber-500 to-yellow-600',
      stars: 4,
      description: 'Chiến thắng bạn bè trên bảng thi đua trí tuệ!',
      earnedCondition: 'Chiến thắng 1 đối thủ trong bảng xếp hạng',
      isEarned: hasRivalDefeat || user.badges.includes('badge_rival_victor'),
      glowColor: 'shadow-yellow-500',
      sparkleType: '👑'
    });

    // 3. Level Badges from curriculum
    LEVELS.forEach((lvl) => {
      let rarity: BadgeRarity = 'special';
      let rarityLabel = 'Đặc Biệt';
      let rarityColor = 'text-emerald-700 border-emerald-300 bg-emerald-100';
      let rarityBadgeBg = 'from-emerald-400 to-teal-500';
      let stars = 1;
      let glowColor = 'shadow-emerald-300';
      let sparkleType = '✨';

      if (lvl.level === 100) {
        rarity = 'mythic';
        rarityLabel = 'Thần Thoại';
        rarityColor = 'text-rose-700 border-pink-400 bg-rose-100 animate-pulse';
        rarityBadgeBg = 'from-rose-500 via-purple-600 to-amber-400';
        stars = 5;
        glowColor = 'shadow-pink-500';
        sparkleType = '👑';
      } else if (lvl.level >= 75) {
        rarity = 'legendary';
        rarityLabel = 'Huyền Thoại';
        rarityColor = 'text-amber-800 border-amber-400 bg-amber-100';
        rarityBadgeBg = 'from-amber-400 to-orange-500';
        stars = 4;
        glowColor = 'shadow-amber-400';
        sparkleType = '🌟';
      } else if (lvl.level >= 40) {
        rarity = 'epic';
        rarityLabel = 'Sử Thi';
        rarityColor = 'text-purple-800 border-purple-300 bg-purple-100';
        rarityBadgeBg = 'from-purple-500 to-indigo-500';
        stars = 3;
        glowColor = 'shadow-purple-400';
        sparkleType = '💫';
      } else if (lvl.level >= 10) {
        rarity = 'rare';
        rarityLabel = 'Hiếm';
        rarityColor = 'text-blue-800 border-blue-300 bg-blue-100';
        rarityBadgeBg = 'from-blue-400 to-cyan-500';
        stars = 2;
        glowColor = 'shadow-blue-400';
        sparkleType = '💎';
      } else {
        rarity = 'special';
        rarityLabel = 'Đặc Biệt';
        rarityColor = 'text-emerald-700 border-emerald-300 bg-emerald-100';
        rarityBadgeBg = 'from-emerald-400 to-teal-500';
        stars = 1;
        glowColor = 'shadow-emerald-300';
        sparkleType = '✨';
      }

      const isEarned = user.badges.includes(lvl.badgeReward.id) || 
                       user.level > lvl.level || 
                       (user.levelStars && user.levelStars[lvl.level] > 0);

      list.push({
        id: lvl.badgeReward.id,
        name: lvl.badgeReward.name,
        nameEnglish: lvl.title,
        emoji: lvl.badgeReward.emoji,
        rarity,
        rarityLabel,
        rarityColor,
        rarityBadgeBg,
        stars,
        description: lvl.badgeReward.description,
        earnedCondition: `Hoàn thành xuất sắc bài học Cấp độ ${lvl.level}`,
        isEarned,
        level: lvl.level,
        glowColor,
        sparkleType
      });
    });

    return list;
  }, [user]);

  // Rarity priority order (mythic > legendary > epic > rare > special)
  const rarityPriority: Record<BadgeRarity, number> = {
    mythic: 5,
    legendary: 4,
    epic: 3,
    rare: 2,
    special: 1
  };

  // Badges that the child has actually earned
  const earnedBadges = React.useMemo(() => {
    return allBadges
      .filter((b) => b.isEarned)
      .sort((a, b) => {
        const diffRarity = rarityPriority[b.rarity] - rarityPriority[a.rarity];
        if (diffRarity !== 0) return diffRarity;
        return (b.level || 0) - (a.level || 0);
      });
  }, [allBadges]);

  // Top rarest badges to showcase (up to 4 badges)
  const rarestBadges = React.useMemo(() => {
    return earnedBadges.slice(0, 4);
  }, [earnedBadges]);

  // Next prestigious badge to unlock (motivation)
  const nextTargetBadge = React.useMemo(() => {
    return allBadges.find((b) => !b.isEarned && (b.rarity === 'legendary' || b.rarity === 'epic' || b.rarity === 'rare' || (b.level && b.level === user.level)));
  }, [allBadges, user.level]);

  // Handle celebration sparkle burst
  const handleGrandCelebration = () => {
    sound.playStar();
    triggerCenterExplosion();
    triggerGoldenShower();
    setIsCelebrated(true);
    setTimeout(() => setIsCelebrated(false), 2500);
  };

  // Open detail popover with sparkle sound
  const handleBadgeClick = (badge: HonorBadge) => {
    sound.playStar();
    if (badge.nameEnglish) {
      speakEnglish(badge.nameEnglish);
    }
    setSelectedBadge(badge);
  };

  return (
    <section 
      id="honor-corner"
      aria-label="Góc vinh danh huy hiệu" 
      className="relative bg-gradient-to-br from-amber-50 via-orange-50/60 to-purple-50/80 rounded-3xl p-5 sm:p-7 border-4 border-amber-300 shadow-xl mb-8 overflow-hidden"
    >
      {/* Decorative Sparkling Background Elements */}
      <div className="absolute top-2 right-4 text-amber-300 opacity-60 text-2xl animate-sparkle pointer-events-none">✨</div>
      <div className="absolute top-1/2 left-3 text-yellow-400 opacity-70 text-xl animate-sparkle-fast pointer-events-none">⭐</div>
      <div className="absolute -bottom-6 -right-6 w-52 h-52 bg-gradient-to-tr from-amber-300/30 to-purple-300/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -top-6 -left-6 w-52 h-52 bg-gradient-to-br from-yellow-300/30 to-rose-300/20 rounded-full blur-2xl pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-amber-200">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 flex items-center justify-center text-white shadow-md shadow-amber-300/50 shrink-0">
            <Trophy className="w-7 h-7 text-yellow-100 fill-amber-200" />
            <span className="absolute -top-1.5 -right-1.5 text-xs animate-bounce">👑</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>Góc Vinh Danh</span>
                <span className="inline-block text-amber-500 animate-sparkle">✨</span>
              </h3>
              <span className="text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                Bộ Sưu Tập Quý Hiếm
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-0.5">
              Nơi tỏa sáng các huy hiệu quý giá nhất mà bé <span className="text-amber-800 font-black">{user.nickname}</span> đã đạt được!
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Badge Counter */}
          <div className="bg-white/90 backdrop-blur-xs border-2 border-amber-200 px-3 py-1.5 rounded-2xl flex items-center gap-2 shadow-2xs">
            <Award className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-black text-slate-800">
              Đã đạt: <span className="text-amber-600 font-black text-sm">{earnedBadges.length}</span> huy hiệu
            </span>
          </div>

          {/* Celebration Sparkles Button */}
          <button
            onClick={handleGrandCelebration}
            onMouseEnter={() => sound.playHoverPop()}
            className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs px-3.5 py-2 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 hover:scale-105"
            title="Bắn pháo hoa ăn mừng thành tích!"
          >
            <Sparkles className="w-4 h-4 text-yellow-100" />
            <span className="hidden sm:inline">Ăn Mừng</span>
            <span>🎉</span>
          </button>
        </div>
      </div>

      {/* Tabs / Filter Bar */}
      <div className="relative z-10 flex items-center justify-between gap-3 mt-4 mb-5">
        <div className="flex items-center gap-2 bg-white/70 backdrop-blur-xs p-1 rounded-2xl border border-amber-200 shadow-2xs">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('rarest');
            }}
            onMouseEnter={() => sound.playHoverPop()}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'rarest'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-amber-100/60'
            }`}
          >
            <span>✨ Quý Hiếm Nhất ({rarestBadges.length})</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('all');
            }}
            onMouseEnter={() => sound.playHoverPop()}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-amber-100/60'
            }`}
          >
            <span>Tất Cả Huy Hiệu ({earnedBadges.length})</span>
          </button>
        </div>

        {/* Legend Rarity Guide */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] font-bold text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Thần Thoại
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Huyền Thoại
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span> Sử Thi
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Hiếm
          </span>
        </div>
      </div>

      {/* Rarest Badges Podium Showcase View */}
      {activeTab === 'rarest' ? (
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rarestBadges.map((badge, index) => {
            const isHighest = index === 0;
            return (
              <div
                key={badge.id}
                onClick={() => handleBadgeClick(badge)}
                onMouseEnter={() => sound.playHoverPop()}
                className={`group relative bg-white/95 rounded-2xl p-4 border-2 transition-all duration-300 cursor-pointer hover:-translate-y-1.5 hover:shadow-xl flex flex-col justify-between shimmer-mask ${
                  isHighest
                    ? 'border-amber-400 ring-2 ring-amber-300 shadow-md shadow-amber-200/50 bg-gradient-to-b from-amber-50/50 to-white'
                    : 'border-slate-200 hover:border-amber-300 shadow-sm'
                }`}
              >
                {/* Floating sparkle badge indicator */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                  <span className="text-xs group-hover:scale-125 transition-transform animate-sparkle">
                    {badge.sparkleType}
                  </span>
                </div>

                {/* Badge Crown for rank 1 */}
                {isHighest && (
                  <div className="absolute -top-3 left-4 bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-2xs border border-white flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-900 fill-amber-700" />
                    <span>Huy Hiệu Đỉnh Nhất</span>
                  </div>
                )}

                {/* Badge Main Body */}
                <div className="flex flex-col items-center text-center mt-1">
                  {/* Glowing Badge Emblem with Rotating Aura */}
                  <div className="relative my-2">
                    {/* Rotating Aura Halo for top badges */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-300/40 via-yellow-200/50 to-rose-300/40 blur-md group-hover:blur-lg animate-pulse-glow" />
                    
                    <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-300 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform duration-300 animate-badge-float">
                      <span>{badge.emoji}</span>
                      
                      {/* Little star glints */}
                      <span className="absolute -top-1 -right-1 text-xs animate-sparkle-fast">✨</span>
                      <span className="absolute -bottom-1 -left-1 text-[10px] animate-sparkle">💫</span>
                    </div>
                  </div>

                  {/* Rarity Pill */}
                  <div className={`mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${badge.rarityColor}`}>
                    {badge.rarityLabel}
                  </div>

                  {/* Badge Title */}
                  <h4 className="text-sm font-black text-slate-900 mt-2 group-hover:text-amber-700 transition-colors line-clamp-1">
                    {badge.name}
                  </h4>

                  {/* Stars Rating */}
                  <div className="flex items-center justify-center gap-0.5 my-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < badge.stars
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200 fill-slate-200'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Short Description */}
                  <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-snug font-medium">
                    {badge.description}
                  </p>
                </div>

                {/* Card Footer Tap Prompt */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-bold group-hover:text-amber-800">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Nhấn xem chi tiết</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* All Earned Badges Grid View */
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[380px] overflow-y-auto pr-1">
          {earnedBadges.map((badge) => (
            <div
              key={badge.id}
              onClick={() => handleBadgeClick(badge)}
              onMouseEnter={() => sound.playHoverPop()}
              className="group bg-white/90 hover:bg-white rounded-2xl p-3 border-2 border-slate-200 hover:border-amber-300 transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer flex flex-col items-center text-center relative shimmer-mask"
            >
              <div className="relative w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                <span>{badge.emoji}</span>
              </div>
              <div className={`mt-1.5 text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md ${badge.rarityColor}`}>
                {badge.rarityLabel}
              </div>
              <div className="text-xs font-black text-slate-800 mt-1 truncate w-full group-hover:text-amber-600">
                {badge.name}
              </div>
              <div className="text-[10px] text-slate-500 truncate w-full">
                {badge.level ? `Cấp độ ${badge.level}` : 'Thành tích'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Motivational Next Target Banner */}
      {nextTargetBadge && (
        <div className="relative z-10 mt-5 bg-gradient-to-r from-amber-100/90 via-orange-100/90 to-yellow-100/90 rounded-2xl p-3.5 sm:p-4 border-2 border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-amber-300 flex items-center justify-center text-2xl shadow-2xs shrink-0 animate-bounce">
              {nextTargetBadge.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-900">
                  🎯 Huy hiệu quý hiếm tiếp theo chờ bé:
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${nextTargetBadge.rarityColor}`}>
                  {nextTargetBadge.rarityLabel}
                </span>
              </div>
              <p className="text-xs text-slate-700 font-semibold mt-0.5">
                <span className="font-bold text-slate-900">"{nextTargetBadge.name}"</span> — {nextTargetBadge.earnedCondition}
              </p>
            </div>
          </div>

          {nextTargetBadge.level && onSelectLevel && (
            <button
              onClick={() => {
                sound.playStar();
                const targetLvl = LEVELS.find((l) => l.level === nextTargetBadge.level);
                if (targetLvl) {
                  onSelectLevel(targetLvl);
                }
              }}
              onMouseEnter={() => sound.playHoverPop()}
              className="bg-amber-500 hover:bg-amber-600 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-1.5 hover:scale-105 shrink-0"
            >
              <span>Chinh Phục Ngay 🚀</span>
            </button>
          )}
        </div>
      )}

      {/* Interactive Badge Detail Modal */}
      {selectedBadge && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-sm w-full p-6 text-center border-4 border-amber-300 shadow-2xl relative overflow-hidden animate-scale-up"
          >
            {/* Background radiant beams */}
            <div className="absolute inset-0 bg-gradient-to-b from-amber-100/60 to-transparent pointer-events-none" />
            <div className="absolute top-3 left-4 text-amber-400 text-xl animate-sparkle">✨</div>
            <div className="absolute top-6 right-5 text-yellow-500 text-xl animate-sparkle-fast">🌟</div>

            {/* Close button */}
            <button
              onClick={() => {
                sound.playClick();
                setSelectedBadge(null);
              }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-sm cursor-pointer z-10 transition-transform active:scale-90"
              aria-label="Đóng bảng chi tiết huy hiệu"
            >
              ✕
            </button>

            {/* Grand Badge Emblem in Modal */}
            <div className="relative my-4 flex justify-center">
              <div className="absolute w-32 h-32 rounded-full bg-gradient-to-tr from-amber-300/40 via-yellow-200/60 to-rose-300/40 blur-xl animate-pulse-glow" />
              <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 border-4 border-amber-400 flex items-center justify-center text-6xl shadow-xl animate-badge-float">
                <span>{selectedBadge.emoji}</span>
                <span className="absolute -top-2 -right-2 text-xl animate-sparkle">✨</span>
              </div>
            </div>

            {/* Rarity Tag */}
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-2xs mb-2 ${selectedBadge.rarityColor}`}>
              Huy Hiệu {selectedBadge.rarityLabel}
            </div>

            {/* Title & Stars */}
            <h3 className="text-xl font-black text-slate-900 mt-1">
              {selectedBadge.name}
            </h3>

            {/* Pronounce English Title */}
            {selectedBadge.nameEnglish && (
              <button
                onClick={() => speakEnglish(selectedBadge.nameEnglish!)}
                className="mt-1 inline-flex items-center gap-1.5 text-xs text-amber-700 font-bold bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200 cursor-pointer active:scale-95 transition-all"
                title="Nghe phát âm tiếng Anh"
              >
                <span>🔊 "{selectedBadge.nameEnglish}"</span>
              </button>
            )}

            <div className="flex items-center justify-center gap-1 my-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < selectedBadge.stars
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-200 fill-slate-200'
                  }`}
                />
              ))}
            </div>

            {/* Description & Achievement condition */}
            <p className="text-sm text-slate-700 font-medium px-2 mt-2 leading-relaxed">
              {selectedBadge.description}
            </p>

            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 my-4 text-xs text-slate-700 text-left">
              <div className="font-black text-amber-900 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Điều kiện đạt được:</span>
              </div>
              <p className="font-semibold">{selectedBadge.earnedCondition}</p>
            </div>

            {/* Cheer Sound Action */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playStar();
                  triggerGoldenShower();
                }}
                className="flex-1 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs py-3 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 hover:scale-102"
              >
                <Sparkles className="w-4 h-4" />
                <span>Tung Hoa Chúc Mừng 🎊</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
