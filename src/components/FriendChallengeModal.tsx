import React, { useState } from 'react';
import { LeaderboardUser, UserState, WordItem } from '../types';
import { LEVELS } from '../data/curriculum';
import { sound, speakEnglish } from '../utils/audio';
import { triggerFireworks, triggerCenterExplosion } from '../utils/celebration';
import { 
  X, 
  Swords, 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  Volume2, 
  RefreshCw, 
  Award,
  Zap
} from 'lucide-react';

interface FriendChallengeModalProps {
  user: UserState;
  rival: LeaderboardUser;
  onWinChallenge: (rivalId: string, bonusXp: number, bonusCoins: number) => void;
  onClose: () => void;
}

export const FriendChallengeModal: React.FC<FriendChallengeModalProps> = ({
  user,
  rival,
  onWinChallenge,
  onClose
}) => {
  // Collect unlocked words for the duel questions
  const availableWords: WordItem[] = LEVELS
    .filter((l) => l.level <= Math.max(user.level, rival.level))
    .flatMap((l) => l.words);

  const duelWords = availableWords.length >= 3 
    ? [...availableWords].sort(() => 0.5 - Math.random()).slice(0, 3)
    : LEVELS[0].words.slice(0, 3);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isDuelFinished, setIsDuelFinished] = useState(false);

  const currentWord = duelWords[questionIndex];

  // Distractor options
  const otherWords = availableWords.filter((w) => w.id !== currentWord?.id);
  const shuffledOptions = currentWord ? [
    { id: currentWord.id, text: currentWord.word, isCorrect: true, emoji: currentWord.emoji },
    ...shuffledDistractors(otherWords, 2)
  ].sort(() => 0.5 - Math.random()) : [];

  function shuffledDistractors(list: WordItem[], count: number) {
    return [...list]
      .sort(() => 0.5 - Math.random())
      .slice(0, count)
      .map((w) => ({
        id: w.id,
        text: w.word,
        isCorrect: false,
        emoji: w.emoji
      }));
  }

  const handleSelectOption = (option: { id: string; text: string; isCorrect: boolean }) => {
    if (isAnswered) return;
    sound.playClick();
    setSelectedOptionId(option.id);
    setIsAnswered(true);

    if (option.isCorrect) {
      sound.playSuccess();
      setUserScore((s) => s + 1);
    } else {
      sound.playWrong();
    }

    setTimeout(() => {
      if (questionIndex < duelWords.length - 1) {
        setQuestionIndex((idx) => idx + 1);
        setSelectedOptionId(null);
        setIsAnswered(false);
      } else {
        // Finish duel
        setIsDuelFinished(true);
        const finalUserScore = option.isCorrect ? userScore + 1 : userScore;
        const targetToBeat = rival.ghostQuestionsCorrect || 2;

        if (finalUserScore >= targetToBeat) {
          sound.playLevelUp();
          triggerFireworks();
          triggerCenterExplosion();
          onWinChallenge(rival.id, 50, 30);
        } else {
          sound.playWrong();
        }
      }
    }, 1200);
  };

  const ghostTarget = rival.ghostQuestionsCorrect || 2;
  const isWinner = userScore >= ghostTarget;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none overflow-y-auto">
      <div className="bg-white rounded-3xl border-4 border-amber-400 shadow-2xl max-w-xl w-full p-4 sm:p-6 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white text-xl shadow-md">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-800">
                Thách Đấu Điểm Số Bạn Bè
              </h2>
              <p className="text-xs text-slate-500 font-semibold">
                Thi đấu 3 câu hỏi nhanh để vượt mặt bản sao của đối thủ!
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

        {/* 1vs1 Faceoff Arena */}
        <div className="bg-gradient-to-r from-amber-100 via-orange-100 to-rose-100 rounded-3xl p-4 border-2 border-amber-300 shadow-inner mb-4">
          <div className="flex items-center justify-around">
            
            {/* Player Side */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 border-3 border-white shadow-md flex items-center justify-center text-3xl animate-float">
                🦁
              </div>
              <div className="font-black text-xs sm:text-sm text-slate-800 mt-1 max-w-[100px] truncate">
                {user.nickname}
              </div>
              <div className="text-[11px] font-bold text-amber-700 bg-white/80 px-2 py-0.5 rounded-full mt-0.5 shadow-2xs">
                ⭐ {userScore} Điểm
              </div>
            </div>

            {/* VS Badge */}
            <div className="flex flex-col items-center">
              <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black text-sm shadow-md animate-pulse">
                VS
              </div>
              <div className="text-[10px] font-bold text-rose-700 uppercase tracking-widest mt-1">
                3 Câu Hỏi
              </div>
            </div>

            {/* Rival Friend Side */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-400 to-indigo-500 border-3 border-white shadow-md flex items-center justify-center text-3xl animate-float [animation-delay:1s]">
                {rival.mascotEmoji}
              </div>
              <div className="font-black text-xs sm:text-sm text-slate-800 mt-1 max-w-[100px] truncate">
                {rival.nickname}
              </div>
              <div className="text-[11px] font-bold text-purple-700 bg-white/80 px-2 py-0.5 rounded-full mt-0.5 shadow-2xs">
                Mục tiêu: {ghostTarget}/3
              </div>
            </div>

          </div>

          {/* Friend Quote Bubble */}
          {rival.statusQuote && !isDuelFinished && (
            <div className="mt-3 bg-white/90 border border-amber-200 rounded-2xl p-2.5 text-center text-xs text-slate-700 font-medium">
              <span className="font-bold text-purple-700">{rival.nickname} nói:</span> "{rival.statusQuote}"
            </div>
          )}
        </div>

        {/* Duel Question Screen */}
        {!isDuelFinished && currentWord && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
              <span>Câu hỏi {questionIndex + 1}/3</span>
              <span className="text-amber-700">Đạt ≥ {ghostTarget} câu đúng để chiến thắng!</span>
            </div>

            <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-5 text-center">
              <div className="text-5xl mb-2 animate-bounce">{currentWord.emoji}</div>
              <p className="text-base font-bold text-slate-800 mb-2">
                Từ tiếng Anh nào mang nghĩa: <span className="font-black text-amber-600">"{currentWord.meaning}"</span>?
              </p>

              <button
                onClick={() => {
                  sound.playClick();
                  speakEnglish(currentWord.word);
                }}
                className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-xs cursor-pointer mb-3"
              >
                <Volume2 className="w-4 h-4" />
                <span>Nghe phát âm</span>
              </button>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {shuffledOptions.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt)}
                      disabled={isAnswered}
                      className={`p-3.5 rounded-2xl font-black text-sm transition-all cursor-pointer border-2 ${
                        isAnswered && opt.isCorrect
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-102'
                          : isAnswered && isSelected && !opt.isCorrect
                          ? 'bg-rose-500 text-white border-rose-600'
                          : isSelected
                          ? 'bg-amber-500 text-white border-amber-600'
                          : 'bg-white hover:bg-amber-100/50 text-slate-800 border-slate-200'
                      }`}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Duel Result Screen */}
        {isDuelFinished && (
          <div className="text-center py-4">
            <div className="text-6xl mb-2 animate-bounce">
              {isWinner ? '🏆' : '💪'}
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-800">
              {isWinner ? 'BÉ ĐÃ CHIẾN THẮNG ĐỐI THỦ!' : 'CỐ GẮNG LẦN SAU NHÉ!'}
            </h3>

            <p className="text-sm text-slate-600 font-semibold mt-1">
              Bé đạt <span className="text-orange-600 font-black">{userScore}/3 câu đúng</span> (Bản sao {rival.nickname} đạt {ghostTarget}/3 câu)
            </p>

            {isWinner ? (
              <div className="my-4 bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-4 max-w-sm mx-auto text-left shadow-sm">
                <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm mb-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span>Phần Thưởng Vượt Mặt Đối Thủ:</span>
                </div>
                <div className="flex items-center justify-around font-black text-sm text-slate-800">
                  <div>🪙 +30 Sao Vàng</div>
                  <div>✨ +50 Điểm BXH</div>
                  <div>🎉 Thăng Hạng</div>
                </div>
                <p className="text-xs text-slate-600 text-center font-medium mt-2">
                  "{rival.nickname}: Bạn giỏi quá! Lần sau tớ sẽ cố gắng đuổi kịp bạn! 👏"
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 my-4 font-medium">
                Hãy luyện tập thêm từ vựng để vượt qua điểm số của bạn nhé!
              </p>
            )}

            <div className="flex justify-center gap-2.5">
              <button
                onClick={() => {
                  setQuestionIndex(0);
                  setUserScore(0);
                  setSelectedOptionId(null);
                  setIsAnswered(false);
                  setIsDuelFinished(false);
                }}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Thách Đấu Lại</span>
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs sm:text-sm px-6 py-2.5 rounded-2xl shadow-md cursor-pointer"
              >
                Xem Bảng Xếp Hạng 🏆
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
