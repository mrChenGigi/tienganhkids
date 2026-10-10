import { LevelData, Mascot } from '../types';
import { generate100Levels } from './curriculumGenerator';

export const MASCOTS: Mascot[] = [
  {
    id: 'lion',
    name: 'Sư Tử Leo',
    title: 'Dũng Cảm & Tự Tin',
    emoji: '🦁',
    color: 'from-amber-400 to-orange-500',
    avatarBg: 'bg-amber-100 border-amber-300'
  },
  {
    id: 'rabbit',
    name: 'Thỏ Bun Bun',
    title: 'Tinh Nghịch & Nhanh Nhẹn',
    emoji: '🐰',
    color: 'from-pink-400 to-rose-500',
    avatarBg: 'bg-pink-100 border-pink-300'
  },
  {
    id: 'dino',
    name: 'Khủng Long Rex',
    title: 'Thông Thái & Khỏe Khoắn',
    emoji: '🦖',
    color: 'from-emerald-400 to-teal-500',
    avatarBg: 'bg-emerald-100 border-emerald-300'
  },
  {
    id: 'penguin',
    name: 'Cánh Cụt Pip',
    title: 'Chăm Chỉ & Đáng Yêu',
    emoji: '🐧',
    color: 'from-sky-400 to-blue-500',
    avatarBg: 'bg-sky-100 border-sky-300'
  },
  {
    id: 'dragon',
    name: 'Rồng Sparky',
    title: 'Thần Đồng Phát Âm',
    emoji: '🐲',
    color: 'from-purple-400 to-indigo-500',
    avatarBg: 'bg-purple-100 border-purple-300'
  },
  {
    id: 'fox',
    name: 'Cáo Luna',
    title: 'Thông Minh & Khéo Léo',
    emoji: '🦊',
    color: 'from-orange-400 to-amber-600',
    avatarBg: 'bg-orange-100 border-orange-300'
  },
  {
    id: 'panda',
    name: 'Gấu trúc Chen',
    title: 'Hiền Lành & Chăm Chỉ',
    emoji: '🐼',
    color: 'from-emerald-400 via-teal-500 to-cyan-600',
    avatarBg: 'bg-emerald-100 border-emerald-300'
  },
  {
    id: 'cat',
    name: 'Mèo Gigi',
    title: 'Đáng Yêu & Nhanh Nhẹn',
    emoji: '🐱',
    color: 'from-pink-400 via-rose-400 to-amber-400',
    avatarBg: 'bg-pink-100 border-pink-300'
  }
];

export const NICKNAME_PRESETS = [
  'Sư Tử Dũng Cảm',
  'Thỏ Ngọc Thông Minh',
  'Gấu Trúc Chen Tí Hon',
  'Mèo Gigi Đáng Yêu',
  'Khủng Long Nhí',
  'Ngôi Sao Sáng',
  'Bé Mèo Đáng Yêu',
  'Hiệp Sĩ Tiếng Anh',
  'Thiên Tài Tí Hon',
  'Chim Sâu Chăm Chỉ',
  'Bé Bắp Vui Vẻ',
  'Gấu Trúc Hạt Dẻ'
];

// Full 100 levels with 50 words and 50 questions each
export const LEVELS: LevelData[] = generate100Levels();
