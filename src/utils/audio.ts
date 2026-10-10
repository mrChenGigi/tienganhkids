// Web Audio API Synthesizer & Web Speech API Utilities

class KidSoundEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  // Play a pleasant button click
  public playClick() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  // Pop sound for bubbles
  public playPop() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  private lastHoverSoundTime: number = 0;

  // Fun bubbly pop sound when hovering buttons in main menu
  public playHoverPop(customFreq?: number) {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Micro-throttle to keep pops crisp and avoid distortion during rapid mouse movements
    if (now - this.lastHoverSoundTime < 0.04) return;
    this.lastHoverSoundTime = now;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Lively playful pitch variation (520Hz - 640Hz jumping to 900Hz - 1100Hz)
    const baseFreq = customFreq || (520 + Math.random() * 120);
    const targetFreq = baseFreq * (1.7 + Math.random() * 0.25);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.05);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Coin collect ding
  public playCoin() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc1.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    osc2.frequency.setValueAtTime(1318.51, now);
    osc2.frequency.setValueAtTime(1760.00, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  }

  // Sparkle star reward
  public playStar() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = this.ctx.currentTime + idx * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.18, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.2);
    });
  }

  // Success chime
  public playSuccess() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const chord = [440, 554.37, 659.25, 880]; // A major
    chord.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = this.ctx.currentTime + idx * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.4);
    });
  }

  // Gentle boing when wrong
  public playWrong() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  // Big Victory / Level-Up Fanfare
  public playLevelUp() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const melody = [
      { f: 523.25, d: 0.12 }, // C5
      { f: 659.25, d: 0.12 }, // E5
      { f: 783.99, d: 0.12 }, // G5
      { f: 1046.50, d: 0.35 } // C6
    ];

    let t = this.ctx.currentTime;
    melody.forEach((note) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + note.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + note.d);
      t += note.d * 0.9;
    });
  }

  public playTada() {
    this.playLevelUp();
  }

  public playCorrect() {
    this.playSuccess();
  }

  private lastLaughIndex: number = 0;

  // Cheerful kid/mascot laughing sound (Hihihi! Hahaha!)
  public playLaugh() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const laughStyle = (this.lastLaughIndex++) % 3;

    if (laughStyle === 0) {
      // Style 1: Playful high-pitched giggle: "Hi-hi-hi-hi-hi!" (5 upbeat bursts)
      const pitches = [580, 680, 780, 880, 750];
      pitches.forEach((freq, idx) => {
        if (!this.ctx) return;
        const start = now + idx * 0.085;
        const dur = 0.075;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';

        // Sweet upward chirp for giggle burst
        osc.frequency.setValueAtTime(freq * 0.92, start);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.25, start + dur * 0.5);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.05, start + dur);

        gain.gain.setValueAtTime(0.01, start);
        gain.gain.linearRampToValueAtTime(0.25, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.005, start + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + dur);
      });
    } else if (laughStyle === 1) {
      // Style 2: Cheerful bouncy chuckle: "Ha-ha-ha-ha-ha!" (bubbly melody)
      const notes = [
        { f: 540, d: 0.085 },
        { f: 660, d: 0.085 },
        { f: 740, d: 0.09 },
        { f: 850, d: 0.095 },
        { f: 960, d: 0.11 },
        { f: 820, d: 0.12 }
      ];
      let t = now;
      notes.forEach((note) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const subOsc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        subOsc.type = 'triangle';

        osc.frequency.setValueAtTime(note.f, t);
        osc.frequency.linearRampToValueAtTime(note.f * 1.2, t + note.d * 0.4);
        osc.frequency.exponentialRampToValueAtTime(note.f * 0.95, t + note.d);

        subOsc.frequency.setValueAtTime(note.f * 1.5, t);

        gain.gain.setValueAtTime(0.01, t);
        gain.gain.linearRampToValueAtTime(0.22, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.005, t + note.d);

        osc.connect(gain);
        subOsc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        subOsc.start(t);
        osc.stop(t + note.d);
        subOsc.stop(t + note.d);

        t += note.d * 0.88;
      });
    } else {
      // Style 3: Cute tickled flutter giggle: "He-he-he-he-hee!"
      const bursts = 6;
      for (let i = 0; i < bursts; i++) {
        const start = now + i * 0.075;
        const dur = 0.065;
        const baseFreq = 620 + i * 45;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';

        osc.frequency.setValueAtTime(baseFreq, start);
        osc.frequency.linearRampToValueAtTime(baseFreq * 1.22, start + dur * 0.4);
        osc.frequency.exponentialRampToValueAtTime(baseFreq, start + dur);

        gain.gain.setValueAtTime(0.01, start);
        gain.gain.linearRampToValueAtTime(0.22, start + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.005, start + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + dur);
      }
    }
  }

  // Alias for giggle
  public playGiggle() {
    this.playLaugh();
  }
}

export const sound = new KidSoundEngine();

// Speech Synthesis
export const speakEnglish = (
  text: string,
  speed: number = 0.9,
  onEnd?: () => void
) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    if (onEnd) onEnd();
    return;
  }

  window.speechSynthesis.cancel(); // Stop any pending speech

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = speed;
  utterance.pitch = 1.15; // friendly, slightly higher pitch for kids

  // Try finding a nice US English voice
  const voices = window.speechSynthesis.getVoices();
  const usVoice = voices.find(
    (v) =>
      v.lang.startsWith('en') &&
      (v.name.includes('Natural') ||
        v.name.includes('Samantha') ||
        v.name.includes('Google') ||
        v.name.includes('Victoria'))
  ) || voices.find((v) => v.lang.startsWith('en'));

  if (usVoice) {
    utterance.voice = usVoice;
  }

  if (onEnd) {
    utterance.onend = () => onEnd();
    utterance.onerror = () => onEnd();
  }

  window.speechSynthesis.speak(utterance);
};

export const speakVietnamese = (text: string, onEnd?: () => void) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    if (onEnd) onEnd();
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'vi-VN';
  utterance.rate = 0.95;
  utterance.pitch = 1.1;

  if (onEnd) {
    utterance.onend = () => onEnd();
    utterance.onerror = () => onEnd();
  }

  window.speechSynthesis.speak(utterance);
};
