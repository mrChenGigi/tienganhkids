import React, { useState, useMemo } from 'react';
import { UserState, ParentSettings, StudyRecord } from '../types';
import { generateSyncCode, restoreFromSyncCode } from '../utils/storage';
import { sound } from '../utils/audio';
import { 
  X, 
  ShieldCheck, 
  BarChart3, 
  Clock, 
  History, 
  Smartphone, 
  Lock, 
  CheckCircle2, 
  Copy, 
  Check, 
  Printer, 
  FileText, 
  AlertCircle,
  Sparkles,
  Award,
  Bell,
  Trophy
} from 'lucide-react';
import { 
  requestNotificationPermission, 
  getNotificationPermission, 
  sendStudyNotification, 
  getReminderMessage 
} from '../utils/notifications';
import { getMonthlyMilestones } from '../utils/milestones';
import { MonthlyMilestoneTable } from './MonthlyMilestoneTable';

interface ParentModalProps {
  user: UserState;
  settings: ParentSettings;
  onUpdateSettings: (newSettings: ParentSettings) => void;
  onRestoreUser: (restored: UserState) => void;
  onClose: () => void;
}

export const ParentModal: React.FC<ParentModalProps> = ({
  user,
  settings,
  onUpdateSettings,
  onRestoreUser,
  onClose
}) => {
  // Parental gate lock
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mathQuestion] = useState({ a: 7, b: 8, answer: 15 });
  const [userMathInput, setUserMathInput] = useState('');
  const [mathError, setMathError] = useState(false);

  // Active tab in Parent Dashboard
  const [activeTab, setActiveTab] = useState<'overview' | 'milestone' | 'report' | 'time' | 'notif' | 'history' | 'sync'>('overview');

  // Calculate monthly milestones
  const monthlyMilestones = useMemo(() => getMonthlyMilestones(user), [user]);

  // Sync code state
  const [syncCode, setSyncCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [inputSyncCode, setInputSyncCode] = useState('');
  const [syncMessage, setSyncMessage] = useState<{ text: string; success: boolean } | null>(null);

  // Time limit form
  const [currentLimit, setCurrentLimit] = useState(settings.screenTimeLimitMinutes);
  const [breakReminders, setBreakReminders] = useState(settings.breakReminders);

  // Push Notifications settings form
  const [pushEnabled, setPushEnabled] = useState(settings.pushNotificationsEnabled ?? true);
  const [reminderTime, setReminderTime] = useState(settings.reminderTime || '19:30');
  const [reminderPreset, setReminderPreset] = useState<'fun' | 'streak' | 'reward'>(settings.reminderPreset || 'fun');
  const [browserPerm, setBrowserPerm] = useState<string>(getNotificationPermission());

  const handleVerifyGate = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(userMathInput, 10) === mathQuestion.answer) {
      sound.playSuccess();
      setIsAuthenticated(true);
      setMathError(false);
      setSyncCode(generateSyncCode(user));
      setBrowserPerm(getNotificationPermission());
    } else {
      sound.playWrong();
      setMathError(true);
    }
  };

  const handleSaveSettings = () => {
    sound.playClick();
    onUpdateSettings({
      ...settings,
      screenTimeLimitMinutes: currentLimit,
      breakReminders: breakReminders,
      pushNotificationsEnabled: pushEnabled,
      reminderTime: reminderTime,
      reminderPreset: reminderPreset
    });
    alert('Đã cập nhật cài đặt phụ huynh thành công!');
  };

  const handleRequestPermission = async () => {
    sound.playClick();
    const granted = await requestNotificationPermission();
    setBrowserPerm(granted ? 'granted' : 'denied');
    if (granted) {
      sound.playSuccess();
    }
  };

  const handleTestNotification = () => {
    sound.playClick();
    const msg = getReminderMessage(reminderPreset, user.nickname, user.streakDays);
    sendStudyNotification(msg.title, msg.body, '🦁');
  };

  const handleCopySyncCode = () => {
    sound.playClick();
    navigator.clipboard.writeText(syncCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleImportSyncCode = () => {
    sound.playClick();
    if (!inputSyncCode.trim()) return;
    const restored = restoreFromSyncCode(inputSyncCode);
    if (restored) {
      sound.playSuccess();
      onRestoreUser(restored);
      setSyncMessage({ text: 'Đồng bộ dữ liệu thành công!', success: true });
    } else {
      sound.playWrong();
      setSyncMessage({ text: 'Mã đồng bộ không hợp lệ. Vui lòng kiểm tra lại.', success: false });
    }
  };

  // Calculate statistics
  const totalCompletedLessons = Object.keys(user.levelStars).length;
  const averageAccuracy = user.studyRecords.length > 0
    ? Math.round(user.studyRecords.reduce((acc, curr) => acc + curr.accuracy, 0) / user.studyRecords.length)
    : 100;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl border-4 border-slate-700 shadow-2xl max-w-3xl w-full p-4 sm:p-6 relative max-h-[92vh] flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-slate-800 flex items-center justify-center text-amber-300 text-2xl shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Góc Phụ Huynh & Báo Cáo Học Tập
              </h2>
              <p className="text-xs text-slate-500 font-semibold">
                Theo dõi tiến độ, kiểm soát thời gian màn hình & bảo vệ dữ liệu bé
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

        {/* Parental Gate Check */}
        {!isAuthenticated ? (
          <div className="py-8 text-center max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-1">
              Khóa Bảo Vệ Phụ Huynh
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Để đảm bảo bé không tự ý đổi cài đặt, vui lòng giải phép tính đơn giản bên dưới:
            </p>

            <form onSubmit={handleVerifyGate} className="space-y-3">
              <div className="text-2xl font-black text-slate-800 bg-slate-50 py-3 rounded-2xl border border-slate-200">
                {mathQuestion.a} + {mathQuestion.b} = ?
              </div>

              <input
                type="number"
                value={userMathInput}
                onChange={(e) => setUserMathInput(e.target.value)}
                placeholder="Nhập kết quả..."
                className="w-full text-center py-2.5 px-4 rounded-xl border-2 border-slate-300 focus:border-amber-500 focus:outline-hidden font-bold text-lg"
                autoFocus
              />

              {mathError && (
                <p className="text-xs text-rose-600 font-bold">
                  Kết quả chưa đúng, phụ huynh vui lòng thử lại!
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-900 text-amber-300 font-black py-3 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Mở Khóa Bảng Điều Khiển 🔓
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Dashboard Tabs */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 border-b border-slate-100 pb-2">
              {[
                { id: 'overview', label: 'Tiến Độ & Biểu Đồ', icon: BarChart3 },
                { id: 'milestone', label: 'Cột Mốc Tháng', icon: Trophy },
                { id: 'report', label: 'Phiếu Báo Cáo', icon: FileText },
                { id: 'time', label: 'Thời Gian', icon: Clock },
                { id: 'notif', label: 'Thông Báo Đẩy', icon: Bell },
                { id: 'history', label: 'Lịch Sử Học Tập', icon: History },
                { id: 'sync', label: 'Đồng Bộ', icon: Smartphone }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      sound.playClick();
                      setActiveTab(tab.id as typeof activeTab);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-800 text-amber-300 shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENTS */}
            <div className="flex-1 overflow-y-auto pr-1">
              
              {/* TAB 1: OVERVIEW & CHARTS */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
                      <div className="text-2xl font-black text-amber-700">Cấp {user.level}/100</div>
                      <div className="text-[11px] text-amber-900 font-semibold mt-0.5">Cấp độ đã mở</div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center">
                      <div className="text-2xl font-black text-emerald-700">{user.streakDays} Ngày</div>
                      <div className="text-[11px] text-emerald-900 font-semibold mt-0.5">Chuỗi học liên tục</div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-center">
                      <div className="text-2xl font-black text-blue-700">{averageAccuracy}%</div>
                      <div className="text-[11px] text-blue-900 font-semibold mt-0.5">Độ chuẩn phát âm</div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3 text-center">
                      <div className="text-2xl font-black text-purple-700">{user.dailyMinutesSpent} Phút</div>
                      <div className="text-[11px] text-purple-900 font-semibold mt-0.5">Hôm nay đã học</div>
                    </div>
                  </div>

                  {/* Level Progress Bar */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                      <span>Tiến trình hoàn thành 100 Cấp Độ behocvui</span>
                      <span>{Math.round((user.level / 100) * 100)}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 rounded-full transition-all duration-500"
                        style={{ width: `${(user.level / 100) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Visual 7-day study bar chart */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3">
                      Biểu đồ thời gian học tập 7 ngày qua (Phút)
                    </h4>
                    <div className="flex items-end justify-between gap-2 h-32 pt-4 px-2">
                      {[
                        { day: 'T2', mins: 15 },
                        { day: 'T3', mins: 20 },
                        { day: 'T4', mins: 10 },
                        { day: 'T5', mins: 25 },
                        { day: 'T6', mins: 18 },
                        { day: 'T7', mins: 30 },
                        { day: 'CN', mins: user.dailyMinutesSpent || 20 }
                      ].map((item, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[10px] font-bold text-slate-600">{item.mins}m</span>
                          <div
                            className="w-full max-w-[28px] bg-gradient-to-t from-amber-500 to-orange-400 rounded-t-lg transition-all"
                            style={{ height: `${Math.min(100, item.mins * 3)}px` }}
                          />
                          <span className="text-[11px] font-bold text-slate-500">{item.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Monthly Milestone Quick Banner */}
                  <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-2xl p-4 text-white shadow-md flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl shadow-2xs">
                        🏆
                      </div>
                      <div>
                        <div className="text-xs font-black uppercase tracking-wider text-amber-100">
                          Theo Dõi Dài Hạn
                        </div>
                        <div className="text-sm font-black">
                          Bảng Tổng Kết Cột Mốc Hàng Tháng (Monthly Milestone)
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setActiveTab('milestone');
                      }}
                      className="bg-white hover:bg-amber-50 text-slate-900 font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
                    >
                      Xem Bảng Cột Mốc ➔
                    </button>
                  </div>

                  {/* Privacy & COPPA Safety note */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-emerald-900">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Bảo Mật & Riêng Tư Tuyệt Đối Cho Trẻ Em:</span> Ứng dụng tuân thủ tiêu chuẩn COPPA. Toàn bộ lịch sử học tập được mã hóa và lưu trữ cục bộ trên thiết bị của gia đình, không thu thập dữ liệu cá nhân hay quảng cáo bên ngoài.
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: MONTHLY MILESTONE */}
              {activeTab === 'milestone' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        <span>Bảng Cột Mốc Tháng (Monthly Milestone)</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        Theo dõi sự tiến bộ đường dài của bé theo từng chu kỳ hàng tháng
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        sound.playClick();
                        setActiveTab('report');
                      }}
                      className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl cursor-pointer transition-colors hidden sm:flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Xem Phiếu Báo Cáo In Ấn</span>
                    </button>
                  </div>

                  <MonthlyMilestoneTable
                    milestones={monthlyMilestones}
                    childName={user.nickname}
                  />
                </div>
              )}

              {/* TAB 2: SCREEN TIME CONTROL */}
              {activeTab === 'time' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <h4 className="font-black text-sm text-slate-800 mb-1">
                      Giới Hạn Thời Gian Sử Dụng Mỗi Ngày
                    </h4>
                    <p className="text-xs text-slate-500 mb-4">
                      Tự động nhắc nhở bé nghỉ ngơi khi hết thời gian học để bảo vệ thị lực của bé.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[15, 30, 45, 60].map((mins) => (
                        <button
                          key={mins}
                          onClick={() => setCurrentLimit(mins)}
                          className={`py-3 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer border-2 ${
                            currentLimit === mins
                              ? 'bg-slate-800 text-amber-300 border-slate-900 shadow-md'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {mins} Phút / Ngày
                        </button>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                      <div>
                        <div className="font-bold text-xs text-slate-800">
                          Nhắc nhở nghỉ giải lao (Mỗi 20 phút)
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Hướng dẫn bé đứng dậy tập thể dục nhẹ nhàng
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={breakReminders}
                        onChange={(e) => setBreakReminders(e.target.checked)}
                        className="w-5 h-5 accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveSettings}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-amber-300 font-black py-3 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    Lưu Thay Đổi Cài Đặt 💾
                  </button>
                </div>
              )}

              {/* TAB: PUSH NOTIFICATIONS & REMINDERS */}
              {activeTab === 'notif' && (
                <div className="space-y-4">
                  {/* Browser Permission Card */}
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-amber-600" />
                        <h4 className="font-black text-sm text-slate-800">
                          Quyền Thông Báo Trình Duyệt (Web Push)
                        </h4>
                      </div>
                      <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                        browserPerm === 'granted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : browserPerm === 'denied'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {browserPerm === 'granted' ? '✓ Đã Cho Phép' : browserPerm === 'denied' ? 'Đã Chặn' : 'Chưa Cấp Quyền'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mb-3">
                      Hệ thống sẽ gửi thông báo nhắc bé ôn bài đúng giờ hẹn hàng ngày ngay trên trình duyệt (kể cả khi bé đang ở tab khác hoặc ứng dụng nổi).
                    </p>

                    {browserPerm !== 'granted' && (
                      <button
                        onClick={handleRequestPermission}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <Bell className="w-4 h-4" />
                        <span>Kích Hoạt Quyền Thông Báo Ngay</span>
                      </button>
                    )}
                  </div>

                  {/* Settings Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                    
                    {/* Toggle on/off */}
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div>
                        <div className="font-black text-xs sm:text-sm text-slate-800">
                          Bật Nhắc Nhở Học Bài Hàng Ngày
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Gửi lời gọi thân thương từ bạn linh vật cho bé
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={pushEnabled}
                        onChange={(e) => setPushEnabled(e.target.checked)}
                        className="w-5 h-5 accent-amber-500 cursor-pointer"
                      />
                    </div>

                    {/* Reminder Time */}
                    <div>
                      <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-2">
                        Giờ Nhắc Nhở Hàng Ngày
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {['08:00', '17:30', '19:30', '20:30'].map((timeStr) => (
                          <button
                            key={timeStr}
                            onClick={() => setReminderTime(timeStr)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                              reminderTime === timeStr
                                ? 'bg-slate-800 text-amber-300 border-slate-900 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300'
                            }`}
                          >
                            {timeStr}
                          </button>
                        ))}
                      </div>
                      <input
                        type="time"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                      />
                    </div>

                    {/* Preset style */}
                    <div>
                      <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-2">
                        Kiểu Lời Nhắc Nhở
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'fun', label: 'Linh Vật Vui Nhộn 🦁', desc: 'Lời gọi dễ thương từ bạn Sư Tử Leo' },
                          { id: 'streak', label: 'Giữ Vững Chuỗi 🔥', desc: 'Nhắc giữ vững ngày học liên tục' },
                          { id: 'reward', label: 'Rương Quà Thưởng 🎁', desc: 'Nhắc nhận Sao Vàng và Huy Hiệu' },
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setReminderPreset(item.id as typeof reminderPreset)}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              reminderPreset === item.id
                                ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-300'
                                : 'bg-white border-slate-200 hover:border-amber-300'
                            }`}
                          >
                            <div className="font-black text-xs text-slate-800">{item.label}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Test notification button */}
                    <div className="pt-2 flex justify-start">
                      <button
                        onClick={handleTestNotification}
                        className="bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-300 font-bold text-xs px-4 py-2 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Bell className="w-4 h-4 text-amber-600" />
                        <span>Gửi Thử Thông Báo Mẫu Ngay 🔔</span>
                      </button>
                    </div>

                  </div>

                  <button
                    onClick={handleSaveSettings}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-amber-300 font-black py-3 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    Lưu Cài Đặt Thông Báo 💾
                  </button>
                </div>
              )}

              {/* TAB 3: STUDY HISTORY */}
              {activeTab === 'history' && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                    Lịch sử các buổi học & bài thi gần đây ({user.studyRecords.length})
                  </h4>

                  {user.studyRecords.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center">
                      Chưa có lịch sử học tập.
                    </p>
                  ) : (
                    user.studyRecords.map((rec) => (
                      <div
                        key={rec.id}
                        className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center justify-between shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                            Cấp {rec.level}
                          </div>
                          <div>
                            <div className="font-bold text-xs sm:text-sm text-slate-800">
                              {rec.lessonTitle}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {new Date(rec.timestamp).toLocaleDateString('vi-VN')} • {rec.durationMinutes} phút
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-black text-xs text-emerald-600">
                            {rec.accuracy}% chính xác
                          </div>
                          <div className="text-[10px] text-amber-600 font-bold">
                            ⭐ {rec.score}/{rec.maxScore} sao
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 4: MULTI-DEVICE SYNC & OFFLINE */}
              {activeTab === 'sync' && (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <h4 className="font-black text-sm text-amber-900 mb-1 flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-amber-600" />
                      <span>Mã Đồng Bộ Gia Đình (Family Sync Code)</span>
                    </h4>
                    <p className="text-xs text-slate-600 mb-3">
                      Để phụ huynh xem tiến độ trên điện thoại khác hoặc đồng bộ khi đi du lịch:
                    </p>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={syncCode}
                        className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 truncate"
                      />
                      <button
                        onClick={handleCopySyncCode}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Đã Sao Chép' : 'Sao Chép'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <h4 className="font-black text-sm text-slate-800 mb-1">
                      Nhập Dữ Liệu Từ Thiết Bị Khác
                    </h4>
                    <p className="text-xs text-slate-500 mb-3">
                      Dán Mã Đồng Bộ từ thiết bị khác để khôi phục toàn bộ Sao Vàng và Cấp Độ:
                    </p>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={inputSyncCode}
                        onChange={(e) => setInputSyncCode(e.target.value)}
                        placeholder="Dán mã đồng bộ vào đây..."
                        className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-700"
                      />
                      <button
                        onClick={handleImportSyncCode}
                        className="bg-slate-800 hover:bg-slate-900 text-amber-300 font-bold text-xs px-4 py-2 rounded-xl cursor-pointer shrink-0"
                      >
                        Đồng Bộ
                      </button>
                    </div>

                    {syncMessage && (
                      <p className={`text-xs font-bold mt-2 ${syncMessage.success ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {syncMessage.text}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: REPORT CARD (PHIẾU BÁO CÁO ĐỊNH KỲ) */}
              {activeTab === 'report' && (
                <div className="space-y-4">
                  <div className="border-4 border-dashed border-amber-300 rounded-3xl p-5 bg-gradient-to-b from-amber-50/50 to-white text-slate-800 shadow-sm">
                    <div className="text-center border-b border-amber-200 pb-3 mb-3">
                      <div className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                        BÁO CÁO NĂNG LỰC ANH NGỮ ĐỊNH KỲ
                      </div>
                      <h3 className="text-xl font-black text-slate-900">
                        behocvui Kids English Academy
                      </h3>
                      <p className="text-xs text-slate-500">
                        Học viên: <span className="font-bold text-slate-800">{user.nickname}</span> • Ngày cấp: {new Date().toLocaleDateString('vi-VN')}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-slate-500">Trình độ hiện tại:</span>
                        <div className="text-base font-black text-amber-600">Cấp Độ {user.level}/100</div>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-slate-500">Điểm đánh giá phát âm:</span>
                        <div className="text-base font-black text-emerald-600">{averageAccuracy}/100 Điểm</div>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-slate-500">Huy hiệu đạt được:</span>
                        <div className="text-base font-black text-purple-600">{user.badges.length} Danh Hiệu</div>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-slate-500">Chuỗi ngày kiên trì:</span>
                        <div className="text-base font-black text-orange-600">{user.streakDays} Ngày Liên Tiếp</div>
                      </div>
                    </div>

                    <div className="bg-amber-100/60 rounded-xl p-3 text-xs text-slate-700 font-medium mb-4">
                      <div className="font-bold text-amber-900 mb-1">Nhận xét từ giáo viên cố vấn:</div>
                      "Bé thể hiện sự hứng thú vượt trội với các bài học âm điệu và phản xạ từ vựng qua trò chơi. Khả năng phát âm tròn vành, tự tin khi nhắc lại từ vựng. Đề xuất gia đình tiếp tục duy trì 15-20 phút luyện tập mỗi ngày cùng bé."
                    </div>

                    {/* Integrated Monthly Milestone Table in Official Report */}
                    <div className="mt-4 pt-4 border-t-2 border-dashed border-amber-200">
                      <MonthlyMilestoneTable
                        milestones={monthlyMilestones}
                        childName={user.nickname}
                        isPrintMode={true}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        window.print();
                      }}
                      className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-amber-300 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>In Phiếu Báo Cáo</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
