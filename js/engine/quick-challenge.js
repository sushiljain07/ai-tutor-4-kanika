export function sampleQuickChallenge(openedTopicIds, topicsWithQuestions, count = 4, excludeIds = []) {
  const pool = topicsWithQuestions
    .filter((t) => openedTopicIds.includes(t.id))
    .flatMap((t) => t.questions.map((q) => ({ ...q, topicId: t.id })));

  // Prefer questions not shown in the immediately previous round, but only
  // when doing so still leaves enough to fill the challenge — otherwise fall
  // back to the full pool rather than repeat filler or come up short.
  const fresh = pool.filter((q) => !excludeIds.includes(q.id));
  const source = fresh.length >= count ? fresh : pool;

  const shuffled = [...source].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
