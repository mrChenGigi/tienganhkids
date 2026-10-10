import React, { useEffect } from 'react';
import { MascotDisplay } from './MascotDisplay';
import { EquippedItems } from '../types';
import { triggerFireworks, triggerCenterExplosion, triggerGoldenShower } from '../utils/celebration';
import { sound } from '../utils/audio';
import { Trophy, Sparkles, Award, Star, ArrowRight } from 'lucide-react';

interface LevelUpCelebrationModalProps {
  newLevel: number;
  mascotId: string;
  equipped: EquippedItems;
  nickname: string;
  coinReward: number;
  badgeEmoji: string;
  badgeName: string;
  onClose: () => void;
}

export const LevelUpCelebrationModal: React.FC<LevelUpCelebrationModalProps> = ({
  newLevel,
  mascotId,
  equipped,
  nickname,
  coinReward,
  badgeEmoji,
  badgeName,
  onClose
}) => {
  useEffect(() => {
    // Fire festive fireworks barrage immediately
    triggerFireworks();
    triggerCenterExplosion();

    // After 1 second, fire a golden shower
    const timer = setTimeout(() => {
      triggerGoldenShower();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-gradient-to-b from-amber-400 via-orange-400 to-rose-500 rounded-3xl p-1 shadow-2xl max-w-md w-full animate-bounce duration-1000">
        <div className="bg-white rounded-[22px] p-6 text-center relative overflow-hidden">
          
          {/* Top celebratory banner */}
          <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 text-xs font-black px-3.5 py-1 rounded-full mb-3 shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-600 fill-amber-500 animate-spin" />
            <span>ĐỘT PHÁ NĂNG LỰC XUẤT SẮC!</span>
            <Sparkles className="w-4 h-4 text-amber-600 fill-amber-500 animate-spin" />
          </div>

          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            LÊN CẤP ĐỘ {newLevel}! 🎉
          </h2>
          <p className="text-xs text-slate-600 font-semibold mt-1">
            Bé <span className="text-orange-600 font-bold">{nickname}</span> đã xuất sắc mở khóa vùng đất tiếp theo!
          </p>

          {/* Cheerful Mascot with Fireworks */}
          <div className="my-5 flex justify-center">
            <MascotDisplay
              mascotId={mascotId}
              equipped={equipped}
              size="lg"
              showSpeechBubble={true}
              speechText={`Yeahhh! Chúc mừng bé đạt Cấp ${newLevel}! Bé siêu đỉnh! 🌟`}
            />
          </div>

          {/* Level Transition Pill */}
          <div className="flex items-center justify-center gap-3 my-4">
            <div className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-2xl text-xs font-black">
              Cấp {newLevel - 1}
            </div>
            <ArrowRight className="w-5 h-5 text-amber-500 animate-pulse" />
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1.5 rounded-2xl text-sm font-black shadow-md animate-bounce">
              Cấp {newLevel} 🚀
            </div>
          </div>

          {/* Rewards box */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3.5 mb-5 text-left">
            <div className="text-xs font-extrabold text-amber-900 mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Phần Thưởng Lên Cấp:</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2 rounded-xl border border-amber-200">
                <span className="text-xl">🪙</span>
                <div className="text-xs font-black text-slate-800">+{coinReward} Xu</div>
              </div>
              <div className="bg-white p-2 rounded-xl border border-amber-200">
                <span className="text-xl">💎</span>
                <div className="text-xs font-black text-slate-800">+1 Huy Hiệu</div>
              </div>
              <div className="bg-white p-2 rounded-xl border border-amber-200">
                <span className="text-xl">{badgeEmoji}</span>
                <div className="text-[10px] font-black text-slate-800 truncate">{badgeName}</div>
              </div>
            </div>
          </div>

          {/* Continue button */}
          <button
            onClick={() => {
              sound.playClick();
              triggerCenterExplosion();
              onClose();
            }}
            className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-sm py-3.5 rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Tiếp Tục Hành Trình Kỳ Thú 🚀</span>
          </button>

        </div>
      </div>
    </div>
  );
};
