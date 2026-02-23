# Illay

Minimal friction workout tracking. A PWA built for the gym — open it, log your sets, get back to lifting.

## Features

- **Pre-built programs** — Starting Strength, StrongLifts 5x5, and Bodyweight Basics ready to go
- **Weight auto-fill** — Remembers your last weight per exercise and auto-increments each session (+5 lbs for barbell, +10 for deadlift)
- **Rest timer** — 90-second countdown with audio alert between sets
- **Session resume** — Close the app mid-workout, come back right where you left off
- **Offline first** — All data stored locally in IndexedDB, no account needed
- **Installable** — Add to home screen for a native app experience

## Programs

| Program | Workouts | Exercises |
|---------|----------|-----------|
| Starting Strength | A: Squat, Bench, Deadlift | B: Squat, OHP, Power Clean |
| StrongLifts 5x5 | A: Squat, Bench, Barbell Row | B: Squat, OHP, Deadlift |
| Bodyweight Basics | Push / Pull / Legs rotation | No equipment needed |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint with ESLint |

## Tech Stack

- React 19 + TypeScript
- Vite + Tailwind CSS
- Dexie (IndexedDB)
- Vitest
