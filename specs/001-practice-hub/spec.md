# Feature Specification: Foundational Practice Hub

**Feature Branch**: `001-practice-hub`

**Created**: 2026-09-20

**Status**: Draft

**Input**: User description: "Build a browser-based, single-page learning app for a Class 3 ICSE student (Kanika) to practice foundational skills, with no login/accounts and no backend — all content is static JSON and all progress is saved in browser localStorage. Home screen: a friendly 'Hi Kanika!' greeting and three big, colorful, easy-to-tap buttons, one per practice module. A simple shared progress view shows stars earned and which multiplication tables are mastered. Module 1 - Reading Practice: short age-appropriate passages, read-aloud via text-to-speech, 2-3 multiple-choice comprehension questions with large tappable buttons, stars for correct answers, gentle retry for incorrect. Module 2 - Vocabulary Builder: word cards (word, definition, example sentence), then a match-the-meaning quiz; stars for correct matches, gentle retry for incorrect. Module 3 - Multiplication Tables: pick a table 1-10, practice via flashcard drill and a timed quiz, tracks mastered tables in the shared progress view. All feedback must be positive and encouraging, simple language, large child-friendly UI for a 7-8 year old. Out of scope: accounts/login, parent dashboard, backend/server sync, subjects beyond reading/vocabulary/multiplication tables."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Practice Multiplication Tables (Priority: P1)

Kanika opens the app, taps the Multiplication Tables button, picks a table between 1 and 10,
and practices it by drilling flashcards and then taking a short timed quiz. The app remembers
which tables she has mastered and shows that on her progress view.

**Why this priority**: Multiplication tables are the most self-contained, easiest to measure
skill of the three, and mastery tracking gives an immediate, visible sense of progress. It is
the smallest complete slice that proves out the app's core loop (practice → feedback → progress).

**Independent Test**: Can be fully tested by opening the app, choosing a table, completing a
flashcard drill and a timed quiz for it, and confirming the table shows as mastered on the
progress view on a later visit — without any other module existing yet.

**Acceptance Scenarios**:

1. **Given** the home screen, **When** Kanika taps the Multiplication Tables button, **Then** she
   sees a simple picker for tables 1 through 10.
2. **Given** a table is selected, **When** she starts flashcard drill mode, **Then** she is shown
   one multiplication fact at a time and can reveal the answer at her own pace.
3. **Given** she has drilled a table, **When** she starts the timed quiz for that table, **Then**
   she answers a short series of questions within a time limit and sees her score at the end.
4. **Given** she answers a quiz question correctly, **When** the answer is submitted, **Then**
   she earns a star and sees an encouraging message.
5. **Given** she answers a quiz question incorrectly, **When** the answer is submitted, **Then**
   she sees a gentle "try again" prompt (not a penalty) and can retry.
6. **Given** she has met the mastery criteria for a table, **When** she returns to the shared
   progress view, **Then** that table is shown as mastered.

---

### User Story 2 - Practice Reading Comprehension (Priority: P2)

Kanika taps the Reading Practice button, is shown a short passage at her level, can have it read
aloud to her, and then answers a few simple comprehension questions about it, earning stars for
correct answers.

**Why this priority**: Reading comprehension is core to the "fundamentals" goal but depends on
curated passage content and text-to-speech, making it more involved than the tables module.

**Independent Test**: Can be fully tested by opening a passage, optionally using read-aloud,
answering its comprehension questions, and confirming stars are awarded for correct answers and
a friendly retry is offered for incorrect ones — independent of the other two modules.

**Acceptance Scenarios**:

1. **Given** the home screen, **When** Kanika taps the Reading Practice button, **Then** she is
   shown one short, age-appropriate passage.
2. **Given** a passage is shown, **When** she taps "read aloud", **Then** the passage is read to
   her using text-to-speech.
3. **Given** she has read a passage, **When** she proceeds, **Then** she is shown 2-3 multiple-
   choice comprehension questions with large, tappable answer buttons.
4. **Given** she answers a question correctly, **When** the answer is submitted, **Then** she
   earns a star and sees an encouraging message.
5. **Given** she answers a question incorrectly, **When** the answer is submitted, **Then** she
   sees a gentle retry prompt and can try again, with no penalty.
6. **Given** she finishes a passage's questions, **When** she continues, **Then** she is offered
   the next available passage.

---

### User Story 3 - Build Vocabulary (Priority: P3)

Kanika taps the Vocabulary Builder button, browses a set of word cards (each with the word, a
simple definition, and an example sentence), and then plays a short match-the-meaning quiz,
earning stars for correct matches.

**Why this priority**: Vocabulary building rounds out the foundational skill set but is the most
similar in shape to reading practice and delivers the least additional new interaction pattern,
so it is the last of the three to build.

**Independent Test**: Can be fully tested by browsing a set of word cards, playing the match-the-
meaning quiz, and confirming stars are awarded for correct matches and a gentle retry is offered
for incorrect ones — independent of the other two modules.

**Acceptance Scenarios**:

1. **Given** the home screen, **When** Kanika taps the Vocabulary Builder button, **Then** she is
   shown a word card with the word, a simple definition, and an example sentence.
2. **Given** she has browsed a set of word cards, **When** she proceeds, **Then** she is shown a
   match-the-meaning quiz drawn from that set.
3. **Given** she matches a word to its correct meaning, **When** the match is submitted, **Then**
   she earns a star and sees an encouraging message.
4. **Given** she matches a word to an incorrect meaning, **When** the match is submitted, **Then**
   she sees a gentle retry prompt and can try again, with no penalty.

---

### Edge Cases

- What happens when Kanika answers the same question incorrectly several times in a row? The app
  keeps offering gentle, encouraging retries — it never locks her out, shows a harsh message, or
  penalizes her score for retrying.
- What happens if browser storage is unavailable or gets cleared (e.g., private browsing, cache
  clear)? The app still functions for the current session; stars and mastered tables simply do
  not persist to the next visit, without producing an error.
- What happens if a module runs out of unseen content (all passages read, all word sets browsed)?
  The app cycles back through the existing content rather than showing a dead end.
- What happens if text-to-speech is not available in the browser? The reading module still works
  without the read-aloud button; the rest of the flow (reading and answering) is unaffected.
- What happens if there is no internet connection after the app has loaded once? All three
  practice modules and progress tracking continue to work normally, since content and progress
  are both local to the device.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The home screen MUST show a friendly greeting addressed to Kanika and three large,
  colorful, easy-to-tap buttons, one for each practice module (Multiplication Tables, Reading
  Practice, Vocabulary Builder).
- **FR-002**: The home screen MUST show a shared progress view summarizing stars earned so far
  and which multiplication tables (1-10) are currently mastered.
- **FR-003**: Users MUST be able to select any multiplication table from 1 to 10 to practice.
- **FR-004**: The Multiplication Tables module MUST offer a flashcard drill mode where a fact is
  shown and the answer is revealed at the user's own pace.
- **FR-005**: The Multiplication Tables module MUST offer a timed quiz mode covering the selected
  table, ending in a visible score.
- **FR-006**: The system MUST track, per multiplication table, whether it has been practiced
  enough to be considered mastered, and MUST reflect that status on the shared progress view.
- **FR-007**: The Reading Practice module MUST present short, age-appropriate passages one at a
  time.
- **FR-008**: The Reading Practice module MUST offer a "read aloud" control that reads the
  current passage aloud when available in the user's browser.
- **FR-009**: After a passage, the system MUST present 2-3 multiple-choice comprehension
  questions with large, tappable answer options.
- **FR-010**: The Vocabulary Builder module MUST present word cards, each showing the word, a
  simple definition, and an example sentence.
- **FR-011**: After browsing a set of word cards, the system MUST offer a match-the-meaning quiz
  drawn from that set.
- **FR-012**: Across all three modules, a correct answer MUST award a star and show an
  encouraging message.
- **FR-013**: Across all three modules, an incorrect answer MUST show a gentle retry prompt and
  allow the user to try again, without any penalty, lockout, or negative-toned message.
- **FR-014**: The system MUST persist stars earned and mastered-table status in the browser so
  they are still visible the next time Kanika opens the app on the same device.
- **FR-015**: The system MUST remain fully usable, including all three practice modules and
  progress tracking, without requiring a user account, login, or an active internet connection
  after the app has first loaded.
- **FR-016**: The content for passages, vocabulary sets, and multiplication facts MUST be
  organized so that new items can be added by a content editor without changing how the app
  behaves.
- **FR-017**: All UI text, feedback, and interactions MUST use simple language, large tap
  targets, and an encouraging tone appropriate for a 7-8 year old learner.
- **FR-018**: This feature explicitly excludes user accounts/login, a parent-facing dashboard,
  backend/server-side sync, and any subject areas beyond reading, vocabulary, and multiplication
  tables.

### Key Entities

- **Passage**: A short reading text at the learner's level; has associated comprehension
  questions.
- **Comprehension Question**: A multiple-choice question tied to a passage, with one correct
  answer among a small set of options.
- **Vocabulary Word**: A word with a simple definition and an example sentence, used both for
  browsing and for the match-the-meaning quiz.
- **Multiplication Table**: One of the tables 1-10; comprised of individual multiplication facts
  and a mastery status.
- **Progress Record**: The learner's accumulated stars and per-table mastery status, persisted
  locally on the device.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: From the home screen, Kanika can reach any of the three practice modules within a
  single tap.
- **SC-002**: Kanika can complete a full flashcard drill and timed quiz for one multiplication
  table in under 5 minutes.
- **SC-003**: On returning to the app on the same device, previously earned stars and mastered
  tables are visible immediately, with no setup or sign-in step.
- **SC-004**: 100% of incorrect answers across all three modules result in an encouraging retry
  prompt rather than a blocking, penalizing, or negative-toned response.
- **SC-005**: All three practice modules and the progress view remain fully usable with no
  internet connection, after the app's first load.
- **SC-006**: A new passage, vocabulary word, or multiplication fact can be added to the app's
  content by a content editor alone, with no change to the app's behavior or code logic.

## Assumptions

- This is a single-user, single-device experience for Kanika; no multi-user separation, roles, or
  permissions are needed.
- Passages, vocabulary sets, and multiplication table content will be authored to Class 3 ICSE
  level as part of building this feature; exact curriculum sequencing is a content-authoring
  concern, not a system behavior specified here.
- The mastery threshold for a multiplication table (e.g., how many correct quiz attempts count as
  "mastered") is a specific, testable rule to be defined during planning, informed by common
  practice for this age group.
- Read-aloud relies on text-to-speech support in the learner's browser; where unsupported, the
  read-aloud control is simply unavailable and the rest of the reading flow is unaffected.
- No caregiver/parent reporting or monitoring is needed for this feature; that is explicitly
  deferred, per the Content & Safety and Governance expectations in the project constitution.
- Progress data lives only in the browser's local storage on Kanika's device; loss of that storage
  (e.g., clearing browser data) is an accepted risk for this feature and does not require backend
  backup.
