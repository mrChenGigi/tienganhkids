import { AuthAccount, ChibiCharacter } from '../types';

const STORAGE_KEY_AUTH_USERS = 'behocvui_auth_accounts_v1';
const STORAGE_KEY_CURRENT_AUTH = 'behocvui_current_auth_id_v1';

export const createDefaultChibi = (gender: 'boy' | 'girl' = 'boy'): ChibiCharacter => {
  if (gender === 'boy') {
    return {
      gender: 'boy',
      skinTone: '#ffd9b3',
      equipped: {
        hair: 'hair_short_neat',
        outfit: 'outfit_school_uniform',
        shoes: 'shoes_canvas_classic',
        hat: 'hat_baseball_cap',
        glasses: undefined,
        earrings: undefined
      },
      ownedWardrobe: [
        'hair_short_neat',
        'outfit_school_uniform',
        'shoes_canvas_classic',
        'hat_baseball_cap'
      ],
      pose: 'happy'
    };
  } else {
    return {
      gender: 'girl',
      skinTone: '#ffe4cc',
      equipped: {
        hair: 'hair_twin_tails',
        outfit: 'outfit_princess_dress',
        shoes: 'shoes_mary_jane',
        hat: 'hat_straw_summer',
        glasses: undefined,
        earrings: 'earrings_pearl_classic'
      },
      ownedWardrobe: [
        'hair_twin_tails',
        'outfit_princess_dress',
        'shoes_mary_jane',
        'hat_straw_summer',
        'earrings_pearl_classic'
      ],
      pose: 'happy'
    };
  }
};

const DEFAULT_ACCOUNTS: AuthAccount[] = [
  {
    id: 'user_demo_1',
    username: 'behocvui',
    email: 'behocvui@gmail.com',
    nickname: 'Bé Khủng Long',
    passwordHash: '123456',
    securityQuestion: 'Tên con vật cưng của bé là gì?',
    securityAnswer: 'mèo',
    createdAt: Date.now() - 86400000 * 7,
    chibi: createDefaultChibi('boy')
  },
  {
    id: 'user_demo_2',
    username: 'congchuanho',
    email: 'congchua@gmail.com',
    nickname: 'Công Chúa Nhỏ',
    passwordHash: '123456',
    securityQuestion: 'Món ăn yêu thích nhất của bé?',
    securityAnswer: 'kem',
    createdAt: Date.now() - 86400000 * 3,
    chibi: createDefaultChibi('girl')
  }
];

export const loadAuthAccounts = (): AuthAccount[] => {
  if (typeof window === 'undefined') return DEFAULT_ACCOUNTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH_USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_AUTH_USERS, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    const accounts: AuthAccount[] = JSON.parse(raw);
    return Array.isArray(accounts) && accounts.length > 0 ? accounts : DEFAULT_ACCOUNTS;
  } catch {
    return DEFAULT_ACCOUNTS;
  }
};

export const saveAuthAccounts = (accounts: AuthAccount[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_AUTH_USERS, JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to save auth accounts', err);
  }
};

export const getCurrentAuthAccount = (): AuthAccount | null => {
  if (typeof window === 'undefined') return null;
  try {
    const currentId = localStorage.getItem(STORAGE_KEY_CURRENT_AUTH);
    if (!currentId) return null;
    const accounts = loadAuthAccounts();
    return accounts.find((a) => a.id === currentId) || null;
  } catch {
    return null;
  }
};

export const setCurrentAuthAccount = (account: AuthAccount | null) => {
  if (typeof window === 'undefined') return;
  try {
    if (account) {
      localStorage.setItem(STORAGE_KEY_CURRENT_AUTH, account.id);
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_AUTH);
    }
  } catch (err) {
    console.error('Failed to set current auth account', err);
  }
};

export const updateAccountChibi = (accountId: string, chibi: ChibiCharacter) => {
  const accounts = loadAuthAccounts();
  const updated = accounts.map((acc) => {
    if (acc.id === accountId) {
      return { ...acc, chibi };
    }
    return acc;
  });
  saveAuthAccounts(updated);
};

export const updateAccountPassword = (accountId: string, newPassword: string): boolean => {
  const accounts = loadAuthAccounts();
  let found = false;
  const updated = accounts.map((acc) => {
    if (acc.id === accountId) {
      found = true;
      return { ...acc, passwordHash: newPassword };
    }
    return acc;
  });
  if (found) {
    saveAuthAccounts(updated);
  }
  return found;
};

export const resetPasswordBySecurity = (
  usernameOrEmail: string,
  answer: string,
  newPass: string
): { success: boolean; message: string } => {
  const accounts = loadAuthAccounts();
  const lowerQuery = usernameOrEmail.trim().toLowerCase();
  const acc = accounts.find(
    (a) => a.username.toLowerCase() === lowerQuery || a.email.toLowerCase() === lowerQuery
  );

  if (!acc) {
    return { success: false, message: 'Không tìm thấy tài khoản với tên đăng nhập hoặc email này!' };
  }

  if (acc.securityAnswer.trim().toLowerCase() !== answer.trim().toLowerCase()) {
    return { success: false, message: 'Câu trả lời bảo mật chưa chính xác. Vui lòng thử lại!' };
  }

  acc.passwordHash = newPass;
  saveAuthAccounts(accounts);
  return { success: true, message: 'Đổi mật khẩu thành công! Bạn có thể đăng nhập ngay.' };
};
