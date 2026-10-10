import React, { useState } from 'react';
import { MonthlyMilestone } from '../types';
import { 
  Trophy, 
  TrendingUp, 
  Calendar, 
  Target, 
  Star, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  Printer,
  Award,
  BookOpen
} from 'lucide-react';
import { sound } from '../utils/audio';

interface MonthlyMilestoneTableProps {
  milestones: MonthlyMilestone[];
  childName: string;
  isPrintMode?: boolean;
}

export const MonthlyMilestoneTable: React.FC<MonthlyMilestoneTableProps> = ({
  milestones,
  childName,
  isPrintMode = false
}) => {
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(
    milestones[0]?.monthKey || ''
  );

  const activeMilestone = milestones.find((m) => m.monthKey === selectedMonthKey) || milestones[0];

  // Overall calculations
  const totalMonths = milestones.length;
  const totalWords = milestones.reduce((sum, m) => sum + m.wordsMastered, 0);
  const totalMinutes = milestones.reduce((sum, m) => sum + m.studyMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const avgAccuracy = Math.round(
    milestones.reduce((sum, m) => sum + m.accuracyRate, 0) / (totalMonths || 1)
  );

  return (
    <div className="space-y-4">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-3 text-center shadow-2xs">
          <div className="flex items-center justify-center gap-1 text-amber-600 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Hành Trình</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-900">{totalMonths} Tháng</div>
          <div className="text-[10px] text-amber-700 font-semibold mt-0.5">Liên tục đồng hành</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-3 text-center shadow-2xs">
          <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
            <BookOpen className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Từ Vựng Tích Lũy</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-900">{totalWords}+ Từ</div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Ghi nhớ & làm chủ</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-3 text-center shadow-2xs">
          <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Tổng Thời Lượng</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-900">{totalHours} Giờ</div>
          <div className="text-[10px] text-blue-700 font-semibold mt-0.5">{totalMinutes} phút luyện tập</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/80 rounded-2xl p-3 text-center shadow-2xs">
          <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Phát Âm Chuẩn</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-900">{avgAccuracy}%</div>
          <div className="text-[10px] text-purple-700 font-semibold mt-0.5">Độ chính xác trung bình</div>
        </div>
      </div>

      {/* Main Milestone Table */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wide">
                Bảng Tổng Kết Cột Mốc Tháng (Monthly Milestone)
              </h4>
              <p className="text-[10px] text-slate-300">
                Đánh giá năng lực và chỉ số phát triển theo từng giai đoạn của {childName}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-full hidden sm:inline-block">
            Đạt Chuẩn Tiến Độ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Kỳ Tháng</th>
                <th className="py-2.5 px-3">Cấp Độ</th>
                <th className="py-2.5 px-3">Từ Vựng Đạt Chuẩn</th>
                <th className="py-2.5 px-3">Thời Gian</th>
                <th className="py-2.5 px-3">Độ Chuẩn</th>
                <th className="py-2.5 px-3">Huy Hiệu Tháng</th>
                <th className="py-2.5 px-3 text-right">Xếp Loại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {milestones.map((m) => {
                const isSelected = activeMilestone?.monthKey === m.monthKey;
                return (
                  <tr
                    key={m.monthKey}
                    onClick={() => {
                      if (!isPrintMode) {
                        sound.playClick();
                        setSelectedMonthKey(m.monthKey);
                      }
                    }}
                    className={`transition-colors cursor-pointer ${
                      isSelected && !isPrintMode
                        ? 'bg-amber-50/90 font-bold'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-900">{m.monthLabel}</span>
                        {m.isCurrent && (
                          <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full uppercase">
                            Hiện tại
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md text-[11px]">
                        Cấp {m.levelsCompleted}/100
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div>
                        <div className="font-black text-slate-800 text-[11px]">
                          {m.wordsMastered} / {m.goalTargetWords} từ
                        </div>
                        <div className="w-20 sm:w-28 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                            style={{ width: `${Math.min(100, m.goalProgressPercent)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-semibold">
                      {m.studyMinutes} phút
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-black ${
                        m.accuracyRate >= 90 ? 'text-emerald-600' : 'text-blue-600'
                      }`}>
                        {m.accuracyRate}%
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{m.badgeEmoji}</span>
                        <span className="text-slate-700 text-[11px] font-medium hidden sm:inline">
                          {m.badgeName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`inline-block font-black text-[10px] px-2 py-0.5 rounded-full ${
                        m.grade === 'A+'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : m.grade === 'A'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {m.gradeLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Month Deep-Dive & Growth Card */}
      {activeMilestone && (
        <div className="bg-gradient-to-br from-amber-50/60 via-white to-orange-50/40 border border-amber-200 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-2xs">
                {activeMilestone.badgeEmoji}
              </div>
              <div>
                <h5 className="font-black text-sm text-slate-900">
                  Chi Tiết Thành Tích: {activeMilestone.monthLabel}
                </h5>
                <p className="text-[11px] text-slate-500 font-semibold">
                  Huy hiệu tháng: <span className="text-amber-800 font-bold">{activeMilestone.badgeName}</span>
                </p>
              </div>
            </div>

            {activeMilestone.growthComparedToLastMonth && (
              <div className="flex items-center gap-1 text-[11px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-xl">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>
                  +{activeMilestone.growthComparedToLastMonth.wordsDelta} từ mới • +{activeMilestone.growthComparedToLastMonth.accuracyDelta}% phát âm
                </span>
              </div>
            )}
          </div>

          {/* Highlights & Teacher feedback */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-white/90 border border-amber-200/70 rounded-xl p-3">
              <div className="font-extrabold text-amber-900 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Điểm Nổi Bật Trong Tháng:</span>
              </div>
              <ul className="space-y-1.5 text-slate-700">
                {activeMilestone.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/90 border border-amber-200/70 rounded-xl p-3">
              <div className="font-extrabold text-amber-900 mb-2 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>Lời Nhận Xét Cố Vấn behocvui:</span>
              </div>
              <p className="text-slate-700 italic leading-relaxed">
                "{activeMilestone.teacherFeedback}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Strategic Goal for Next Month */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-black text-xl shrink-0">
            <Target className="w-5 h-5 text-slate-900" />
          </div>
          <div>
            <h5 className="font-black text-xs sm:text-sm text-amber-300">
              Mục Tiêu Cột Mốc Tiếp Theo (Next Milestone Goal)
            </h5>
            <p className="text-[11px] text-slate-300">
              Chinh phục thêm 50 từ vựng chuyên sâu • Duy trì phát âm chuẩn trên 92% • Hoàn thành Cấp Độ {Math.min(100, (milestones[0]?.levelsCompleted || 1) + 1)}
            </p>
          </div>
        </div>

        <div className="text-center sm:text-right shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Khuyến nghị
          </span>
          <span className="text-xs font-black text-emerald-400">
            15 - 20 phút mỗi ngày ⏰
          </span>
        </div>
      </div>
    </div>
  );
};
