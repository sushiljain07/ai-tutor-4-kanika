# Quickstart: Foundational Tutor

Manual end-to-end validation for each user story. Run these in a real browser — this is the
"realistic tutoring scenario" verification required by Constitution Principle III before any
story is considered done. See `data-model.md` and `contracts/` for the shapes referenced below.

## Setup

1. From the repository root, serve the static files (no build step needed), e.g.:
   `npx serve .` or `python3 -m http.server 8080`
2. Open the served URL in a browser. Chrome or Edge recommended for the first pass, since both
   support the full Web Speech API (research.md §2); repeat the English story once in Safari
   and once in Firefox to confirm the graceful-degradation behavior in FR-020.
3. Run the automated unit tests: `node --test tests/unit`

## Story P1 — Master the Core Learning Loop: Addition & Subtraction

**This story must pass every step below, exceptionally, before any other story is built out.**

1. Open the app for the first time; confirm it invites you to name the tutor character (a
   preset list plus a free-text option), and that the chosen name appears immediately.
2. From home, tap Math → Addition & Subtraction; confirm the explanation renders as numbered
   steps (not one paragraph) with a worked example.
3. Answer a practice question using the interactive number line: drag the marker, and
   separately try the step-tap fallback; confirm the control won't go outside the valid range.
4. Answer incorrectly on purpose: confirm the small hint appears, then (on a second incorrect
   attempt) the bigger hint, then the numbered step-by-step solution — all narrated as coming
   from the named tutor character.
5. Confirm a similar follow-up question is then offered (`followUpQuestionId`).
6. Answer correctly: confirm a star is awarded with an encouraging message attributed to the
   tutor character.
7. Reload the page: confirm the tutor name, stars, and this topic's progress persisted.

**Expected outcome**: matches spec User Story 1 acceptance scenarios 1-7. Do not proceed to
Story P2 until this loop feels genuinely good to use, not just functionally correct.

## Story P2 — Expand Math to the Remaining Topics

1. From Math, open Place Value, Multiplication Tables, Division basics, and Simple Word
   Problems in turn; confirm each uses the same stepped-explanation → practice → staged-hint →
   follow-up pattern as P1, via multiple-choice/typed answers (no number line expected here).
2. In Simple Word Problems, answer a question incorrectly; confirm (via the unit tests or a
   quick localStorage inspection) that the attempt is recorded with its `skillTag`.
3. Practice a topic to its mastery threshold; confirm the home progress summary reflects it.

**Expected outcome**: matches spec User Story 2 acceptance scenarios 1-3.

## Story P3 — Practice English Topics with Reading Guide

1. From home, tap English; confirm all four topics (Reading Comprehension, Vocabulary,
   Grammar Basics, Sentence Formation) are listed.
2. Open a Reading Comprehension passage; tap "read aloud" and confirm the passage is spoken
   with the current word highlighted as it's read.
3. Tap "read it yourself," read the passage aloud, and confirm gentle feedback identifies any
   words to retry — with no score or penalty shown.
4. In a browser without `SpeechRecognition` support (e.g. Firefox), confirm "read it yourself"
   is hidden/disabled while reading and comprehension questions still work normally (FR-020).
5. Complete the passage's comprehension questions, a Vocabulary match-the-meaning round, and a
   Grammar Basics / Sentence Formation practice set, confirming the same hint-then-answer
   pattern from Math applies throughout.

**Expected outcome**: matches spec User Story 3 acceptance scenarios 1-5.

## Story P4 — Practice Computer Studies Topics

1. From home, tap Computer Studies; confirm all four topics are listed.
2. Open each topic in turn; confirm explanation-then-practice with the same staged-hint
   pattern as Math and English, and that content reads as age-appropriate and not tied to any
   one operating system/device brand.

**Expected outcome**: matches spec User Story 4 acceptance scenarios 1-2.

## Story P5 — Parent Understands Why, Not Just the Score

1. From the app, find the parent-view entry point; enter an incorrect PIN and confirm access
   is denied without affecting the child's screens.
2. Enter the correct PIN (set it first if this is the first run); confirm the per-subject
   summary and "needs attention" topic list appear.
3. Before answering at least 3 Simple Word Problems questions tagged with the same skill,
   confirm the parent view shows no pattern statement for that skill yet (FR-026's minimum
   sample size).
4. After answering at least 3 such questions (mixing correct/incorrect), confirm the parent
   view now shows a specific statement (e.g., "struggles when a word problem requires
   identifying the operation"), shown separately from the raw observed count it's based on.
5. Use "clear progress data," confirm the confirmation prompt, then confirm stars/streak/
   mastery/skill-tag history/recent activity are all reset on the child's screens afterward.

**Expected outcome**: matches spec User Story 5 acceptance scenarios 1-5.

## Cross-cutting checks

- **Offline**: after the first successful load, disconnect from the network (e.g., DevTools
  "Offline" throttling) and confirm every story above still works (spec SC-007).
- **Quick Challenge**: from home, start a Quick Challenge and confirm it draws only from
  topics already opened at least once (FR-021), and runs 3-5 questions.
- **No backend calls**: with browser DevTools' Network tab open, confirm no requests leave the
  device other than loading the app's own static files (spec FR-032 — no backend/AI calls).
- **Tutor character consistency**: across all five stories, confirm every hint/encouragement/
  message is attributed to the same named character (SC-003) — no generic or unnamed voice
  anywhere.
