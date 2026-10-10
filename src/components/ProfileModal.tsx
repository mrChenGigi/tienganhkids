import React, { useState } from 'react';
import { UserState } from '../types';
import { MASCOTS, NICKNAME_PRESETS, LEVELS } from '../data/curriculum';
import { sound } from '../utils/audio';
import { X, UserCheck, Award, Sparkles, Check } from 'lucide-react';

interface ProfileModalProps {
  user: UserState;
  onUpdateProfile: (nickname: string, mascotId: string) => void;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  user,
  onUpdateProfile,
  onClose
}) => {
  const [selectedNickname, setSelectedNickname] = useState(user.nickname);
  const [selectedMascotId, setSelectedMascotId] = useState(user.mascotId);
  const [customName, setCustomName] = useState('');

  const handleSave = () => {
    sound.playSuccess();
    const finalName = customName.trim() || selectedNickname;
    onUpdateProfile(finalName, selectedMascotId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl border-4 border-amber-300 shadow-2xl max-w-xl w-full p-4 sm:p-6 relative max-h-[92vh] flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-100 pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl shadow-md">
              <Sparkles className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                Hồ Sơ & Biệt Hiệu Bé Yêu
              </h2>
              <p className="text-xs text-slate-500 font-semibold">
                Chọn người bạn đồng hành và đặt biệt hiệu thật ngầu!
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          
          {/* 1. Pick Mascot */}
          <div>
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
              1. Chọn Linh Vật Đồng Hành
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {MASCOTS.map((m) => {
                const isSelected = selectedMascotId === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedMascotId(m.id);
                    }}
                    className={`p-3 rounded-2xl border-2 text-center cursor-pointer transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-300 shadow-md scale-102'
                        : 'border-slate-200 hover:border-amber-300 bg-white shadow-2xs'
                    }`}
                  >
                    <div className="text-4xl mb-1 filter drop-shadow">{m.emoji}</div>
                    <div className="font-black text-xs text-slate-800">{m.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{m.title}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Choose or Type Nickname */}
          <div>
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
              2. Đăng Ký Biệt Hiệu Cho Bé
            </label>

            {/* Custom input */}
            <div className="mb-3">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Hoặc tự gõ biệt danh riêng của bé..."
                maxLength={25}
                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-amber-400 focus:bg-white focus:outline-hidden py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-bold text-slate-800"
              />
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5">
              {NICKNAME_PRESETS.map((nick) => {
                const isSelected = !customName && selectedNickname === nick;
                return (
                  <button
                    key={nick}
                    onClick={() => {
                      sound.playClick();
                      setCustomName('');
                      setSelectedNickname(nick);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {nick}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Badges Collection */}
          <div>
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
              3. Bộ Sưu Tập Huy Hiệu Đạt Được ({user.badges.length})
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {LEVELS.map((lvl) => {
                const isEarned = user.badges.includes(lvl.badgeReward.id) || user.level > lvl.level;
                return (
                  <div
                    key={lvl.badgeReward.id}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      isEarned
                        ? 'bg-amber-50 border-amber-300'
                        : 'bg-slate-50 border-slate-200 opacity-50'
                    }`}
                  >
                    <span className="text-2xl">{lvl.badgeReward.emoji}</span>
                    <div className="overflow-hidden">
                      <div className="text-xs font-black text-slate-800 truncate">
                        {lvl.badgeReward.name}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        Cấp độ {lvl.level}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Lưu Hồ Sơ ✨
          </button>
        </div>

      </div>
    </div>
  );
};
