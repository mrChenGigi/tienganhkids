import React, { useState } from 'react';
import { AuthAccount, ChibiCharacter, UserState, WardrobeCategory, WardrobeItem } from '../types';
import { CHIBI_WARDROBE_ITEMS, WARDROBE_CATEGORIES } from '../data/chibiWardrobe';
import { Chibi3DAvatar } from './Chibi3DAvatar';
import { updateAccountChibi, updateAccountPassword } from '../utils/authStorage';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  X, 
  Sparkles, 
  KeyRound, 
  LogOut, 
  ShoppingBag, 
  Check, 
  Lock, 
  Coins, 
  Diamond, 
  UserCheck, 
  Palette,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface PersonalProfileModalProps {
  account: AuthAccount;
  userState: UserState;
  onUpdateAccount: (updatedAccount: AuthAccount) => void;
  onUpdateUserState: (modifier: (prev: UserState) => UserState) => void;
  onLogout: () => void;
  onClose: () => void;
  onOpenGames: () => void;
}

export const PersonalProfileModal: React.FC<PersonalProfileModalProps> = ({
  account,
  userState,
  onUpdateAccount,
  onUpdateUserState,
  onLogout,
  onClose,
  onOpenGames
}) => {
  const [activeTab, setActiveTab] = useState<'wardrobe' | 'customize' | 'security' | 'earn'>('wardrobe');
  const [activeCategory, setActiveCategory] = useState<WardrobeCategory>('outfit');
  const [chibi, setChibi] = useState<ChibiCharacter>(account.chibi);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Skin tones available
  const SKIN_TONES = [
    { label: 'Trắng Sáng', color: '#fff1e6' },
    { label: 'Tự Nhiên', color: '#ffd9b3' },
    { label: 'Hồng Hào', color: '#ffe4cc' },
    { label: 'Rám Nắng', color: '#f5cba7' },
    { label: 'Bánh Mật', color: '#d9a066' }
  ];

  // Filter wardrobe items for active category
  const categoryItems = CHIBI_WARDROBE_ITEMS.filter((item) => item.category === activeCategory);

  // Switch Boy / Girl
  const handleGenderToggle = (newGender: 'boy' | 'girl') => {
    sound.playClick();
    const updatedChibi: ChibiCharacter = {
      ...chibi,
      gender: newGender,
      skinTone: newGender === 'boy' ? '#ffd9b3' : '#ffe4cc',
      equipped: {
        ...chibi.equipped,
        hair: newGender === 'boy' ? 'hair_short_neat' : 'hair_twin_tails',
        outfit: newGender === 'boy' ? 'outfit_school_uniform' : 'outfit_princess_dress',
        shoes: newGender === 'boy' ? 'shoes_canvas_classic' : 'shoes_mary_jane'
      },
      ownedWardrobe: Array.from(new Set([
        ...chibi.ownedWardrobe,
        newGender === 'boy' ? 'hair_short_neat' : 'hair_twin_tails',
        newGender === 'boy' ? 'outfit_school_uniform' : 'outfit_princess_dress',
        newGender === 'boy' ? 'shoes_canvas_classic' : 'shoes_mary_jane'
      ]))
    };
    setChibi(updatedChibi);
    updateAccountChibi(account.id, updatedChibi);
    onUpdateAccount({ ...account, chibi: updatedChibi });
  };

  // Buy Wardrobe Item
  const handleBuyItem = (item: WardrobeItem) => {
    // Check balance
    if (item.currency === 'coins' && userState.coins < item.price) {
      sound.playWrong();
      alert(`Bé không đủ Sao Vàng! Cần ${item.price} Sao Vàng (Bé hiện có ${userState.coins}). Hãy chơi thêm Trò chơi hoặc hoàn thành bài học để kiếm thêm nhé!`);
      return;
    }
    if (item.currency === 'gems' && userState.gems < item.price) {
      sound.playWrong();
      alert(`Bé không đủ Kim Cương! Cần ${item.price} Kim Cương (Bé hiện có ${userState.gems}). Hãy đạt điểm 3 sao và mở Rương kho báu mỗi ngày!`);
      return;
    }

    // Deduct coins / gems
    onUpdateUserState((prev) => ({
      ...prev,
      coins: item.currency === 'coins' ? prev.coins - item.price : prev.coins,
      gems: item.currency === 'gems' ? prev.gems - item.price : prev.gems
    }));

    // Add to owned wardrobe and equip
    const nextOwned = [...chibi.ownedWardrobe, item.id];
    const nextEquipped = {
      ...chibi.equipped,
      [item.category]: item.id
    };

    const nextChibi: ChibiCharacter = {
      ...chibi,
      ownedWardrobe: nextOwned,
      equipped: nextEquipped
    };

    setChibi(nextChibi);
    updateAccountChibi(account.id, nextChibi);
    onUpdateAccount({ ...account, chibi: nextChibi });

    sound.playStar();
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Equip / Unequip already owned item
  const handleEquipItem = (item: WardrobeItem) => {
    sound.playClick();
    const isEquipped = chibi.equipped[item.category] === item.id;
    const nextEquipped = { ...chibi.equipped };

    if (isEquipped) {
      // For mandatory categories, don't allow empty
      if (item.category === 'hair' || item.category === 'outfit' || item.category === 'shoes') {
        sound.playPop();
        return;
      }
      nextEquipped[item.category] = undefined;
    } else {
      nextEquipped[item.category] = item.id;
    }

    const nextChibi: ChibiCharacter = {
      ...chibi,
      equipped: nextEquipped
    };

    setChibi(nextChibi);
    updateAccountChibi(account.id, nextChibi);
    onUpdateAccount({ ...account, chibi: nextChibi });
  };

  // Change Password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);

    if (account.passwordHash !== oldPassword) {
      setPwdMsg({ type: 'error', text: 'Mật khẩu cũ không chính xác!' });
      sound.playWrong();
      return;
    }

    if (newPassword.length < 4) {
      setPwdMsg({ type: 'error', text: 'Mật khẩu mới phải có từ 4 ký tự trở lên!' });
      sound.playWrong();
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: 'error', text: 'Mật khẩu xác nhận không trùng khớp!' });
      sound.playWrong();
      return;
    }

    const success = updateAccountPassword(account.id, newPassword);
    if (success) {
      setPwdMsg({ type: 'success', text: 'Chỉnh sửa mật khẩu thành công!' });
      sound.playSuccess();
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onUpdateAccount({ ...account, passwordHash: newPassword });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border-4 border-purple-400 shadow-2xl max-w-4xl w-full p-4 sm:p-6 relative max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-100 pb-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-400 flex items-center justify-center text-white text-2xl shadow-md animate-pulse">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                  Trang Cá Nhân & Tủ Đồ 3D
                </h2>
                <span className="bg-purple-100 text-purple-700 font-extrabold text-xs px-2.5 py-0.5 rounded-full border border-purple-200">
                  @{account.username}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold">
                Bé {account.nickname} • Nhân vật Chibi 3D sống động & Tủ đồ 60 món cao cấp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Currency Badges */}
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-2xl text-xs sm:text-sm font-black text-amber-900 shadow-xs">
              <span className="flex items-center gap-1 text-amber-600">
                ⭐ {userState.coins} Sao Vàng
              </span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1 text-cyan-600">
                💎 {userState.gems} Kim Cương
              </span>
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
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-2xl mb-4 overflow-x-auto">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('wardrobe');
            }}
            className={`flex-1 py-2 px-3 text-xs sm:text-sm font-black rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
              activeTab === 'wardrobe'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Tủ Đồ Thời Trang (60 Món)
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('customize');
            }}
            className={`flex-1 py-2 px-3 text-xs sm:text-sm font-black rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
              activeTab === 'customize'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Palette className="w-4 h-4" />
            Chỉnh Sửa Nhân Vật 3D
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('earn');
            }}
            className={`flex-1 py-2 px-3 text-xs sm:text-sm font-black rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
              activeTab === 'earn'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Coins className="w-4 h-4 text-amber-500" />
            Kiếm Sao & Kim Cương
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('security');
            }}
            className={`flex-1 py-2 px-3 text-xs sm:text-sm font-black rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
              activeTab === 'security'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            Đổi Mật Khẩu
          </button>
        </div>

        {/* Modal Main Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* TAB 1: WARDROBE (Shop & Dressing Room) */}
          {activeTab === 'wardrobe' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Left Column: 3D Chibi Preview Stage (5 cols) */}
              <div className="md:col-span-5 bg-gradient-to-b from-purple-50 via-pink-50 to-amber-50 rounded-3xl border-2 border-purple-200 p-4 flex flex-col items-center justify-between text-center relative overflow-hidden">
                <div className="w-full flex items-center justify-between">
                  <span className="text-xs font-black text-purple-900 bg-purple-100 px-3 py-1 rounded-full">
                    Sân Khấu 3D Bé Yêu
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleGenderToggle('boy')}
                      className={`px-2 py-0.5 text-xs font-black rounded-lg cursor-pointer ${
                        chibi.gender === 'boy'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200'
                      }`}
                    >
                      👦 Nam
                    </button>
                    <button
                      onClick={() => handleGenderToggle('girl')}
                      className={`px-2 py-0.5 text-xs font-black rounded-lg cursor-pointer ${
                        chibi.gender === 'girl'
                          ? 'bg-pink-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200'
                      }`}
                    >
                      👧 Nữ
                    </button>
                  </div>
                </div>

                {/* 3D Model Display */}
                <div className="py-2">
                  <Chibi3DAvatar chibi={chibi} size="lg" interactive={true} />
                </div>

                {/* Status Bar */}
                <div className="w-full bg-white/90 backdrop-blur-xs p-2.5 rounded-2xl border border-purple-100 text-left text-xs space-y-1">
                  <div className="font-bold text-slate-800 flex justify-between">
                    <span>Đang Mặc:</span>
                    <span className="text-purple-600 font-black">
                      {chibi.ownedWardrobe.length} / {CHIBI_WARDROBE_ITEMS.length} món đã có
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Bấm vào từng món bên phải để thử đồ và sắm trang phục mới lộng lẫy!
                  </p>
                </div>
              </div>

              {/* Right Column: Wardrobe Categories & 10 Items per category (7 cols) */}
              <div className="md:col-span-7 flex flex-col">
                {/* Category Pills (6 categories) */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mb-3">
                  {WARDROBE_CATEGORIES.map((cat) => {
                    const isSelected = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          sound.playClick();
                          setActiveCategory(cat.id);
                        }}
                        className={`p-2 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                          isSelected
                            ? 'border-purple-500 bg-purple-50 text-purple-950 font-black shadow-xs ring-2 ring-purple-300'
                            : 'border-slate-200 bg-white hover:border-purple-200 text-slate-700'
                        }`}
                      >
                        <span className="text-xl">{cat.icon}</span>
                        <span className="text-[11px] mt-0.5 font-bold leading-tight">{cat.label}</span>
                        <span className="text-[9px] text-slate-400 font-normal">10 món</span>
                      </button>
                    );
                  })}
                </div>

                {/* Category Description */}
                <div className="mb-2 text-xs font-bold text-slate-600 flex items-center justify-between">
                  <span>
                    Danh mục: <span className="text-purple-700 font-black">{WARDROBE_CATEGORIES.find((c) => c.id === activeCategory)?.label}</span> (10 thiết kế giá khác nhau)
                  </span>
                  <span className="text-amber-600 font-extrabold text-[11px]">
                    ⭐ Sao & 💎 Kim Cương
                  </span>
                </div>

                {/* 10 Items Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {categoryItems.map((item) => {
                    const isOwned = chibi.ownedWardrobe.includes(item.id);
                    const isEquipped = chibi.equipped[item.category] === item.id;
                    const canAfford = item.currency === 'coins' ? userState.coins >= item.price : userState.gems >= item.price;

                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-2xl border-2 transition-all relative flex flex-col justify-between ${
                          isEquipped
                            ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-300'
                            : isOwned
                            ? 'border-purple-300 bg-purple-50/40 hover:border-purple-400'
                            : 'border-slate-200 bg-white hover:border-amber-300'
                        }`}
                      >
                        {/* Top emoji & title */}
                        <div className="flex items-start gap-2.5 mb-2">
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-xs shrink-0"
                            style={{ backgroundColor: item.previewColor ? `${item.previewColor}20` : '#f1f5f9' }}
                          >
                            <span>{item.emoji}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-xs text-slate-800 line-clamp-1" title={item.name}>
                              {item.name}
                            </h4>
                            <p className="text-[10px] text-slate-500 line-clamp-2" title={item.description}>
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {/* Price & Action Button */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <div className="text-xs font-black">
                            {isOwned ? (
                              <span className="text-emerald-700 text-[11px] font-bold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 text-emerald-600" /> Đã sở hữu
                              </span>
                            ) : (
                              <span className={item.currency === 'coins' ? 'text-amber-700' : 'text-cyan-700'}>
                                {item.currency === 'coins' ? `⭐ ${item.price} Sao` : `💎 ${item.price} KC`}
                              </span>
                            )}
                          </div>

                          {isOwned ? (
                            <button
                              onClick={() => handleEquipItem(item)}
                              className={`px-3 py-1 rounded-xl text-xs font-black cursor-pointer transition-transform active:scale-95 ${
                                isEquipped
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                  : 'bg-purple-600 text-white hover:bg-purple-700'
                              }`}
                            >
                              {isEquipped ? 'Đang Mặc' : 'Mặc Ngay'}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBuyItem(item)}
                              disabled={!canAfford}
                              className={`px-2.5 py-1 rounded-xl text-xs font-black cursor-pointer transition-transform active:scale-95 flex items-center gap-1 ${
                                canAfford
                                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              }`}
                              title={canAfford ? 'Mua ngay' : 'Không đủ điểm, hãy chơi game để kiếm thêm'}
                            >
                              <ShoppingBag className="w-3 h-3" />
                              Mua
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOMIZE CHIBI (Gender, Skin Tone, Poses) */}
          {activeTab === 'customize' && (
            <div className="max-w-xl mx-auto space-y-5 py-2">
              <div className="text-center">
                <Chibi3DAvatar chibi={chibi} size="lg" interactive={true} />
              </div>

              {/* 1. Gender Selection */}
              <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-2">
                  1. Chọn Giới Tính Nhân Vật 3D
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleGenderToggle('boy')}
                    className={`p-3 rounded-2xl border-2 flex items-center justify-center gap-2 font-black text-sm cursor-pointer transition-all ${
                      chibi.gender === 'boy'
                        ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md ring-2 ring-blue-300'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <span className="text-3xl">👦</span>
                    <span>Bé Trai Dũng Cảm 3D</span>
                  </button>
                  <button
                    onClick={() => handleGenderToggle('girl')}
                    className={`p-3 rounded-2xl border-2 flex items-center justify-center gap-2 font-black text-sm cursor-pointer transition-all ${
                      chibi.gender === 'girl'
                        ? 'border-pink-500 bg-pink-50 text-pink-900 shadow-md ring-2 ring-pink-300'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <span className="text-3xl">👧</span>
                    <span>Bé Gái Đáng Yêu 3D</span>
                  </button>
                </div>
              </div>

              {/* 2. Skin Tone Selection */}
              <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-2">
                  2. Chọn Tông Màu Da Tự Nhiên
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {SKIN_TONES.map((st) => {
                    const isSelected = chibi.skinTone === st.color;
                    return (
                      <button
                        key={st.color}
                        onClick={() => {
                          sound.playClick();
                          const next = { ...chibi, skinTone: st.color };
                          setChibi(next);
                          updateAccountChibi(account.id, next);
                          onUpdateAccount({ ...account, chibi: next });
                        }}
                        className={`p-2 rounded-2xl border-2 text-center cursor-pointer transition-all flex flex-col items-center ${
                          isSelected
                            ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-300 shadow-xs'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-full shadow-inner border border-slate-300 mb-1"
                          style={{ backgroundColor: st.color }}
                        />
                        <span className="text-[10px] font-bold text-slate-700">{st.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Pose Selector */}
              <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-2">
                  3. Tạo Dáng Đứng Mặc Định
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'happy', label: 'Tươi Cười', icon: '😄' },
                    { id: 'wave', label: 'Vẫy Tay Chào', icon: '👋' },
                    { id: 'dance', label: 'Nhún Nhảy', icon: '💃' },
                    { id: 'hero', label: 'Siêu Anh Hùng', icon: '🦸' },
                  ].map((p) => {
                    const isSelected = (chibi.pose || 'happy') === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          sound.playStar();
                          const next: ChibiCharacter = { ...chibi, pose: p.id as any };
                          setChibi(next);
                          updateAccountChibi(account.id, next);
                          onUpdateAccount({ ...account, chibi: next });
                        }}
                        className={`p-2.5 rounded-2xl border-2 text-center cursor-pointer transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50 text-amber-900 font-black shadow-xs ring-2 ring-amber-300'
                            : 'border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        <div className="text-xl mb-0.5">{p.icon}</div>
                        <div className="text-[11px] font-bold">{p.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EARN STARS & GEMS (Instructions and shortcut to Games) */}
          {activeTab === 'earn' && (
            <div className="max-w-2xl mx-auto space-y-4 py-2">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl p-5 text-center">
                <div className="text-4xl mb-2">⭐ 💎</div>
                <h3 className="text-lg font-black text-amber-950 mb-1">
                  Cách Kiếm Sao Vàng & Kim Cương Mua Vật Phẩm
                </h3>
                <p className="text-xs text-amber-800 font-medium max-w-md mx-auto">
                  Tham gia các trò chơi tiếng Anh sinh động và hoàn thành bài học mỗi ngày để tích lũy kho báu sắm đồ 3D!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Method 1: Play games */}
                <div className="bg-white border-2 border-purple-200 rounded-3xl p-4 shadow-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl">🎮</span>
                    <div>
                      <h4 className="font-black text-sm text-purple-950">Chơi Các Trò Chơi Mới</h4>
                      <p className="text-[11px] text-slate-500">Khu vui chơi với 6 trò chơi & nhiều cấp độ</p>
                    </div>
                  </div>
                  <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4 font-medium mb-3">
                    <li>🎈 <strong>Bóng bay từ vựng:</strong> Nhận 20 - 40 Sao mỗi màn</li>
                    <li>🃏 <strong>Lật thẻ trí nhớ:</strong> Nhận 25 - 50 Sao mỗi ván</li>
                    <li>✏️ <strong>Xếp chữ thần tốc:</strong> Nhận 30 - 60 Sao mỗi màn</li>
                    <li>🚀 <strong>Đua thuyền tiếng Anh:</strong> Nhận tới 70 Sao</li>
                    <li>🐾 <strong>Đố vui hình ảnh:</strong> Nhận 40 Sao + 1 Kim Cương</li>
                  </ul>
                  <button
                    onClick={() => {
                      sound.playClick();
                      onClose();
                      onOpenGames();
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer hover:from-purple-600 hover:to-indigo-700"
                  >
                    Vào Chơi Game Ngay 🎮
                  </button>
                </div>

                {/* Method 2: Level quizzes & Daily Missions */}
                <div className="bg-white border-2 border-emerald-200 rounded-3xl p-4 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-3xl">🏆</span>
                      <div>
                        <h4 className="font-black text-sm text-emerald-950">Lên Cấp & Thử Thách Ngày</h4>
                        <p className="text-[11px] text-slate-500">Học bài và hoàn thành nhiệm vụ</p>
                      </div>
                    </div>
                    <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4 font-medium mb-3">
                      <li>⭐ <strong>Hoàn thành bài kiểm tra cấp độ:</strong> Tặng 50-100 Sao + 1 Kim Cương</li>
                      <li>🎯 <strong>Thử thách hàng ngày:</strong> Tặng 30-40 Sao mỗi nhiệm vụ</li>
                      <li>🎤 <strong>Luyện phát âm giọng đọc:</strong> Tặng Sao mỗi lượt đọc đúng</li>
                      <li>🎁 <strong>Mở Rương Kho Báu Hàng Ngày:</strong> Nhận tới 100 Sao và 2 Kim Cương</li>
                    </ul>
                  </div>

                  <div className="bg-emerald-50 p-2.5 rounded-2xl border border-emerald-200 text-[11px] text-emerald-800 font-bold text-center">
                    Càng chăm chỉ học tập, tủ đồ của bé càng thêm rực rỡ! ✨
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY & CHANGE PASSWORD */}
          {activeTab === 'security' && (
            <div className="max-w-md mx-auto py-2">
              <form onSubmit={handleChangePassword} className="space-y-3.5 bg-slate-50 p-5 rounded-3xl border border-slate-200">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-black text-sm text-slate-800">
                    Chỉnh Sửa Mật Khẩu Tài Khoản
                  </h3>
                </div>

                {pwdMsg && (
                  <div
                    className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                      pwdMsg.type === 'error'
                        ? 'bg-rose-50 border border-rose-200 text-rose-700'
                        : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                    }`}
                  >
                    {pwdMsg.type === 'error' ? (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                    )}
                    <span>{pwdMsg.text}</span>
                  </div>
                )}

                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">
                    Mật khẩu hiện tại *
                  </label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại..."
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-indigo-500 text-xs font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">
                    Mật khẩu mới *
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới (tối thiểu 4 ký tự)..."
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-indigo-500 text-xs font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">
                    Xác nhận mật khẩu mới *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới..."
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-indigo-500 text-xs font-bold bg-white"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    Cập Nhật Mật Khẩu
                  </button>
                </div>
              </form>

              {/* Logout Button */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">
                  Đang đăng nhập: <strong>{account.username}</strong>
                </span>
                <button
                  onClick={() => {
                    sound.playClick();
                    onLogout();
                    onClose();
                  }}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-xs rounded-xl border border-rose-200 cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Đăng Xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
