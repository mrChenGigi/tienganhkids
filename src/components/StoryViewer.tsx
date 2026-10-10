import React, { useState, useEffect, useRef } from 'react';
import { StoryBook, StoryScene } from '../data/stories';
import { sound, speakEnglish } from '../utils/audio';
import { triggerCenterExplosion } from '../utils/celebration';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  ChevronLeft, 
  ChevronRight, 
  Repeat, 
  Subtitles, 
  Sparkles,
  BookOpen,
  Award
} from 'lucide-react';

interface StoryViewerProps {
  story: StoryBook;
  onFinishStory?: (earnedCoins: number, earnedXp: number) => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({ story, onFinishStory }) => {
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSlowSpeed, setIsSlowSpeed] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [showVietnamese, setShowVietnamese] = useState(true);
  const [hasCompleted, setHasCompleted] = useState(false);

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const currentScene: StoryScene = story.scenes[currentSceneIdx] || story.scenes[0];

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Read current scene
  const playCurrentSceneAudio = (onEndedCallback?: () => void) => {
    if (!currentScene) return;
    const speed = isSlowSpeed ? 0.75 : 0.9;
    speakEnglish(currentScene.englishText, speed, () => {
      if (onEndedCallback) {
        onEndedCallback();
      }
    });
  };

  // Auto-play flow
  useEffect(() => {
    if (!isPlaying) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    // Play current scene audio
    playCurrentSceneAudio(() => {
      if (!isPlayingRef.current) return;

      // Wait 1.8 seconds after speech finishes, then move to next scene
      const timer = setTimeout(() => {
        if (!isPlayingRef.current) return;

        if (currentSceneIdx < story.scenes.length - 1) {
          setCurrentSceneIdx((idx) => idx + 1);
        } else {
          // Finished story
          if (isLooping) {
            setCurrentSceneIdx(0);
          } else {
            setIsPlaying(false);
            setHasCompleted(true);
            sound.playSuccess();
            triggerCenterExplosion();
            if (onFinishStory) {
              onFinishStory(25, 20);
            }
          }
        }
      }, 1800);

      return () => clearTimeout(timer);
    });
  }, [currentSceneIdx, isPlaying, isSlowSpeed, isLooping]);

  const togglePlay = () => {
    sound.playClick();
    setIsPlaying((prev) => !prev);
  };

  const handleNext = () => {
    sound.playClick();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (currentSceneIdx < story.scenes.length - 1) {
      setCurrentSceneIdx((i) => i + 1);
    } else if (isLooping) {
      setCurrentSceneIdx(0);
    }
  };

  const handlePrev = () => {
    sound.playClick();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (currentSceneIdx > 0) {
      setCurrentSceneIdx((i) => i - 1);
    }
  };

  const handleReplayCurrent = () => {
    sound.playClick();
    playCurrentSceneAudio();
  };

  return (
    <div className="flex flex-col select-none max-w-2xl mx-auto w-full">
      
      {/* Top Story Title & Scene Progress */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{story.coverEmoji}</span>
            <h3 className="font-black text-sm sm:text-base text-slate-800">
              {story.title}
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-semibold">
            {story.vietnameseTitle}
          </p>
        </div>

        {/* Scene Dots */}
        <div className="flex items-center gap-1.5">
          {story.scenes.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => {
                sound.playClick();
                setCurrentSceneIdx(idx);
              }}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                currentSceneIdx === idx
                  ? 'w-7 bg-amber-500 shadow-xs'
                  : 'w-2.5 bg-slate-200 hover:bg-slate-300'
              }`}
              title={`Trang ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Cartoon Stage Arena */}
      <div
        className={`relative w-full h-72 sm:h-84 rounded-3xl bg-gradient-to-b ${currentScene.backdropGradient} border-4 border-amber-300 shadow-xl overflow-hidden p-6 flex flex-col justify-between transition-colors duration-700`}
      >
        {/* Background Decorative Emojis */}
        <div className="absolute top-4 left-6 text-3xl opacity-60 animate-float">
          {currentScene.illustration.bgElement}
        </div>
        <div className="absolute top-6 right-8 text-3xl opacity-75 animate-float [animation-delay:1.5s]">
          {currentScene.illustration.sceneryEmojis[0]}
        </div>
        <div className="absolute bottom-16 right-6 text-3xl opacity-60 animate-wiggle">
          {currentScene.illustration.sceneryEmojis[1]}
        </div>
        <div className="absolute bottom-16 left-8 text-3xl opacity-60 animate-float [animation-delay:2s]">
          {currentScene.illustration.sceneryEmojis[2]}
        </div>

        {/* Center Animated Character Illustration */}
        <div className="relative my-auto flex items-center justify-center gap-4 z-10">
          <div className="text-7xl sm:text-8xl drop-shadow-lg animate-bounce duration-1000">
            {currentScene.illustration.mainEmoji}
          </div>
          <div className="text-5xl sm:text-6xl drop-shadow animate-float [animation-delay:0.5s]">
            {currentScene.illustration.secondaryEmoji}
          </div>
        </div>

        {/* Audio Wave Ripple when playing */}
        {isPlaying && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-full border border-amber-300 text-xs font-bold text-amber-800 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Đang tự động kể chuyện...</span>
          </div>
        )}

        {/* Scene Number Chip */}
        <div className="absolute bottom-3 left-4 bg-white/80 backdrop-blur-xs px-3 py-0.5 rounded-full text-[11px] font-black text-slate-700 border border-amber-200">
          Cảnh {currentSceneIdx + 1} / {story.scenes.length}
        </div>
      </div>

      {/* English Text & Subtitle Presentation */}
      <div className="bg-white border-2 border-amber-200 rounded-3xl p-4 sm:p-5 my-3 shadow-md text-center">
        {/* English Sentence */}
        <p className="text-base sm:text-xl font-black text-slate-800 tracking-tight leading-relaxed">
          "{currentScene.englishText}"
        </p>

        {/* Vietnamese Translation (if enabled) */}
        {showVietnamese && (
          <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-1.5 italic">
            ({currentScene.vietnameseText})
          </p>
        )}

        {/* Key Vocabulary Chips */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 pt-3 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Từ khóa:
          </span>
          {currentScene.keywords.map((kw, idx) => (
            <span
              key={idx}
              className="text-xs font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg"
            >
              ✨ {kw}
            </span>
          ))}
        </div>
      </div>

      {/* Story Player Controls Bar */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        
        {/* Left Secondary Toggles */}
        <div className="flex items-center gap-1.5">
          {/* Replay Sentence */}
          <button
            onClick={handleReplayCurrent}
            title="Nghe lại câu này"
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed Toggle (Turtle vs Normal) */}
          <button
            onClick={() => {
              sound.playClick();
              setIsSlowSpeed((prev) => !prev);
            }}
            title={isSlowSpeed ? 'Đang đọc chậm (0.75x)' : 'Tốc độ bình thường (0.9x)'}
            className={`px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
              isSlowSpeed
                ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200'
            }`}
          >
            {isSlowSpeed ? '🐢 Chậm 0.75x' : '🐰 Vừa 0.9x'}
          </button>

          {/* Subtitle Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              setShowVietnamese((prev) => !prev);
            }}
            title="Bật/Tắt phụ đề tiếng Việt"
            className={`p-2 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
              showVietnamese
                ? 'bg-blue-500 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            <Subtitles className="w-4 h-4" />
          </button>

          {/* Loop / Continuous Repeat */}
          <button
            onClick={() => {
              sound.playClick();
              setIsLooping((prev) => !prev);
            }}
            title={isLooping ? 'Đang bật lặp lại liên tục (Ru ngủ/Nghe thụ động)' : 'Tắt lặp lại'}
            className={`p-2 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
              isLooping
                ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Center Main Play / Pause & Nav */}
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <button
            onClick={handlePrev}
            disabled={currentSceneIdx === 0}
            className={`p-2 rounded-xl transition-all ${
              currentSceneIdx === 0
                ? 'text-slate-300 cursor-not-allowed'
                : 'bg-white hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Big Play / Pause Button */}
          <button
            onClick={togglePlay}
            className={`flex items-center gap-2 font-black text-xs sm:text-sm px-6 py-2.5 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer ${
              isPlaying
                ? 'bg-rose-500 hover:bg-rose-600 text-white'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Tạm Dừng</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Tự Động Kể Chuyện ▶</span>
              </>
            )}
          </button>

          <button
            onClick={handleNext}
            disabled={currentSceneIdx === story.scenes.length - 1 && !isLooping}
            className={`p-2 rounded-xl transition-all ${
              currentSceneIdx === story.scenes.length - 1 && !isLooping
                ? 'text-slate-300 cursor-not-allowed'
                : 'bg-white hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* Passive Listening Reward Toast */}
      {hasCompleted && (
        <div className="mt-3 bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3 flex items-center justify-between text-xs text-emerald-900 font-bold animate-bounce">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <span>Tuyệt vời! Bé đã nghe trọn vẹn câu chuyện để rèn luyện thính giác tiếng Anh!</span>
          </div>
          <div className="flex items-center gap-2 text-amber-800">
            <span>🪙 +25 Xu</span>
            <span>✨ +20 XP</span>
          </div>
        </div>
      )}

    </div>
  );
};
