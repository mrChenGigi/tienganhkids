import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { Clock, ShieldCheck, Heart } from 'lucide-react';

interface TimeLimitAlertProps {
  onDismiss: () => void;
  onOpenParent: () => void;
}

export const TimeLimitAlert: React.FC<TimeLimitAlertProps> = ({ onDismiss, onOpenParent }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border-4 border-amber-400 p-6 sm:p-8 text-center max-w-md w-full shadow-2xl animate-float">
        <div className="text-6xl mb-3">🧘‍♂️</div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full mb-2">
          <Clock className="w-4 h-4" />
          <span>Đến giờ nghỉ ngơi rồi!</span>
        </div>
        <h3 className="text-2xl font-black text-slate-800">
          Bé Ơi, Cùng Vươn Vai Nào!
        </h3>
        <p className="text-sm text-slate-600 mt-2 font-medium">
          Hôm nay bé đã học rất chăm chỉ và đạt nhiều điểm cao! Để đôi mắt sáng khỏe, bé hãy tạm gác máy, uống một ngụm nước ấm và chạy nhảy cùng ba mẹ nhé! 💖
        </p>

        <div className="my-5 p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 font-bold">
          "Đôi mắt sáng tinh anh - Học nhanh nhớ lâu!" ✨
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => {
              sound.playClick();
              onDismiss();
            }}
            className="flex-1 bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold py-3 rounded-2xl shadow-md cursor-pointer transition-all active:scale-95"
          >
            Bé Sẽ Nghỉ Ngơi Ngay! 🌟
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onOpenParent();
            }}
            className="flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-2xl text-xs cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Phụ Huynh</span>
          </button>
        </div>
      </div>
    </div>
  );
};
