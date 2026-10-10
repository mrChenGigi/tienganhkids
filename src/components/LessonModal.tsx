import React, { useState, useEffect } from 'react';
import { LevelData, WordItem, QuizQuestion } from '../types';
import { SpeechPractice } from './SpeechPractice';
import { sound, speakEnglish, speakVietnamese } from '../utils/audio';
import { triggerFireworks, triggerCenterExplosion, triggerGoldenShower } from '../utils/celebration';
import { StoryViewer } from './StoryViewer';
import { getStoryByLevel } from '../data/stories';
import confetti from 'canvas-confetti';
import { 
  X, 
  Volume2, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Award, 
  Sparkles,
  BookOpen,
  HelpCircle
} from 'lucide-react';

interface LessonModalProps {
  levelData: LevelData;
  onCompleteLevel: (level: number, stars: number, coins: number, badgeId: string) => void;
  onAddWordPracticeReward: (stars: number, coins: number) => void;
  onWordLearned?: (wordId: string) => void;
  onStoryFinished?: (earnedCoins: number, earnedXp: number) => void;
  onClose: () => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  levelData,
  onCompleteLevel,
  onAddWordPracticeReward,
  onWordLearned,
  onStoryFinished,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'flashcards' | 'practice' | 'story' | 'quiz'>('flashcards');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const currentStory = getStoryByLevel(levelData.level);

  // Quiz state
  const [quizLength, setQuizLength] = useState<number>(10);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const activeQuizzes = levelData.quizzes.slice(0, quizLength);
  const currentWord: WordItem = levelData.words[currentWordIndex] || levelData.words[0];
  const currentQuiz: QuizQuestion | undefined = activeQuizzes[quizIndex];

  // Track word learned
  useEffect(() => {
    if (currentWord && onWordLearned) {
      onWordLearned(currentWord.id);
    }
  }, [currentWordIndex, currentWord, onWordLearned]);

  const handleNextWord = () => {
    sound.playClick();
    if (currentWordIndex < levelData.words.length - 1) {
      setCurrentWordIndex((idx) => idx + 1);
    }
  };

  const handlePrevWord = () => {
    sound.playClick();
    if (currentWordIndex > 0) {
      setCurrentWordIndex((idx) => idx - 1);
    }
  };

  const handleSelectQuizOption = (optionId: string) => {
    if (isQuizSubmitted || !currentQuiz) return;
    sound.playClick();
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuiz.id]: optionId
    }));
  };

  const handleNextQuizQuestion = () => {
    sound.playClick();
    if (quizIndex < activeQuizzes.length - 1) {
      setQuizIndex((i) => i + 1);
    } else {
      // Finish quiz & calculate score
      let correctCount = 0;
      activeQuizzes.forEach((q) => {
        const chosen = selectedAnswers[q.id];
        const correctOpt = q.options.find((o) => o.isCorrect);
        if (chosen === correctOpt?.id) {
          correctCount++;
        }
      });

      const total = activeQuizzes.length;
      const percentage = Math.round((correctCount / total) * 100);
      let stars = 1;
      if (percentage >= 80) stars = 3;
      else if (percentage >= 60) stars = 2;

      setQuizScore(percentage);
      setIsQuizSubmitted(true);

      if (percentage >= 60) {
        sound.playLevelUp();
        triggerFireworks();
        triggerCenterExplosion();
        if (percentage === 100) {
          triggerGoldenShower();
        }
        onCompleteLevel(
          levelData.level,
          stars,
          levelData.coinReward,
          levelData.badgeReward.id
        );
      } else {
        sound.playWrong();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl border-4 border-amber-300 shadow-2xl max-w-2xl w-full p-4 sm:p-6 relative max-h-[92vh] flex flex-col justify-between">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-amber-100 pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${levelData.themeColor} flex items-center justify-center text-white text-2xl shadow-md`}>
              {levelData.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full">
                  Cấp độ {levelData.level}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {levelData.words.length} từ vựng
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-800">
                {levelData.title}
              </h2>
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 bg-amber-50 p-1 rounded-2xl mb-4 border border-amber-200">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('flashcards');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              activeTab === 'flashcards'
                ? 'bg-amber-400 text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Thẻ Từ Vựng</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('practice');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              activeTab === 'practice'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Luyện Phát Âm</span>
            <span className="sm:hidden">Phát Âm</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('story');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              activeTab === 'story'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Truyện Kể</span>
            <span className="sm:hidden">Truyện</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('quiz');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              activeTab === 'quiz'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Kiểm Tra Năng Lực</span>
            <span className="sm:hidden">Kiểm Tra</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* TAB 1: FLASHCARDS */}
          {activeTab === 'flashcards' && (
            <div className="flex flex-col items-center">
              {/* Flashcard container */}
              <div className="w-full bg-gradient-to-br from-amber-50 via-white to-orange-50 border-3 border-amber-300 rounded-3xl p-6 text-center shadow-lg relative my-2">
                <div className="text-7xl sm:text-8xl my-3 filter drop-shadow animate-float">
                  {currentWord.emoji}
                </div>

                <div className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight mb-1">
                  {currentWord.word}
                </div>

                <div className="text-base font-semibold text-amber-600 font-mono mb-2">
                  {currentWord.phonetic}
                </div>

                <div className="text-lg font-bold text-slate-700 bg-amber-100/70 inline-block px-4 py-1 rounded-full mb-4">
                  {currentWord.meaning}
                </div>

                {/* Example Sentence Box */}
                <div className="bg-white/80 border border-amber-200 rounded-2xl p-3 max-w-md mx-auto text-left shadow-xs">
                  <div className="text-xs text-amber-800 font-bold mb-1">Ví dụ câu:</div>
                  <div className="text-sm font-semibold text-slate-800">
                    "{currentWord.example}"
                  </div>
                  <div className="text-xs text-slate-500 italic mt-0.5">
                    ({currentWord.exampleMeaning})
                  </div>
                </div>

                {/* Audio buttons */}
                <div className="flex items-center justify-center gap-3 mt-4">
                  <button
                    onClick={() => {
                      sound.playClick();
                      speakEnglish(currentWord.word);
                    }}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-extrabold text-sm px-5 py-2.5 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <Volume2 className="w-5 h-5" />
                    <span>Nghe Chuẩn</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      speakEnglish(currentWord.word, 0.65);
                    }}
                    title="Nghe tốc độ chậm"
                    className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-4 py-2.5 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <span>🐢 Nghe Chậm</span>
                  </button>
                </div>
              </div>

              {/* Navigation Arrows */}
              <div className="flex items-center justify-between w-full mt-3">
                <button
                  onClick={handlePrevWord}
                  disabled={currentWordIndex === 0}
                  className={`flex items-center gap-1 font-bold text-xs sm:text-sm px-4 py-2 rounded-2xl transition-all cursor-pointer ${
                    currentWordIndex === 0
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Từ trước</span>
                </button>

                <span className="text-xs font-bold text-slate-500">
                  {currentWordIndex + 1} / {levelData.words.length}
                </span>

                <button
                  onClick={handleNextWord}
                  disabled={currentWordIndex === levelData.words.length - 1}
                  className={`flex items-center gap-1 font-bold text-xs sm:text-sm px-4 py-2 rounded-2xl transition-all cursor-pointer ${
                    currentWordIndex === levelData.words.length - 1
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-amber-400 hover:bg-amber-500 text-slate-900 border border-amber-500 font-extrabold'
                  }`}
                >
                  <span>Từ tiếp theo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SPEECH PRACTICE & REPEAT */}
          {activeTab === 'practice' && (
            <div className="py-2">
              <SpeechPractice
                word={currentWord}
                onSuccess={(stars, coins) => {
                  onAddWordPracticeReward(stars, coins);
                }}
              />

              {/* Switch word selector */}
              <div className="mt-4 max-h-36 overflow-y-auto p-2 flex flex-wrap justify-center gap-2 border border-slate-200 rounded-2xl bg-slate-50/70 shadow-inner">
                {levelData.words.map((w, idx) => (
                  <button
                    key={w.id}
                    onClick={() => {
                      sound.playClick();
                      setCurrentWordIndex(idx);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                      currentWordIndex === idx
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{w.emoji}</span>
                    <span>{w.word}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ENGLISH STORY (PASSIVE LISTENING) */}
          {activeTab === 'story' && (
            <div className="py-2">
              <StoryViewer
                story={currentStory}
                onFinishStory={onStoryFinished}
              />
            </div>
          )}

          {/* TAB 4: LEVEL QUIZ */}
          {activeTab === 'quiz' && (
            <div className="py-2">
              {!isQuizSubmitted && currentQuiz && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 font-bold">
                    <div className="flex items-center gap-2">
                      <span className="bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full font-black">
                        Câu hỏi {quizIndex + 1}/{activeQuizzes.length}
                      </span>
                      <span>Đạt ≥ 60% để mở khóa cấp độ!</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 p-1 rounded-xl">
                      <button
                        onClick={() => {
                          sound.playClick();
                          setQuizLength(10);
                          setQuizIndex(0);
                          setSelectedAnswers({});
                        }}
                        className={`px-2.5 py-1 rounded-lg font-extrabold text-[11px] transition-all cursor-pointer ${
                          quizLength === 10
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'text-purple-700 hover:bg-purple-100'
                        }`}
                      >
                        10 Câu Nhanh ⚡
                      </button>
                      <button
                        onClick={() => {
                          sound.playClick();
                          setQuizLength(50);
                          setQuizIndex(0);
                          setSelectedAnswers({});
                        }}
                        className={`px-2.5 py-1 rounded-lg font-extrabold text-[11px] transition-all cursor-pointer ${
                          quizLength === 50
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'text-purple-700 hover:bg-purple-100'
                        }`}
                      >
                        Toàn Bộ 50 Câu 🎯
                      </button>
                    </div>
                  </div>

                  <div className="bg-purple-50 border-2 border-purple-200 rounded-3xl p-5 text-center">
                    <p className="text-base sm:text-lg font-black text-slate-800 mb-2">
                      {currentQuiz.question}
                    </p>

                    {currentQuiz.audioPrompt && (
                      <button
                        onClick={() => {
                          sound.playClick();
                          speakEnglish(currentQuiz.audioPrompt || '');
                        }}
                        className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer mb-3"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>Nghe gợi ý phát âm</span>
                      </button>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
                      {currentQuiz.options.map((opt) => {
                        const isSelected = selectedAnswers[currentQuiz.id] === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleSelectQuizOption(opt.id)}
                            className={`p-3.5 rounded-2xl font-bold text-sm text-left flex items-center gap-3 transition-all cursor-pointer border-2 ${
                              isSelected
                                ? 'bg-purple-600 text-white border-purple-700 shadow-md scale-102'
                                : 'bg-white hover:bg-purple-100/50 text-slate-800 border-purple-200'
                            }`}
                          >
                            {opt.emoji && <span className="text-2xl">{opt.emoji}</span>}
                            <span className="flex-1">{opt.text}</span>
                            {isSelected && <CheckCircle2 className="w-5 h-5 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleNextQuizQuestion}
                      disabled={!selectedAnswers[currentQuiz.id]}
                      className={`font-black text-xs sm:text-sm px-6 py-3 rounded-2xl transition-all shadow-md cursor-pointer ${
                        !selectedAnswers[currentQuiz.id]
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white active:scale-95'
                      }`}
                    >
                      {quizIndex < activeQuizzes.length - 1 ? 'Câu tiếp theo ➔' : 'Hoàn Thành Bài Thi 🌟'}
                    </button>
                  </div>
                </div>
              )}

              {/* Quiz Result Screen */}
              {isQuizSubmitted && (
                <div className="text-center py-6 animate-bounce duration-1000">
                  <div className="text-6xl mb-2">
                    {quizScore >= 60 ? '🏆' : '💪'}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-800">
                    {quizScore >= 60 ? 'Chúc Mừng Bé Xuất Sắc!' : 'Cố Lên Nhé Bé Yêu!'}
                  </h3>
                  <p className="text-sm font-semibold text-slate-600 mt-1">
                    Bé đạt kết quả: <span className="font-extrabold text-purple-600">{quizScore}%</span>
                  </p>

                  {quizScore >= 60 ? (
                    <div className="my-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl p-4 max-w-sm mx-auto text-left shadow-sm">
                      <div className="flex items-center gap-2 font-bold text-amber-900 text-sm mb-2">
                        <Award className="w-5 h-5 text-amber-600" />
                        <span>Phần Thưởng Mở Khóa Cấp Độ:</span>
                      </div>
                      <div className="flex items-center justify-around font-black text-sm text-slate-800">
                        <div>🪙 +{levelData.coinReward} Sao Vàng</div>
                        <div>✨ +{levelData.xpReward} XP</div>
                        <div>{levelData.badgeReward.emoji} Huy Hiệu</div>
                      </div>
                      <div className="mt-2 text-xs text-slate-600 text-center font-medium">
                        "{levelData.badgeReward.name}" - {levelData.badgeReward.description}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-rose-600 font-bold my-4">
                      Bé hãy ôn lại các từ vựng và thử sức lại để mở khóa cấp độ nhé!
                    </p>
                  )}

                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedAnswers({});
                        setQuizIndex(0);
                        setIsQuizSubmitted(false);
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl cursor-pointer"
                    >
                      Làm Lại Bài Kiểm Tra
                    </button>
                    <button
                      onClick={() => {
                        sound.playClick();
                        onClose();
                      }}
                      className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold text-xs sm:text-sm px-6 py-2.5 rounded-2xl shadow-md cursor-pointer"
                    >
                      Tiếp Tục Phiêu Lưu 🚀
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
