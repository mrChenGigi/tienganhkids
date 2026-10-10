import React, { useEffect, useState } from 'react';
import { InAppNotificationEvent } from '../utils/notifications';
import { sound } from '../utils/audio';
import { Bell, X, Sparkles, ChevronRight } from 'lucide-react';

interface NotificationBannerProps {
  onActionClick: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({ onActionClick }) => {
  const [currentNotification, setCurrentNotification] = useState<InAppNotificationEvent | null>(null);

  useEffect(() => {
    const handleNotification = (e: Event) => {
      const customEvent = e as CustomEvent<InAppNotificationEvent>;
      if (customEvent.detail) {
        setCurrentNotification(customEvent.detail);
      }
    };

    window.addEventListener('applet-in-app-notification', handleNotification);

    return () => {
      window.removeEventListener('applet-in-app-notification', handleNotification);
    };
  }, []);

  // Auto-dismiss after 6.5s
  useEffect(() => {
    if (!currentNotification) return;
    const timer = setTimeout(() => {
      setCurrentNotification(null);
    }, 6500);

    return () => clearTimeout(timer);
  }, [currentNotification]);

  if (!currentNotification) return null;

  return (
    <div className="fixed top-18 right-3 sm:right-6 z-50 max-w-sm w-full animate-bounce duration-1000 select-none">
      <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 rounded-3xl p-1 shadow-2xl border-2 border-white">
        <div className="bg-white rounded-[22px] p-3.5 flex items-start gap-3">
          
          {/* Mascot icon */}
          <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-2xl shrink-0 animate-wiggle">
            {currentNotification.icon || '🦁'}
          </div>

          {/* Text content */}
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-1.5 text-[11px] font-black text-amber-700 uppercase tracking-wide">
              <Bell className="w-3.5 h-3.5 fill-amber-500 text-amber-600 animate-pulse" />
              <span>Nhắc Nhở Học Bài Hàng Ngày</span>
            </div>
            <h4 className="font-black text-xs sm:text-sm text-slate-800 line-clamp-1 mt-0.5">
              {currentNotification.title}
            </h4>
            <p className="text-[11px] text-slate-600 font-medium line-clamp-2 mt-0.5 leading-snug">
              {currentNotification.body}
            </p>

            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playStar();
                  setCurrentNotification(null);
                  onActionClick();
                }}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
              >
                <span>Học Ngay Nào</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Close */}
          <button
            onClick={() => setCurrentNotification(null)}
            className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>

        </div>
      </div>
    </div>
  );
};
