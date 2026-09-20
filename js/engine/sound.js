let sharedContext = null;

function getContext() {
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  if (!sharedContext) sharedContext = new Ctor();
  if (sharedContext.state === 'suspended') sharedContext.resume().catch(() => {});
  return sharedContext;
}

function playTone(context, { frequency, startTime, duration, type = 'sine', peakGain = 0.15 }) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

export function isSoundSupported() {
  return Boolean(window.AudioContext || window.webkitAudioContext);
}

// A cheerful two-note rising chime — used for a correct answer.
export function playCorrectSound() {
  const context = getContext();
  if (!context) return;
  const now = context.currentTime;
  playTone(context, { frequency: 523.25, startTime: now, duration: 0.16, type: 'triangle' }); // C5
  playTone(context, { frequency: 659.25, startTime: now + 0.1, duration: 0.22, type: 'triangle' }); // E5
}

// A single soft, low tone — a gentle "not quite, try again" cue, never harsh.
export function playIncorrectSound() {
  const context = getContext();
  if (!context) return;
  const now = context.currentTime;
  playTone(context, { frequency: 293.66, startTime: now, duration: 0.22, type: 'sine', peakGain: 0.1 }); // D4
}
