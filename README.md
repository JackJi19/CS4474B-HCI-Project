# Spelling Practice Studio

## Project Overview
Spelling Practice Studio is a university Human-Computer Interaction redesign project focused on improving an older spelling-learning website. The goal is to create a cleaner, more learnable, and more feedback-rich classroom-friendly experience for both teachers and students.

This repository currently contains a front-end prototype built with Vite, React, and TypeScript. The prototype emphasizes guided spelling practice, low-friction setup, clear feedback, and stronger visibility of system state using local browser storage only.

## Why We Are Redesigning the Original Experience
The redesign is motivated by the need to improve the usability and learnability of a legacy spelling website experience. The older experience can be difficult for new users to understand quickly, especially in classroom settings where time, clarity, and task flow matter.

This redesign aims to:

- make student and teacher entry points clearer
- reduce unnecessary complexity in core tasks
- provide more immediate and interpretable feedback
- support guided practice instead of loosely structured activity flow
- create a calmer, more consistent interface that is easier to understand at a glance

## Main HCI Goals
The project is guided by core HCI principles, including:

- **Visibility:** keep system status, progress, and next steps easy to see
- **Feedback:** provide immediate, readable responses to user actions
- **Consistency:** reuse layout, terminology, controls, and interaction patterns across pages
- **Cognitive load reduction:** simplify choices and keep attention on one main task at a time
- **Learnability:** help first-time users understand what to do without guesswork
- **Classroom fit:** support quick setup and smooth student practice in a school context

## Implemented Features
The following features are currently implemented:

- **Homepage**
  - clear separation between Student Practice and Teacher Setup
  - student entry by access code or list name
  - teacher entry to create a practice list
  - visible guided practice loop: Learn -> Practice -> Review Mistakes -> Quick Quiz
- **Shared UI and Layout Foundation**
  - reusable header, page shell, button, card, and input components
  - shared design tokens and global styling
  - React Router route structure for key pages
- **Teacher Setup Page**
  - paste or type one word per line
  - automatic parsing, trimming, and duplicate removal
  - review list with per-word removal
  - lightweight practice options
  - mock access code generation with success state
  - stronger teacher-to-student handoff between setup and practice
  - local browser persistence for created spelling lists
  - simple teacher summary view for completed sessions
- **Student Practice Page**
  - guided practice flow with Learn -> Practice -> Review Mistakes -> Quick Quiz
  - practice modes:
    - Type the Word
    - Missing Letters
    - Scramble
  - one-word-at-a-time practice flow
  - visible session progress and stage guidance
  - immediate correct/incorrect feedback
  - letter-level incorrect feedback for typed responses
  - optional hints when enabled by the teacher
  - review tracking for missed words
  - Review Missed Words experience after practice
  - Quick Quiz flow after practice and review
  - Session summary and follow-up screens
- **Mock Front-End Only Flow**
  - browser-based local persistence for lists and session summaries
  - no backend, authentication, analytics, or database integration

## Current Limitations
The current prototype is intentionally limited in scope. It does **not** include:

- real teacher or student accounts
- live classroom synchronization
- online database storage
- analytics dashboards
- server-side validation or APIs
- multi-user networking

## Planned Next Features
The following features are planned for later phases:

- iterative usability refinement based on HCI evaluation findings
- stronger visual polish and classroom-facing presentation improvements
- broader teacher-side controls for configuring sessions
- deeper evaluation and design refinement based on heuristic review

These items are not fully implemented yet and should be treated as next-phase work.

## Tech Stack
- Vite
- React
- TypeScript
- React Router
- CSS
- browser local storage for prototype behavior

## Project Structure Overview
```text
src/
├── app/
│   ├── App.tsx
│   └── routes.tsx
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── PageShell.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Input.tsx
├── data/
│   └── mockLists.ts
├── pages/
│   ├── HomePage/
│   ├── TeacherSetupPage/
│   └── StudentSessionPage/
├── styles/
│   ├── global.css
│   └── tokens.css
├── types/
│   └── spelling.ts
└── utils/
    ├── practiceStorage.ts
    └── validation.ts
