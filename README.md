# Spelling Practice Studio

## Project Overview
Spelling Practice Studio is a university Human-Computer Interaction redesign project focused on improving an older spelling-learning website. The goal is to create a cleaner, more learnable, and more feedback-rich classroom-friendly experience for both teachers and students.

This repository currently contains a front-end prototype built with Vite, React, and TypeScript. The prototype emphasizes guided spelling practice, low-friction setup, and clear feedback using local mock data only.

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
  - local list persistence so student entry works with generated codes
  - teacher summary view for recent completed sessions
- **Student Practice Page**
  - Learn -> Practice -> Review Mistakes -> Quick Quiz -> Summary
  - practice modes: Type the Word, Missing Letters, and Scramble
  - one-word-at-a-time guided practice flow
  - visible stage and progress indicators
  - immediate correct/incorrect feedback with letter-level comparison
  - review tracking for missed words
  - hint support when enabled by the teacher
  - end-of-session summary with quick quiz score
- **Mock Front-End Only Flow**
  - local mock list/session data
  - no backend, authentication, analytics, or database integration

## Planned Next Features
The following features are planned for later phases:

- empirical usability testing with classroom participants
- richer teacher analytics beyond the lightweight summary view
- additional accessibility and personalization options
- iterative usability refinement based on HCI evaluation findings

These items are not fully implemented yet and should be treated as next-phase work.

## Tech Stack
- Vite
- React
- TypeScript
- React Router
- CSS
- local mock data for prototype behavior

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
    ├── listParsing.ts
    └── validation.ts
```

## Local Setup Instructions
### Prerequisites
- Node.js 18+ recommended
- npm

### Setup
1. Clone the repository.
2. Move into the project directory.
3. Install dependencies:

```bash
npm install
```

## Build and Run Commands
### Start the development server
```bash
npm run dev
```

### Build the project
```bash
npm run build
```

### Preview the production build
```bash
npm run preview
```

## Team / Project Note
This repository is part of a university HCI redesign project. It is currently a front-end prototype intended to support iterative design, implementation, and evaluation rather than production deployment.

The current codebase should be treated as a structured prototype:

- built to explore interaction design and classroom-friendly workflows
- intentionally limited to local state and mock data
- designed to be extended in later phases without introducing unnecessary backend complexity too early

Future changes should continue to prioritize visibility, feedback, consistency, cognitive load reduction, and learnability.
