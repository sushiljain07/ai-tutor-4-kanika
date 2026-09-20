const MIN_ATTEMPTS_FOR_INSIGHT = 3;

const SKILL_TAG_TEMPLATES = {
  'operation-identification': (correct, total) =>
    `struggles when a word problem requires identifying the operation (right in ${correct} of the last ${total} attempts)`,
  computation: (correct, total) =>
    `sometimes slips on the calculation itself, even when the operation is right (${correct} of the last ${total} correct)`,
};

export function buildSkillInsights(recentActivity) {
  const bySkill = {};
  for (const entry of recentActivity) {
    if (!entry.skillTag) continue;
    (bySkill[entry.skillTag] ??= []).push(entry);
  }

  const insights = [];
  for (const [skillTag, entries] of Object.entries(bySkill)) {
    if (entries.length < MIN_ATTEMPTS_FOR_INSIGHT) continue;
    const correct = entries.filter((e) => e.correct).length;
    const template = SKILL_TAG_TEMPLATES[skillTag] ?? ((c, t) => `needs more practice with "${skillTag}" (${c} of ${t} correct)`);
    insights.push({
      skillTag,
      totalAttempts: entries.length,
      correctAttempts: correct,
      statement: template(correct, entries.length),
    });
  }
  return insights;
}
