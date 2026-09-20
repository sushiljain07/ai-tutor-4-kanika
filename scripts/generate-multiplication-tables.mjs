import { writeFileSync } from 'node:fs';

const TRICKS = {
  1: 'Multiplying by 1 keeps the number exactly the same — 1 x 7 = 7.',
  2: 'Multiplying by 2 means doubling. Just add the number to itself: 2 x 6 = 6 + 6.',
  3: 'Skip count by 3s: 3, 6, 9, 12, 15, 18... Say them out loud a few times!',
  4: 'Double it, then double again! 4 x 6 = double(double(6)) = double(12) = 24.',
  5: 'Table of 5 always ends in 0 or 5. Trick: multiply by 10, then take half.',
  6: '6 is 5 + 1, so 6 x N = (5 x N) + N.',
  7: 'Build it from tables you know: 7 x N = (5 x N) + (2 x N).',
  8: 'Double, double, double! 8 x N = double(double(double(N))).',
  9: "Finger trick: hold up 10 fingers and fold down the Nth one — fingers before it are tens, after it are ones. Bonus: the answer's digits always add up to 9!",
  10: 'Just add a zero to the end of the number!',
  11: 'For 1 to 9, just repeat the digit: 11 x 4 = 44.',
  12: '12 is 10 + 2, so 12 x N = (10 x N) + (2 x N).',
  13: '13 is 10 + 3, so 13 x N = (10 x N) + (3 x N).',
  14: '14 is 10 + 4, so 14 x N = (10 x N) + (4 x N).',
  15: '15 is 10 + 5, so 15 x N = (10 x N) + (5 x N) — or just half of (30 x N).',
  16: '16 is 10 + 6, so 16 x N = (10 x N) + (6 x N).',
  17: '17 is 10 + 7, so 17 x N = (10 x N) + (7 x N).',
  18: '18 is 20 - 2, so 18 x N = (20 x N) - (2 x N).',
  19: '19 is 20 - 1, so 19 x N = (20 x N) - N. This is a fast one!',
  20: 'Multiply by 2, then add a zero! 20 x N = (2 x N) followed by a 0.',
};

const tables = [];
for (let number = 1; number <= 20; number++) {
  const facts = [];
  for (let factor = 1; factor <= 10; factor++) {
    facts.push({ factor, answer: number * factor });
  }
  tables.push({ number, trick: TRICKS[number], facts });
}

const content = {
  id: 'multiplication-tables',
  subjectId: 'math',
  displayName: 'Multiplication Tables (1-20)',
  sourceReference: 'New Mathematics Today - 3',
  explanation: {
    text: 'There are many ways to remember multiplication tables: skip counting (saying every Nth number), spotting patterns, doubling, and breaking a big table into two smaller ones you already know. Pick a table below to see its best trick, drill it with flashcards, then quiz yourself.',
    example: 'For table 9, the digits of every answer add up to 9 — 9x3=27 (2+7=9), 9x4=36 (3+6=9)!',
  },
  tables,
};

writeFileSync(new URL('../js/content/math/multiplication-tables.json', import.meta.url), JSON.stringify(content, null, 2) + '\n');
console.log(`Generated ${tables.length} tables.`);
