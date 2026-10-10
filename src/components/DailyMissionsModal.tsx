import React from 'react';
import { UserState, DailyMission } from '../types';
import { sound } from '../utils/audio';
import { triggerFireworks, triggerCenterExplosion } from '../utils/celebration';
import confetti from 'canvas-confetti';
import { 
  X, 
  Target, 
  CheckCircle2, 
  Gift, 
  Sparkles, 
  ChevronRight, 
  Award, 
  Flame 
} from 'lucide-react';

interface DailyMissionsModalProps {
  user: UserState;
  onClaimMission: (missionId: string) => void;
  onClaimDailyChest: () => void;
  onGoToActivity: (type: DailyMission['type']) => void;
  onClose: () => void;
}

export const DailyMissionsModal: React.FC<DailyMissionsModalProps> = ({
  user,
  onClaimMission,
  onClaimDailyChest,
  onGoToActivity,
  onClose
}) => {
  const missions = user.dailyMissions || [];
  const completedMissionsCount = missions.filter((m) => m.current >= m.target).length;
  const allMissionsFinished = missions.length > 0 && completedMissionsCount === missions.length;
  const canClaimGrandChest = allMissionsFinished && !user.dailyChestClaimed;

  const handleClaim = (mission: DailyMission) => {
    sound.playCoin();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
    onClaimMission(mission.id);
  };

  const handleGrandChest = () => {
    sound.playLevelUp();
    triggerFireworks();
    triggerCenterExplosion();
    onClaimDailyChest();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl border-4 border-amber-400 shadow-2xl max-w-xl w-full p-4 sm:p-6 relative max-h-[92vh] flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-100 pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-rose-400 flex items-center justify-center text-white text-2xl shadow-md">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                  Thử Thách Mỗi Ngày
                </h2>
                <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  Mới mỗi ngày
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold">
                Hoàn thành nhiệm vụ nhỏ để rinh thêm Sao Vàng & Kim Cương!
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

        {/* Progress summary banner */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-2xl p-4 text-white mb-4 shadow-md flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-100">
              Tiến Độ Hôm Nay:
            </div>
            <div className="text-xl sm:text-2xl font-black">
              {completedMissionsCount} / {missions.length} Nhiệm vụ hoàn thành
            </div>
            <div className="text-xs text-white/90 font-medium mt-0.5">
              Chuỗi học liên tục: <span className="font-extrabold text-amber-200">🔥 {user.streakDays} ngày</span>
            </div>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-3xl shrink-0">
            {allMissionsFinished ? '🏆' : '🎯'}
          </div>
        </div>

        {/* Missions list */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4">
          {missions.map((mission) => {
            const isCompleted = mission.current >= mission.target;
            const progressPercent = Math.min(100, Math.round((mission.current / mission.target) * 100));

            return (
              <div
                key={mission.id}
                className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  mission.claimed
                    ? 'bg-slate-50 border-slate-200 opacity-70'
                    : isCompleted
                    ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-300 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-amber-300 shadow-2xs'
                }`}
              >
                {/* Icon & Mission Info */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-100 to-orange-100 border border-amber-200 flex items-center justify-center text-2xl shrink-0">
                    {mission.icon}
                  </div>
                  <div>
                    <div className="font-black text-sm text-slate-800 flex items-center gap-2">
                      <span>{mission.title}</span>
                      {mission.claimed && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-md">
                          ✓ Hoàn tất
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {mission.description}
                    </div>

                    {/* Rewards chips */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[11px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-lg">
                        ⭐ +{mission.coinReward} Sao Vàng
                      </span>
                      {mission.gemReward > 0 && (
                        <span className="text-[11px] font-extrabold text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded-lg">
                          💎 +{mission.gemReward} Kim Cương
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 min-w-[130px]">
                  {/* Mini Progress */}
                  <div className="text-right flex-1 sm:flex-initial">
                    <div className="text-xs font-black text-slate-700">
                      {mission.current} / {mission.target}
                    </div>
                    <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Button */}
                  {mission.claimed ? (
                    <div className="text-xs font-bold text-slate-400 bg-slate-200 px-3 py-1.5 rounded-xl">
                      Đã Nhận
                    </div>
                  ) : isCompleted ? (
                    <button
                      onClick={() => handleClaim(mission)}
                      onMouseEnter={() => sound.playHoverPop()}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-md transition-all active:scale-95 animate-bounce cursor-pointer whitespace-nowrap hover:scale-105"
                    >
                      Nhận Quà 🎁
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        sound.playClick();
                        onGoToActivity(mission.type);
                        onClose();
                      }}
                      onMouseEnter={() => sound.playHoverPop()}
                      className="bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-200 transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap hover:scale-105"
                    >
                      <span>Làm ngay</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Grand Daily Chest */}
        <div className={`p-4 rounded-3xl border-2 transition-all flex items-center justify-between gap-3 ${
          user.dailyChestClaimed
            ? 'bg-emerald-50 border-emerald-300'
            : canClaimGrandChest
            ? 'bg-gradient-to-r from-amber-100 via-orange-100 to-rose-100 border-amber-400 ring-4 ring-amber-200 animate-pulse'
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="text-4xl animate-float">
              {user.dailyChestClaimed ? '✨' : '🎁'}
            </div>
            <div>
              <div className="font-black text-sm text-slate-800 flex items-center gap-1.5">
                <span>Rương Thần Kỳ Hàng Ngày</span>
                {allMissionsFinished && !user.dailyChestClaimed && (
                  <span className="text-[10px] bg-rose-500 text-white font-extrabold px-1.5 py-0.5 rounded-full">
                    Mở Được!
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-600 font-medium">
                {user.dailyChestClaimed
                  ? 'Bé đã nhận rương thần kỳ hôm nay! Hãy quay lại vào ngày mai nhé.'
                  : canClaimGrandChest
                  ? 'Tuyệt vời! Bé đã làm xong toàn bộ thử thách, bấm để mở rương siêu quà!'
                  : 'Hoàn thành tất cả 4 thử thách hôm nay để mở rương thưởng lớn (+80 Xu & +2 Huy Hiệu)'}
              </div>
            </div>
          </div>

          <div>
            {user.dailyChestClaimed ? (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl whitespace-nowrap">
                ✓ Đã Mở
              </span>
            ) : canClaimGrandChest ? (
              <button
                onClick={handleGrandChest}
                onMouseEnter={() => sound.playHoverPop()}
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-xs px-4 py-2.5 rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer whitespace-nowrap hover:scale-105"
              >
                Mở Rương 🔓
              </button>
            ) : (
              <span className="text-xs font-bold text-slate-400 bg-slate-200 px-3 py-1.5 rounded-xl whitespace-nowrap">
                Chưa Mở
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
