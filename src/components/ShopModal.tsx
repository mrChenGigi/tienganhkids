import React, { useState } from 'react';
import { UserState, UserItem, EquippedItems } from '../types';
import { SHOP_ITEMS } from '../data/shopItems';
import { MascotDisplay } from './MascotDisplay';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  X, 
  ShoppingBag, 
  Check, 
  Sparkles, 
  Crown, 
  Shirt, 
  Wand2, 
  PawPrint,
  Star 
} from 'lucide-react';

interface ShopModalProps {
  user: UserState;
  onBuyItem: (item: UserItem) => void;
  onEquipItem: (type: keyof EquippedItems, itemId?: string) => void;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  user,
  onBuyItem,
  onEquipItem,
  onClose
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'hat' | 'outfit' | 'wand' | 'companion'>('all');

  const filteredItems = activeCategory === 'all'
    ? SHOP_ITEMS
    : SHOP_ITEMS.filter((i) => i.type === activeCategory);

  const handleBuy = (item: UserItem) => {
    // Check balance
    if (item.currency === 'coins' && user.coins < item.price) {
      sound.playWrong();
      return;
    }
    if (item.currency === 'gems' && user.gems < item.price) {
      sound.playWrong();
      return;
    }

    sound.playCoin();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
    onBuyItem(item);
  };

  const handleToggleEquip = (item: UserItem) => {
    sound.playClick();
    const type = item.type as keyof EquippedItems;
    const isCurrentlyEquipped = user.equipped[type] === item.id;
    if (isCurrentlyEquipped) {
      // Unequip
      onEquipItem(type, undefined);
    } else {
      // Equip
      onEquipItem(type, item.id);
      sound.playStar();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl border-4 border-rose-300 shadow-2xl max-w-3xl w-full p-4 sm:p-6 relative max-h-[92vh] flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rose-100 pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white text-2xl shadow-md">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                Kho Đồ Thế Giới Mở
              </h2>
              <p className="text-xs text-slate-500 font-semibold">
                Sử dụng Sao Vàng & Huy Hiệu để mua sắm phụ kiện ngầu cho linh vật!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Balance */}
            <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 px-3 py-1 rounded-2xl text-xs sm:text-sm font-extrabold text-amber-900 shadow-xs">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                {user.coins}
              </span>
              <span>💎 {user.gems}</span>
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

        {/* Mascot Live Dressing Room Preview */}
        <div className="bg-gradient-to-r from-amber-50 via-pink-50 to-purple-50 rounded-2xl border-2 border-pink-200 p-3 mb-4 flex items-center justify-around">
          <div className="text-center sm:text-left">
            <span className="text-xs font-bold text-pink-700 uppercase tracking-wider">
              Phòng Thay Đồ Thần Tiên 🪞
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-800">
              Linh Vật: {user.nickname}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Bấm vào các món đồ đã mua bên dưới để trang bị ngay!
            </p>
          </div>

          <div className="shrink-0">
            <MascotDisplay
              mascotId={user.mascotId}
              equipped={user.equipped}
              size="md"
              showSpeechBubble={false}
            />
          </div>
        </div>

        {/* Filter Categories Tabs */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
          {[
            { id: 'all', label: 'Tất Cả', icon: Sparkles },
            { id: 'hat', label: 'Mũ & Nón', icon: Crown },
            { id: 'outfit', label: 'Trang Phục', icon: Shirt },
            { id: 'wand', label: 'Phụ Kiện', icon: Wand2 },
            { id: 'companion', label: 'Thú Cưng', icon: PawPrint },
          ].map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  sound.playClick();
                  setActiveCategory(cat.id as typeof activeCategory);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Items Catalog Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredItems.map((item) => {
              const isOwned = user.inventory.includes(item.id);
              const type = item.type as keyof EquippedItems;
              const isEquipped = user.equipped[type] === item.id;
              const canAfford =
                item.currency === 'coins'
                  ? user.coins >= item.price
                  : user.gems >= item.price;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border-2 p-3 text-center flex flex-col justify-between transition-all duration-200 ${
                    isEquipped
                      ? 'border-emerald-500 ring-2 ring-emerald-200 shadow-md'
                      : isOwned
                      ? 'border-amber-300 shadow-xs'
                      : 'border-slate-200 hover:border-pink-300 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="text-4xl sm:text-5xl my-2 filter drop-shadow animate-float">
                      {item.emoji}
                    </div>
                    <h4 className="font-black text-xs sm:text-sm text-slate-800 line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium line-clamp-2 my-1">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100">
                    {isOwned ? (
                      <button
                        onClick={() => handleToggleEquip(item)}
                        className={`w-full py-1.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          isEquipped
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm'
                            : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                        }`}
                      >
                        {isEquipped ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Đang Dùng</span>
                          </>
                        ) : (
                          <span>Trang Bị ✨</span>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuy(item)}
                        disabled={!canAfford}
                        className={`w-full py-1.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          canAfford
                            ? 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-sm active:scale-95'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <span>{item.currency === 'coins' ? '⭐' : '💎'}</span>
                        <span>{item.price}</span>
                        <span>Mua</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
