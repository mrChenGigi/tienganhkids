import React from 'react';
import { UserState, LeaderboardUser } from '../types';
import { getWeeklyLeaderboard } from '../utils/storage';
import { sound } from '../utils/audio';
import { Trophy, Medal, Sparkles, X, Clock, Flame, Swords, Check } from 'lucide-react';

interface LeaderboardModalProps {
  user: UserState;
  onStartChallenge?: (rival: LeaderboardUser) => void;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ 
  user, 
  onStartChallenge,
  onClose 
}) => {
  const leaderboard = getWeeklyLeaderboard(user);
  const currentUserRank = leaderboard.find((item) => item.isCurrentUser)?.rank || 1;

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span className="text-2xl">🥇</span>;
    if (rank === 2) return <span className="text-2xl">🥈</span>;
    if (rank === 3) return <span className="text-2xl">🥉</span>;
    return (
      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center">
        #{rank}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl border-4 border-amber-400 shadow-2xl max-w-xl w-full p-4 sm:p-6 relative max-h-[92vh] flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-100 pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-white text-2xl shadow-md">
              <Trophy className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                Bảng Xếp Hạng Hàng Tuần
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mt-0.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Tổng kết sau 3 ngày 14 giờ</span>
              </div>
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

        {/* Current User Rank Pill */}
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-2xl p-3.5 mb-4 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl">
              🦁
            </div>
            <div>
              <div className="text-xs text-amber-100 font-bold uppercase">Hạng hiện tại của bé:</div>
              <div className="text-lg font-black">{user.nickname}</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black">Hạng #{currentUserRank}</div>
            <div className="text-xs font-bold text-amber-100">{user.totalXp} Điểm Tuần</div>
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-3">
          {leaderboard.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                item.isCurrentUser
                  ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300/60 shadow-sm'
                  : 'bg-white border-slate-100 hover:border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 flex justify-center shrink-0">{getRankBadge(item.rank)}</div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-2xl shrink-0">
                  {item.mascotEmoji}
                </div>
                <div>
                  <div className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                    <span>{item.nickname}</span>
                    <span className="text-xs">{item.badgeEmoji}</span>
                    {item.isDefeated && (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-md">
                        ✓ Đã vượt qua
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 font-semibold">
                    Cấp độ {item.level} • {item.points} XP
                  </div>
                  {item.statusQuote && !item.isCurrentUser && (
                    <div className="text-[10px] text-slate-500 italic mt-0.5 line-clamp-1">
                      "{item.statusQuote}"
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-left sm:text-right">
                  <div className="text-xs sm:text-sm font-black text-amber-600">
                    {item.points} XP
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold">
                    ▲ Phong độ cao
                  </div>
                </div>

                {!item.isCurrentUser && onStartChallenge && (
                  <button
                    onClick={() => {
                      sound.playStar();
                      onStartChallenge(item);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                      item.isDefeated
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
                        : 'bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-xs'
                    }`}
                  >
                    <Swords className="w-3.5 h-3.5" />
                    <span>{item.isDefeated ? 'Đấu Lại' : 'Thách Đấu ⚔️'}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Encouraging Footer */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
          <p className="text-xs text-amber-900 font-bold">
            🌟 Top 3 bé xuất sắc nhất tuần sẽ nhận được 100 Sao Vàng và Huy Hiệu Quán Quân!
          </p>
        </div>

      </div>
    </div>
  );
};
