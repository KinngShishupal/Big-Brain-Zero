# Call Me Dumb

**The dumber you are, the more you win.** A silly party game for Android, built with **React Native CLI (bare workflow, no Expo)** and TypeScript.

Each run is 10 quick challenges, and every one rewards the dumbest possible play with up to 100 "stupidity points". At the end you get an IQ score, and **lower is better**.

| Challenge | How to win (by being dumb) |
|---|---|
| 🤔 Quiz (×6) | The correct answer scores **0**. Wrong scores 50, very wrong 75, and gloriously absurd 100 ("2 + 2 = Fish"). |
| 🔴 DO NOT PRESS (×1) | Press the forbidden button as much as you can in 5 seconds: 5 points per press. |
| 🐢 Reaction (×1) | "Tap when it turns green", and the slower the better. Tapping too early gets a consolation 60. |
| 🐔 Count the chickens (×2) | The further off your guess, the more points: 10 per chicken of error. |

IQ = `160 − (score / max) × 155`, so it runs from 160 (a genius, you lose) down to 5 (Supreme Potato 🥔, you win). The app saves your lowest IQ.

## Run it

```bash
npm install
npm start                     # Metro
npx react-native run-android  # second terminal, device or emulator connected
```

Checks: `npx tsc --noEmit`, `npm run lint`, `npm test`.

## Project layout

```
src/
  engine/stupid.ts        pure scoring rules, run builder, seeded RNG (unit-tested)
  data/questions.ts       quiz questions (English + Hindi)
  components/challenges/  Quiz, Button, Reaction, Count
  screens/                Home, Play, Result, Settings
  store/                  saveStore.ts (zustand + MMKV): lowest IQ, games played, settings
  i18n/                   en.ts, hi.ts
```

## Adding questions

Add an entry to `src/data/questions.ts` with four answers rated `dumb: 0 | 1 | 2 | 3`, one of each, with `en` and `hi` text. `npm test` checks that every question follows this rule.

To change the challenge mix, edit `RUN_LAYOUT` in `src/engine/stupid.ts`.
