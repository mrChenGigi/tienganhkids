import React, { useState } from 'react';
import { AuthAccount } from '../types';
import { loadAuthAccounts, saveAuthAccounts, resetPasswordBySecurity } from '../utils/authStorage';
import { sound } from '../utils/audio';
import { 
  X, 
  LogIn, 
  UserPlus, 
  KeyRound, 
  ShieldCheck, 
  Mail, 
  User, 
  Sparkles, 
  Eye, 
  EyeOff, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AuthModalProps {
  currentAccount: AuthAccount | null;
  onLoginSuccess: (account: AuthAccount) => void;
  onClose: () => void;
  initialTab?: 'login' | 'register' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentAccount,
  onLoginSuccess,
  onClose,
  initialTab = 'login'
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);

  // Form states - Login
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Form states - Register
  const [regUsername, setRegUsername] = useState('');
  const [regNickname, setRegNickname] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regGender, setRegGender] = useState<'boy' | 'girl'>('boy');
  const [regSecQuestion, setRegSecQuestion] = useState('Tên con vật cưng của bé là gì?');
  const [regSecAnswer, setRegSecAnswer] = useState('');

  // Form states - Forgot Password
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotAnswer, setForgotAnswer] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');

  // Notifications
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const accounts = loadAuthAccounts();
    const query = loginIdentifier.trim().toLowerCase();
    const acc = accounts.find(
      (a) => a.username.toLowerCase() === query || a.email.toLowerCase() === query
    );

    if (!acc) {
      setErrorMsg('Không tìm thấy tài khoản với tên đăng nhập hoặc email này!');
      sound.playWrong();
      return;
    }

    if (acc.passwordHash !== loginPassword) {
      setErrorMsg('Mật khẩu không chính xác! Vui lòng thử lại hoặc chọn "Quên mật khẩu".');
      sound.playWrong();
      return;
    }

    sound.playSuccess();
    setSuccessMsg(`Chào mừng bé ${acc.nickname} đã đăng nhập thành công!`);
    setTimeout(() => {
      onLoginSuccess(acc);
      onClose();
    }, 700);
  };

  // Handle Register
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regUsername.trim() || !regPassword.trim() || !regNickname.trim() || !regSecAnswer.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ các thông tin bắt buộc!');
      sound.playWrong();
      return;
    }

    const accounts = loadAuthAccounts();
    const queryUsername = regUsername.trim().toLowerCase();
    const existing = accounts.find((a) => a.username.toLowerCase() === queryUsername);
    if (existing) {
      setErrorMsg('Tên đăng nhập này đã có người sử dụng. Hãy chọn một tên khác nhé!');
      sound.playWrong();
      return;
    }

    // Create new account
    const newAcc: AuthAccount = {
      id: `acc_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      username: regUsername.trim(),
      email: regEmail.trim() || `${regUsername.trim()}@behocvui.vn`,
      nickname: regNickname.trim(),
      passwordHash: regPassword,
      securityQuestion: regSecQuestion,
      securityAnswer: regSecAnswer.trim(),
      createdAt: Date.now(),
      chibi: {
        gender: regGender,
        skinTone: regGender === 'boy' ? '#ffd9b3' : '#ffe4cc',
        equipped: {
          hair: regGender === 'boy' ? 'hair_short_neat' : 'hair_twin_tails',
          outfit: regGender === 'boy' ? 'outfit_school_uniform' : 'outfit_princess_dress',
          shoes: regGender === 'boy' ? 'shoes_canvas_classic' : 'shoes_mary_jane',
          hat: regGender === 'boy' ? 'hat_baseball_cap' : 'hat_straw_summer',
          glasses: undefined,
          earrings: regGender === 'girl' ? 'earrings_pearl_classic' : undefined
        },
        ownedWardrobe: regGender === 'boy' 
          ? ['hair_short_neat', 'outfit_school_uniform', 'shoes_canvas_classic', 'hat_baseball_cap']
          : ['hair_twin_tails', 'outfit_princess_dress', 'shoes_mary_jane', 'hat_straw_summer', 'earrings_pearl_classic'],
        pose: 'happy'
      }
    };

    saveAuthAccounts([...accounts, newAcc]);
    sound.playSuccess();
    setSuccessMsg(`Đăng ký thành công tài khoản cho bé ${newAcc.nickname}! Đang đăng nhập...`);
    setTimeout(() => {
      onLoginSuccess(newAcc);
      onClose();
    }, 900);
  };

  // Handle Forgot Password
  const handleForgotPass = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!forgotIdentifier.trim() || !forgotAnswer.trim() || !forgotNewPass.trim()) {
      setErrorMsg('Vui lòng điền đủ thông tin để khôi phục mật khẩu!');
      sound.playWrong();
      return;
    }

    if (forgotNewPass.length < 4) {
      setErrorMsg('Mật khẩu mới phải có ít nhất 4 ký tự!');
      sound.playWrong();
      return;
    }

    const res = resetPasswordBySecurity(forgotIdentifier, forgotAnswer, forgotNewPass);
    if (!res.success) {
      setErrorMsg(res.message);
      sound.playWrong();
    } else {
      sound.playSuccess();
      setSuccessMsg(res.message);
      setTimeout(() => {
        setTab('login');
        setLoginIdentifier(forgotIdentifier);
        setLoginPassword(forgotNewPass);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl border-4 border-indigo-400 shadow-2xl max-w-lg w-full p-5 sm:p-6 relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-indigo-100 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl shadow-md">
              <Sparkles className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-indigo-950">
                Tài Khoản behocvui
              </h2>
              <p className="text-xs text-slate-500 font-semibold">
                Đăng ký & Đăng nhập để sở hữu Nhân Vật Chibi 3D & Kho Đồ!
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

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-4">
          <button
            onClick={() => {
              sound.playClick();
              setTab('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === 'login'
                ? 'bg-white text-indigo-700 shadow-xs scale-102'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-4 h-4" />
            Đăng Nhập
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setTab('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === 'register'
                ? 'bg-white text-indigo-700 shadow-xs scale-102'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Đăng Ký
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setTab('forgot');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === 'forgot'
                ? 'bg-white text-indigo-700 shadow-xs scale-102'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            Quên Mật Khẩu
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-bold animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-700 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab Forms */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* TAB 1: LOGIN */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  Tên đăng nhập hoặc Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Ví dụ: behocvui hoặc congchua@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-hidden text-sm font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  Mật khẩu
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-hidden text-sm font-bold text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick account hint for user */}
              <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-200 text-[11px] text-indigo-900 font-medium">
                💡 <span className="font-bold">Tài khoản mẫu:</span> Tên: <span className="font-bold underline cursor-pointer" onClick={() => { setLoginIdentifier('behocvui'); setLoginPassword('123456'); }}>behocvui</span> (Bé Trai) hoặc <span className="font-bold underline cursor-pointer" onClick={() => { setLoginIdentifier('congchuanho'); setLoginPassword('123456'); }}>congchuanho</span> (Bé Gái), Mật khẩu: <span className="font-bold">123456</span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-sm rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Đăng Nhập Ngay
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">
                    Tên đăng nhập *
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="vd: sieunhanho"
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-indigo-500 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">
                    Biệt hiệu của bé *
                  </label>
                  <input
                    type="text"
                    required
                    value={regNickname}
                    onChange={(e) => setRegNickname(e.target.value)}
                    placeholder="vd: Bé Bắp Dũng Cảm"
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-indigo-500 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Pick Chibi Gender */}
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  Chọn Nhân Vật Chibi 3D Ban Đầu:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <div
                    onClick={() => {
                      sound.playClick();
                      setRegGender('boy');
                    }}
                    className={`p-2.5 rounded-2xl border-2 text-center cursor-pointer transition-all flex items-center justify-center gap-2 ${
                      regGender === 'boy'
                        ? 'border-blue-500 bg-blue-50 text-blue-900 font-black shadow-xs ring-2 ring-blue-300'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-2xl">👦</span>
                    <span className="text-xs">Bé Trai 3D</span>
                  </div>
                  <div
                    onClick={() => {
                      sound.playClick();
                      setRegGender('girl');
                    }}
                    className={`p-2.5 rounded-2xl border-2 text-center cursor-pointer transition-all flex items-center justify-center gap-2 ${
                      regGender === 'girl'
                        ? 'border-pink-500 bg-pink-50 text-pink-900 font-black shadow-xs ring-2 ring-pink-300'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-2xl">👧</span>
                    <span className="text-xs">Bé Gái 3D</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  Email (tùy chọn)
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-8 pr-3 py-2 rounded-xl border-2 border-slate-200 focus:border-indigo-500 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  Mật khẩu *
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-indigo-500 text-xs font-bold"
                />
              </div>

              <div className="bg-amber-50 p-2.5 rounded-2xl border border-amber-200 space-y-2">
                <div className="text-[11px] font-black text-amber-900 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  Câu hỏi bảo mật (Để khôi phục mật khẩu khi quên):
                </div>
                <select
                  value={regSecQuestion}
                  onChange={(e) => setRegSecQuestion(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-amber-300 bg-white text-xs font-semibold text-slate-800"
                >
                  <option value="Tên con vật cưng của bé là gì?">Tên con vật cưng của bé là gì?</option>
                  <option value="Món ăn yêu thích nhất của bé?">Món ăn yêu thích nhất của bé?</option>
                  <option value="Tên trường mầm non hoặc tiểu học của bé?">Tên trường mầm non hoặc tiểu học của bé?</option>
                  <option value="Màu sắc bé thích nhất?">Màu sắc bé thích nhất?</option>
                </select>
                <input
                  type="text"
                  required
                  value={regSecAnswer}
                  onChange={(e) => setRegSecAnswer(e.target.value)}
                  placeholder="Nhập câu trả lời bí mật..."
                  className="w-full px-3 py-1.5 rounded-xl border border-amber-300 bg-white text-xs font-bold text-slate-800"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Đăng Ký Tài Khoản Ngay
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: FORGOT PASSWORD */}
          {tab === 'forgot' && (
            <form onSubmit={handleForgotPass} className="space-y-3.5">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900">
                Nhập tên tài khoản hoặc email cùng câu trả lời bí mật để đặt lại mật khẩu mới ngay lập tức.
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  Tên đăng nhập hoặc Email
                </label>
                <input
                  type="text"
                  required
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  placeholder="Ví dụ: behocvui"
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-indigo-500 text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  Câu trả lời bảo mật bí mật
                </label>
                <input
                  type="text"
                  required
                  value={forgotAnswer}
                  onChange={(e) => setForgotAnswer(e.target.value)}
                  placeholder="Câu trả lời lúc đăng ký (vd: mèo hoặc kem)"
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-indigo-500 text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  required
                  value={forgotNewPass}
                  onChange={(e) => setForgotNewPass(e.target.value)}
                  placeholder="Nhập mật khẩu mới..."
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-indigo-500 text-sm font-bold"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-sm rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  Đặt Lại Mật Khẩu
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
