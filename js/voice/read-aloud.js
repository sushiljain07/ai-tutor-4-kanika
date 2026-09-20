export function isReadAloudSupported() {
  return 'speechSynthesis' in window;
}

export function splitWords(text) {
  const words = [];
  const regex = /\S+/g;
  let match;
  while ((match = regex.exec(text))) {
    words.push({ text: match[0], start: match.index, end: match.index + match[0].length });
  }
  return words;
}

export function wordIndexForCharIndex(words, charIndex) {
  let found = -1;
  for (const [i, word] of words.entries()) {
    if (charIndex >= word.start) found = i;
    else break;
  }
  return found;
}

const FEMALE_NAME_HINTS = /female|heera|veena|priya|neha|lekha|kalpana|zira|samantha/i;

export function pickIndianFemaleVoice(voices) {
  if (!voices || voices.length === 0) return null;
  const indianVoices = voices.filter((v) => v.lang?.toLowerCase() === 'en-in');
  const indianFemale = indianVoices.find((v) => FEMALE_NAME_HINTS.test(v.name));
  if (indianFemale) return indianFemale;
  if (indianVoices.length > 0) return indianVoices[0];
  const anyFemale = voices.find((v) => v.lang?.toLowerCase().startsWith('en') && FEMALE_NAME_HINTS.test(v.name));
  if (anyFemale) return anyFemale;
  return voices.find((v) => v.lang?.toLowerCase().startsWith('en')) ?? voices[0];
}

export function getVoicesAsync() {
  if (!isReadAloudSupported()) return Promise.resolve([]);
  const existing = window.speechSynthesis.getVoices();
  if (existing.length > 0) return Promise.resolve(existing);
  return new Promise((resolve) => {
    window.speechSynthesis.addEventListener('voiceschanged', () => resolve(window.speechSynthesis.getVoices()), {
      once: true,
    });
  });
}

export async function speakPassage(text, { onWordIndex, onEnd } = {}) {
  if (!isReadAloudSupported()) return null;
  const words = splitWords(text);
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-IN';
  utterance.rate = 0.85;
  const voice = pickIndianFemaleVoice(await getVoicesAsync());
  if (voice) utterance.voice = voice;
  utterance.onboundary = (event) => {
    if (event.name !== 'word' || !onWordIndex) return;
    onWordIndex(wordIndexForCharIndex(words, event.charIndex));
  };
  if (onEnd) utterance.onend = onEnd;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeaking() {
  if (isReadAloudSupported()) window.speechSynthesis.cancel();
}
