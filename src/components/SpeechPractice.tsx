import React, { useState, useEffect, useRef } from 'react';
import { WordItem } from '../types';
import { sound, speakEnglish, speakVietnamese } from '../utils/audio';
import { triggerCenterExplosion } from '../utils/celebration';
import confetti from 'canvas-confetti';
import { Mic, MicOff, Volume2, Sparkles, CheckCircle2, RotateCcw, Award } from 'lucide-react';

interface SpeechPracticeProps {
  word: WordItem;
  onSuccess: (stars: number, coins: number) => void;
}

export const SpeechPractice: React.FC<SpeechPracticeProps> = ({ word, onSuccess }) => {
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState<string>('');
  const [resultScore, setResultScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [hasMicSupport, setHasMicSupport] = useState(true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check speech recognition support
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setHasMicSupport(false);
    }
  }, []);

  const handleStartListening = () => {
    sound.playClick();
    setSpokenText('');
    setResultScore(null);
    setFeedback('Bé hãy đọc to từ "' + word.word + '" nhé...');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Friendly audio simulation for browsers without Web Speech recognition
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        evaluatePronunciation(word.word);
      }, 2000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 3;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        setSpokenText(transcript);
        evaluatePronunciation(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        // Fallback simulation so child doesn't feel frustrated
        evaluatePronunciation(word.word);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
      evaluatePronunciation(word.word);
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const evaluatePronunciation = (userVoice: string) => {
    const target = word.word.toLowerCase().trim();
    const cleanUser = userVoice.toLowerCase().trim();

    let stars = 3;
    let earnedCoins = 15;
    let msg = 'Xuất sắc! Bé phát âm chuẩn như người bản xứ! 🌟🌟🌟';

    if (cleanUser === target || cleanUser.includes(target) || target.includes(cleanUser)) {
      stars = 3;
      earnedCoins = 20;
      msg = 'Quá tuyệt vời! Bé phát âm cực kỳ chuẩn xác! 🎉';
      sound.playSuccess();
      triggerCenterExplosion();
    } else {
      // Encouraging partial score
      stars = 2;
      earnedCoins = 10;
      msg = 'Rất tốt! Bé đã cố gắng tuyệt vời! Đọc thêm lần nữa cho thật vang nhé! 👏';
      sound.playSuccess();
    }

    setResultScore(stars);
    setFeedback(msg);
    onSuccess(stars, earnedCoins);
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl p-5 text-center shadow-inner">
      <div className="flex items-center justify-center gap-2 mb-2 text-amber-800 font-bold text-sm">
        <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
        <span>Thử Thách: Nhắc Lại & Luyện Phát Âm</span>
      </div>

      <p className="text-xs text-slate-600 mb-4">
        Bé hãy nghe mẫu, sau đó bấm chiếc mic màu cam và đọc lại từ <span className="font-bold text-amber-700">"{word.word}"</span> để nhận điểm thưởng!
      </p>

      {/* Target Word Display */}
      <div className="mb-4">
        <div className="text-4xl mb-1">{word.emoji}</div>
        <div className="text-2xl font-black text-slate-800">{word.word}</div>
        <div className="text-sm font-semibold text-amber-600 font-mono">{word.phonetic}</div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3 mb-4">
        {/* Listen Model Button */}
        <button
          onClick={() => {
            sound.playClick();
            speakEnglish(word.word);
          }}
          className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-md transition-all cursor-pointer"
        >
          <Volume2 className="w-4 h-4" />
          <span>Nghe Mẫu</span>
        </button>

        {/* Listen Slow Button */}
        <button
          onClick={() => {
            sound.playClick();
            speakEnglish(word.word, 0.65);
          }}
          title="Nghe tốc độ chậm"
          className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs sm:text-sm px-3 py-2.5 rounded-2xl shadow-md transition-all cursor-pointer"
        >
          <span>🐢 Chậm</span>
        </button>

        {/* Record / Speak Button */}
        <button
          onClick={isListening ? handleStopListening : handleStartListening}
          className={`flex items-center gap-2 text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer ${
            isListening
              ? 'bg-rose-500 animate-pulse ring-4 ring-rose-200'
              : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 ring-4 ring-orange-100'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5 animate-spin" />
              <span>Đang Lắng Nghe...</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              <span>Bé Đọc Lại Ngay!</span>
            </>
          )}
        </button>
      </div>

      {/* Dynamic Voice Waves Animation */}
      {isListening && (
        <div className="flex items-center justify-center gap-1.5 py-2">
          <div className="w-1.5 h-6 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-1.5 h-9 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-1.5 h-12 bg-amber-500 rounded-full animate-bounce" />
          <div className="w-1.5 h-8 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-1.5 h-5 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
        </div>
      )}

      {/* Result feedback */}
      {resultScore !== null && (
        <div className="mt-3 bg-white border border-amber-300 rounded-2xl p-3 shadow-xs animate-float">
          <div className="flex items-center justify-center gap-1 text-2xl text-amber-400 mb-1">
            {Array.from({ length: resultScore }).map((_, i) => (
              <span key={i} className="animate-bounce" style={{ animationDelay: `${i * 150}ms` }}>
                ⭐
              </span>
            ))}
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-800">{feedback}</p>
          {spokenText && (
            <p className="text-[11px] text-slate-500 mt-0.5">
              Bé đã nói: <span className="font-semibold text-emerald-600">"{spokenText}"</span>
            </p>
          )}
          <div className="mt-2 flex items-center justify-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 py-1 px-3 rounded-full w-max mx-auto">
            <span>+15 Sao Vàng & Điểm kinh nghiệm</span>
            <span>🪙</span>
          </div>
        </div>
      )}
    </div>
  );
};
