const BIG_HINT = 2;

export function deriveTopicStatus(attempts) {
  if (!attempts || attempts.length === 0) return 'inProgress';

  const lastThree = attempts.slice(-3);
  if (lastThree.length === 3) {
    const allCorrect = lastThree.every((a) => a.correct);
    const bigHintCount = lastThree.filter((a) => a.hintLevelUsed === BIG_HINT).length;
    if (allCorrect && bigHintCount <= 1) return 'mastered';
  }

  const lastFive = attempts.slice(-5);
  if (lastFive.length >= 3) {
    const correctCount = lastFive.filter((a) => a.correct).length;
    const bigHintCount = lastFive.filter((a) => a.hintLevelUsed === BIG_HINT).length;
    if (correctCount < 3 || bigHintCount > lastFive.length / 2) return 'needsAttention';
  }

  return 'inProgress';
}
