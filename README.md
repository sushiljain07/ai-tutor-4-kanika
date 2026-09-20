# Kanika's Learning Buddy

A static, offline-capable foundational tutor for Math, English, and Computer Studies
(Class 3 ICSE). No backend, no login, no AI/LLM — see `specs/002-foundational-tutor/` for
the full spec, plan, and task breakdown.

## What's in it

- **Math**: Addition & Subtraction (with a drag/tap number-line widget), Place Value,
  Multiplication Tables 1-20 (per-table memory tricks, flashcard drill, and a quiz mode),
  Multiplying Bigger Numbers (3-digit column multiplication), Division, and Simple Word
  Problems (tagged by skill for parent insight).
- **English**: Reading Comprehension with read-aloud + word highlighting and a "read it
  yourself" pronunciation check, Vocabulary, Grammar Basics, and Sentence Formation.
- **Computer Studies**: Parts of a Computer, Input & Output Devices, Keyboard & Mouse
  Basics, and Internet Safety Basics.
- Every topic follows the same loop: an explanation broken into steps, then practice
  questions with staged hints (small hint → bigger hint → full worked solution) and a
  similar follow-up question — with a consistent tutor voice, stars, and a gentle streak.
- **Quick Challenge**: a short mixed-topic session across whatever the learner has already
  opened.
- **Parent view**: PIN-gated, shows per-subject progress, plain-language skill insights
  (not just a score) for Word Problems, topics needing attention, recent activity, and a
  way to clear progress data.
- Tutor name and child name are fixed in `js/config.js` (`Archana` and `Kanika`).

## Local development

No build step. From the repository root:

```sh
npx serve .
# or
python3 -m http.server 8080
```

Open the printed URL in a browser.

## Running tests

Pure-logic unit tests (no browser needed):

```sh
npm test
# equivalent to: node --test tests/unit
```

Automated browser (end-to-end) tests, covering full user flows and encoding real
regressions found during development (content reachability, the story library, error
handling, PIN gating):

```sh
nvm use        # Playwright requires Node 20+; this repo's dev Node version is in .nvmrc
npm install    # installs @playwright/test (dev-only; the app itself has zero dependencies)
npm run test:e2e
```

The dev server must be running on port 8099 first (`npx serve . -l 8099` or
`python3 -m http.server 8099`) — `playwright.config.js` reuses it if already running,
or starts one itself otherwise. Voice features (read-aloud, "read it yourself") still
need manual verification in a real browser with a microphone — see
`specs/002-foundational-tutor/quickstart.md`.

## Deployment (Vercel via GitHub)

1. Push this repository to GitHub.
2. In Vercel, import the repository. It has no build command and no framework — Vercel's
   zero-config static preset serves the repository root directly (`vercel.json` sets
   `cleanUrls` only).
3. Every push to the connected branch redeploys automatically.
