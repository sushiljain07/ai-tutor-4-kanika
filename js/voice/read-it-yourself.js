export function isReadItYourselfSupported() {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

function normalizeWord(word) {
  return word.toLowerCase().replace(/[^a-z0-9']/g, '');
}

// Aligns expectedWords against transcriptWords with a longest-common-subsequence
// match, so one dropped/misheard word doesn't cascade into flagging every word
// after it (a naive position-by-position comparison would do that).
function longestCommonSubsequenceIndices(a, b) {
  const n = a.length;
  const m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const matched = new Set();
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      matched.add(i - 1);
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  return matched;
}

export function compareReadAttempt(expectedText, transcriptText) {
  const expectedWords = expectedText.split(/\s+/).filter(Boolean);
  const normalizedExpected = expectedWords.map(normalizeWord);
  const transcriptWords = (transcriptText ?? '').split(/\s+/).filter(Boolean).map(normalizeWord);
  const matched = longestCommonSubsequenceIndices(normalizedExpected, transcriptWords);
  return expectedWords.map((word, index) => ({ index, word })).filter(({ index }) => !matched.has(index));
}

// Listens continuously (not just one short phrase) and keeps accumulating the
// transcript until the caller explicitly stops it — the child controls when
// she's done reading, rather than the browser silently cutting her off after
// the first pause. Returns the recognition object so the caller can call
// `.stop()` on it; `onFinalResult` fires once, with the full transcript, when
// listening actually ends.
export function startListening({ onProgress, onFinalResult, onError }) {
  const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognitionImpl) {
    onError?.('unsupported');
    return null;
  }
  const recognition = new SpeechRecognitionImpl();
  recognition.lang = 'en-IN';
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  let combinedTranscript = '';
  recognition.onresult = (event) => {
    combinedTranscript = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join(' ');
    const wordCount = combinedTranscript.split(/\s+/).filter(Boolean).length;
    onProgress?.(wordCount);
  };
  recognition.onerror = (event) => {
    if (event.error === 'no-speech') return; // benign pause; keep listening
    onError?.(event.error);
  };
  recognition.onend = () => onFinalResult(combinedTranscript);
  recognition.start();
  return recognition;
}
