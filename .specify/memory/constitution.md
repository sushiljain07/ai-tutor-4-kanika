<!--
Sync Impact Report
- Version change: (none) → 1.0.0
- Modified principles: N/A (initial ratification)
- Added sections:
  - Core Principles: I. Accurate & Pedagogically Sound Content (NON-NEGOTIABLE),
    II. Learner-Centered Simplicity, III. Iterative, Verified Delivery
  - Content & Safety Constraints
  - Development Workflow
  - Governance
- Target learner scope baked into v1.0.0 (not a later amendment): Class 3 ICSE student,
  roughly 7-8 years old, building foundational understanding. Principle I, Principle II,
  and Content & Safety Constraints all encode age/curriculum appropriateness and a
  fundamentals-first (not exam-shortcut) approach.
- Removed sections: Template principle slots 4 and 5 were dropped (project scoped to
  a lean 3-principle constitution per explicit user direction)
- Templates requiring follow-up: ⚠ plan-template.md, spec-template.md, tasks-template.md,
  checklist-template.md were not modified by this command (out of scope) — verify at next
  /speckit-plan or /speckit-tasks run that they don't assume a fixed tech stack or a
  5-principle constitution
- Deferred TODOs: none
-->

# AI-tutor-4-Kanika Constitution

## Core Principles

### I. Accurate & Pedagogically Sound Content (NON-NEGOTIABLE)
All tutoring content and explanations MUST be factually accurate and verified before being
presented to the learner. The tutor MUST NOT fabricate facts, sources, formulas, or answers;
when a claim cannot be verified in-session, the tutor MUST say so explicitly rather than
present it as settled. Content, vocabulary, and explanations MUST match a Class 3 ICSE
student's level: simple language, short explanations, and concepts built up from basics
rather than assumed. The goal is fundamentals — every explanation MUST prioritize helping
the learner understand *why*, not just get the right answer, and MUST NOT skip ahead to
shortcuts, tricks, or content beyond Class 3 scope.

Rationale: this is an educational tool used by a real Class 3 student who is building
foundational understanding, not exam shortcuts. Wrong, unsafe, or over-advanced content
directly harms learning outcomes and trust, so there is zero tolerance for hallucinated
facts or explanations pitched above the learner's level.

### II. Learner-Centered Simplicity
Every feature MUST be justified by a concrete benefit to the learner's understanding or
experience. No speculative features, no premature abstractions, and no unused configuration
are permitted. The UI, interactions, and language MUST be appropriate for a Class 3-aged
child (roughly 7-8 years old): large, simple controls, short sentences, minimal text entry,
friendly and encouraging tone, and no interface patterns that assume adult or teen fluency.
Any added complexity MUST be justified in writing (in the spec or PR description) before it
is built.

Rationale: keeps the tutor focused and maintainable for a small, personal project, and
prevents over-engineering a tool built for one learner's needs.

### III. Iterative, Verified Delivery
A feature is not done until it has been validated — manually or via automated checks —
against a realistic tutoring scenario. No fixed technology stack is mandated by this
constitution; tools and frameworks MAY be adopted or changed as the project evolves, but
each choice MUST be justified by what best serves the learner at the time, not by
precedent or inertia.

Rationale: preserves flexibility for a project whose shape is still evolving, while still
requiring real verification instead of "looks done."

## Content & Safety Constraints

The application, as a whole, MUST be appropriate for a Class 3 ICSE student (roughly
7-8 years old) — content, tone, visuals, and interaction patterns alike. Tutoring content
MUST be free of harmful, frightening, or otherwise age-inappropriate material, and MUST
stay within Class 3 ICSE curriculum scope unless the learner explicitly asks to go further.
Any factual claim presented to the learner (dates, formulas, definitions, historical or
scientific claims, etc.) MUST be verifiable; if it cannot be verified within the current
session, it MUST be flagged to the learner as unverified rather than stated as fact. This
constitution deliberately does not mandate a specific language, framework, or platform —
stack decisions are made per-feature based on what best serves this learner and are
recorded in that feature's plan.

## Development Workflow

Every change MUST be checked against this constitution before being considered complete.
Non-trivial features MUST go through the Spec Kit flow (`/speckit-specify` →
`/speckit-plan` → `/speckit-tasks` → `/speckit-implement`) so that scope and acceptance
criteria are explicit before code is written. Before marking a feature done, it MUST be
manually exercised against at least one realistic tutoring scenario appropriate to a
Class 3 ICSE curriculum (a real question or topic Kanika might ask at that level).

## Governance

This constitution supersedes ad hoc practice for this project. Amendments require a
documented rationale, an explicit version bump under the policy below, and an updated Sync
Impact Report in this file.

Versioning policy:
- MAJOR: backward-incompatible removal or redefinition of a principle.
- MINOR: a new principle added, or materially expanded guidance.
- PATCH: clarifications or wording fixes with no semantic change.

All feature work MUST be checked for compliance with these principles at each Spec Kit
stage; unjustified complexity or unverified/unsafe content MUST be flagged and resolved
before the feature is considered complete.

**Version**: 1.0.0 | **Ratified**: 2026-09-20 | **Last Amended**: 2026-09-20
