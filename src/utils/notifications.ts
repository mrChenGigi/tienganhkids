import { sound } from './audio';

export interface InAppNotificationEvent {
  id: string;
  title: string;
  body: string;
  icon: string;
  timestamp: number;
}

export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) return false;
  try {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  } catch {
    return false;
  }
};

export const getReminderMessage = (
  preset: 'fun' | 'streak' | 'reward',
  nickname: string,
  streakDays: number
): { title: string; body: string } => {
  switch (preset) {
    case 'streak':
      return {
        title: `🔥 Giữ vững chuỗi ${streakDays} ngày của ${nickname}!`,
        body: 'Bé chỉ cần 10 phút hôm nay để giữ vững ngọn lửa chăm chỉ và nhận thêm huy hiệu!'
      };
    case 'reward':
      return {
        title: `🎁 Rương Quà Tặng Đang Đợi ${nickname}!`,
        body: 'Hoàn thành 4 thử thách hôm nay để mở Rương Thần Kỳ và nhận 80 Sao Vàng!'
      };
    case 'fun':
    default:
      return {
        title: `🦁 Bạn Sư Tử Leo đang đợi ${nickname}!`,
        body: 'Đã đến giờ phiêu lưu tiếng Anh cùng behocvui rồi! Cùng khám phá từ vựng mới nào!'
      };
  }
};

export const sendStudyNotification = (
  title: string,
  body: string,
  icon: string = '🦁'
) => {
  // 1. Play cheerful chime
  sound.playStar();

  // 2. Browser Native Notification if supported and granted
  if (isNotificationSupported() && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: 'https://api.iconify.design/noto:lion.svg',
        badge: 'https://api.iconify.design/noto:glowing-star.svg',
        tag: 'songtu-daily-reminder'
      });
    } catch {
      // In some sandboxed iframes or browsers, new Notification may fail silently
    }
  }

  // 3. In-App Notification Toast dispatch (100% reliable fallback & immediate visual feedback)
  if (typeof window !== 'undefined') {
    const detail: InAppNotificationEvent = {
      id: `notif_${Date.now()}`,
      title,
      body,
      icon,
      timestamp: Date.now()
    };
    window.dispatchEvent(new CustomEvent('applet-in-app-notification', { detail }));
  }
};
