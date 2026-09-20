# Phase 0 Research: Foundational Tutor

All items below were flagged as decisions in the Technical Context rather than genuine
external unknowns, so this is a design-decision log rather than a literature review.

## 1. No framework / no bundler

**Decision**: Plain HTML/CSS/JS with native ES modules; no React/Vue/etc., no Webpack/Vite
build step.

**Rationale**: The app has no complex shared state beyond one Progress Record, no server
round-trips, and a small, fixed set of views. A framework's benefits (componentization,
reactive re-rendering at scale) aren't needed here, and a build step adds a maintenance
surface with no corresponding benefit — directly against Constitution Principle II
(Learner-Centered Simplicity: "no speculative features... no unused configuration").

**Alternatives considered**:
- React/Vite — rejected: adds a build pipeline and dependency surface for a handful of views.
- A lightweight reactive lib (Preact, Alpine.js) — rejected: still an added dependency with no
  problem it solves here that vanilla DOM updates don't.

## 2. Voice features: Web Speech API

**Decision**: Use the browser-native Web Speech API — `SpeechSynthesis` for read-aloud with
word-boundary events driving highlighting, and `SpeechRecognition` (`webkitSpeechRecognition`
where prefixed) for "read it yourself."

**Rationale**: Both run entirely client-side with no API key, no cost, and no backend —
required by spec FR-018/FR-019/FR-029. Support is broad enough for a personal, single-family
app: `SpeechSynthesis` is supported in all major evergreen browsers; `SpeechRecognition` is
well supported in Chrome/Edge and Safari (iOS 14.5+) but unsupported in Firefox.

**Alternatives considered**:
- A hosted TTS/STT API (e.g., cloud speech services) — rejected: requires a backend to hold
  credentials, directly violating the "no backend, no AI/LLM API" scope boundary (spec
  FR-032).
- A third-party JS TTS/STT library — rejected: adds a dependency to wrap an API the browser
  already exposes natively.

**Handling unsupported browsers**: Feature-detect `window.speechSynthesis` and
`window.SpeechRecognition || window.webkitSpeechRecognition` at startup; hide the read-aloud
and/or "read it yourself" controls individually when absent, per spec FR-020. This is a
runtime capability check, not a build-time branch.

## 3. Offline support: hand-written service worker

**Decision**: A small, hand-written `sw.js` using a network-first-with-cache-fallback
strategy for the app shell (`index.html`, `css/`, `js/`) and the content JSON files: every
fetch tries the network first and refreshes the cache on success, only falling back to the
cache when the network request fails.

**Rationale**: Spec FR-029/SC-007 require the app to work fully offline after first load.
Relying on the browser's default HTTP cache alone is not reliable enough across browsers/
network conditions to guarantee this. A full offline framework (e.g., Workbox) would add a
dependency to solve a problem a ~30-line service worker already solves for this app's small,
fully-known asset list. An initial cache-first version was tried first but rejected after
implementation: it served stale JS/CSS/content indefinitely once cached, with no way for a
returning online user to see an update without manually clearing site data — unacceptable for
an app whose content is expected to keep changing. Network-first fixes that while still
satisfying the offline requirement, since a failed network request (offline) still falls back
to the last-cached response.

**Alternatives considered**:
- No offline handling, rely on HTTP cache — rejected: doesn't reliably satisfy FR-029.
- Workbox / PWA toolchain — rejected: unnecessary dependency weight for a fixed, small asset
  list known upfront.
- Cache-first — rejected after trying it: correct for a truly static, versioned build, but
  wrong for this project's actual pace of content/code changes; leaves online users stuck on
  stale content indefinitely.

## 4. Testing approach: `node:test` + a scoped Playwright E2E suite

**Decision**: Automated unit tests (Node's built-in `node:test` runner, no extra dependency)
cover the pure logic in `js/engine/` (hint staging, mastery/revision thresholds, answer
checking, quick-challenge sampling). A small, deliberately non-exhaustive `@playwright/test`
suite under `tests/e2e/` covers the highest-value full-browser flows. Voice features
(read-aloud, "read it yourself") still require manual verification per `quickstart.md`, since
they need a real microphone/speaker.

**Rationale**: The logic worth unit-testing is pure and framework-free, so `node:test` needs
no extra dependency for that layer. The original decision (below) rejected E2E tests as
disproportionate for this project's size — that held while the UI was small, but as the app
grew, manual-only checking twice missed real regressions that a repeatable test would have
caught immediately: a router double-render bug, and a shuffle/reachability interaction bug
where a reinforcement question landing later in a shuffled array silently skipped every
question in between (`content-reachability.spec.js` catches exactly this). The E2E suite is
intentionally kept to a handful of tests encoding *specific, previously-real* bugs and the
core loop — not exhaustive coverage of every screen — to keep the "disproportionate cost"
concern from the original decision from recurring.

**Alternatives considered**:
- Vitest/Jest — rejected: pulls in a test-framework dependency where `node:test` already
  covers the pure-logic surface being tested.
- No E2E tests at all (original decision) — reverted: real regressions were only caught
  because a headless browser happened to be set up ad hoc for manual QA in one session;
  without a committed suite, the next session has no repeatable way to catch the same class
  of bug automatically.
- Exhaustive E2E coverage of every screen/interaction — rejected: still disproportionate for
  a single-family app; the suite targets known-fragile logic (shuffling interacting with
  reachability, content fetch failures, PIN gating) rather than every possible screen.

## 5. Content format: static JSON per topic

**Decision**: One JSON file per topic under `js/content/<subject>/`, fetched at runtime by
the topic view. Shape defined in `contracts/content-schema.md`.

**Rationale**: Satisfies spec FR-030 ("new topics can be added... without changing how the
app behaves") — a content editor edits/adds a JSON file, no code change needed. JSON is
directly readable/editable by a non-developer with guidance, and needs no build step to
consume (native `fetch`).

**Alternatives considered**:
- Content hardcoded in JS — rejected: mixes content edits with code changes, violating
  FR-030.
- A markup format like Markdown/YAML — rejected: would need a parser dependency; JSON parses
  natively in the browser.

## 6. Parent PIN storage

**Decision**: Store a PIN (as a salted hash, not plaintext) in `localStorage`, set on first
use; checked client-side before rendering the parent view.

**Rationale**: Spec FR-024 explicitly calls this "a PIN... not full authentication" — it is a
barrier to keep a young child out of the parent view, not a security boundary against a
determined adult or another party with device access. A real auth system would require a
backend, directly violating the no-backend scope boundary (FR-032).

**Alternatives considered**:
- Full authentication (accounts, sessions) — rejected: explicitly out of scope (FR-032) and
  requires a backend.
- Plaintext PIN in localStorage — rejected in favor of a lightweight hash: trivial extra
  effort to avoid storing the literal PIN in a debuggable browser storage area.

## 7. Mastery and revision-nudge thresholds

**Decision**: Concrete, simple rule-based constants, isolated in one config module
(`js/engine/mastery-rules.js`) so they're easy to tune without touching call sites:
- **Mastered**: the last 3 attempts on a topic/table were correct, with at most 1 of those 3
  needing the bigger hint.
- **Needs attention (revision nudge)**: over the last 5 attempts on a topic, fewer than 3 were
  correct, OR the bigger hint was needed on more than half of them.

**Rationale**: Spec Assumptions explicitly defer the exact threshold to planning while
requiring it be "specific, testable." These numbers are small enough to reach quickly during
normal practice (matching SC-002's ~10-minute session) and directly reflect the spec's
"recently missed more than she got right" / "needed the bigger hint often" language. Kept as
named constants in one place so a parent/developer can retune without touching UI or storage
code.

**Alternatives considered**:
- A weighted/decaying score — rejected: harder to explain, test, or tune than a simple
  windowed count, with no accuracy benefit at this scale.
- Machine-learned confidence modeling — explicitly rejected earlier in scoping (spec
  Assumptions / FR-032 boundary against a "personalized learning engine"), and again when
  scoping the parent-insight upgrade in favor of rule-based skill tagging (research.md §10).

## 8. Tutor character: persona layer, not a chat agent

**Decision**: The tutor character is a name + one small static illustration, stored once in
the Progress Record (`tutorName`) and referenced by every view when rendering pre-authored
copy ("{tutorName} says: Great job!"). It is not a conversational agent.

**Rationale**: Delivers the personality/warmth the user asked for while staying inside the
"no chat, no LLM" boundary confirmed earlier (spec FR-032) — it's a presentation-layer change
to existing static strings, not a new subsystem.

**Alternatives considered**:
- An animated/sprite character with idle animations — rejected: user explicitly asked for
  "encouraging but not distracting"; a static illustration avoids motion that competes for
  attention with the learning content (also keeps `js/widgets` free of an animation engine).

## 9. Flagship interactive widget: native pointer events, scoped to one topic

**Decision**: The Addition & Subtraction number-line control is built with native pointer
events (`pointerdown`/`pointermove`/`pointerup`) and plain DOM/SVG, supporting both drag and a
step-tap fallback (per spec FR-013 and the edge case for imprecise touch). No drag-and-drop or
gesture library is added. It is intentionally the *only* topic with a bespoke widget in this
feature (spec FR-012).

**Rationale**: A generic manipulatives library (counters, area models, number lines, etc.) for
every Math topic is a large surface to build and validate well; the user's own direction (spec
"start with one excellent learning loop") argues for proving one interaction pattern
thoroughly before generalizing it. Pointer Events are natively supported across target
browsers and unify mouse/touch handling without a library.

**Alternatives considered**:
- A drag-and-drop/gesture library (e.g., interact.js) — rejected: solves a problem plain
  Pointer Events already solve for one widget; would only pay off across many widgets.
- Building visual widgets for every Math topic now — rejected per the user's explicit
  "one excellent loop first" direction; deferred to a follow-on feature once this one is
  proven (spec Assumptions).

## 10. Skill-tag insight generation: rule-based aggregation with a minimum sample size

**Decision**: Each Simple Word Problems question carries a `skillTag` (contracts/content-
schema.md). `js/engine/skill-insights.js` counts recent attempts per tag from
`recentActivity`/`topics[].attempts` and only emits a plain-language statement for a tag once
at least 3 attempts against it are logged (spec FR-026); below that, the tag is simply not
mentioned yet. Statement templates are small, hand-written strings keyed by tag (e.g.,
`operation-identification` → "struggles when a word problem requires identifying the
operation"), not generated text.

**Rationale**: Delivers the "why, not just a score" insight the user asked for while staying
rule-based (no ML/confidence-inference, consistent with the boundary set earlier in this
project and with Constitution Principle I's "MUST NOT fabricate"). The minimum-sample-size
gate directly implements "don't infer a permanent ability level from a few incorrect answers."

**Alternatives considered**:
- Free-text/generated insight sentences — rejected: risks fabricating a pattern that isn't
  really there; a small fixed template set per tag is fully predictable and reviewable.
- No minimum sample size (react to any single miss) — rejected: would produce a "pattern"
  statement off of one unlucky guess, which the spec explicitly guards against.

## 11. Deployment

**Decision**: Deploy as a static site to Vercel via GitHub integration, using Vercel's
zero-config static/"Other" framework preset (no build command; the repository root is served
directly).

**Rationale**: Matches the original ask (Vercel + GitHub) with no build tooling to maintain,
consistent with the "no bundler" decision above.

**Alternatives considered**: None needed — this was a fixed requirement, not an open
question.
