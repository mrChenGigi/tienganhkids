import confetti from 'canvas-confetti';

// Grand Fireworks Barrage (Pháo hoa rực rỡ nhiều đợt)
export const triggerFireworks = () => {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  const interval: ReturnType<typeof setInterval> = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // Left cannon
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#f59e0b', '#ef4444', '#ec4899', '#10b981', '#3b82f6', '#8b5cf6']
    });

    // Right cannon
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#fbbf24', '#f43f5e', '#a855f7', '#06b6d4', '#10b981', '#f97316']
    });
  }, 250);
};

// Grand Center Star Explosion
export const triggerCenterExplosion = () => {
  confetti({
    particleCount: 120,
    spread: 100,
    origin: { y: 0.55 },
    colors: ['#ffd700', '#ff6b6b', '#48dbfb', '#1dd1a1', '#f368e0'],
    disableForReducedMotion: true,
    zIndex: 9999
  });
};

// Golden Star Rain (Mưa sao vàng may mắn)
export const triggerGoldenShower = () => {
  confetti({
    particleCount: 80,
    angle: 60,
    spread: 55,
    origin: { x: 0 },
    colors: ['#fbbf24', '#f59e0b', '#d97706'],
    zIndex: 9999
  });
  confetti({
    particleCount: 80,
    angle: 120,
    spread: 55,
    origin: { x: 1 },
    colors: ['#fbbf24', '#f59e0b', '#d97706'],
    zIndex: 9999
  });
};

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
