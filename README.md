# Call Me Dumb

**The dumber you are, the more you win.** A silly party game for Android, built with **React Native CLI (bare workflow, no Expo)** and TypeScript.

Each run is 14 quick challenges: 10 questions picked at random from a pool of 50 (never the same set as your previous game), plus 4 mini-games. Every challenge rewards the dumbest possible play with up to 100 "stupidity points". A correct answer ends the game unless you watch a video to retry. At the end you get an IQ score, and **lower is better**.

| Challenge | How to win (by being dumb) |
|---|---|
| 🤔 Quiz (×10, from 50) | The correct answer scores **0**. Wrong scores 50, very wrong 75, and gloriously absurd 100 ("2 + 2 = Fish"). |
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

## Audio, icon and logo

Everything is generated from code, so there are no third-party licences to worry about.

```bash
node scripts/generate-audio.mjs   # music loop + sound effects → src/assets/sounds/*.wav
node scripts/generate-icons.mjs   # Android/iOS app icons, Play Store icon, in-app logo
```

- **Music:** a bouncy 14 s chiptune loop. **Sounds:** tap, select, boing (DO NOT PRESS), sad trombone (too smart), happy chirp, fanfare (peak stupidity), whoosh, ding, drumroll (IQ reveal).
- Played with `react-native-audio-api` (`src/services/sound.ts`). Music pauses in the background and ducks while an ad is showing. Players can switch music, sound effects and vibration separately in Settings.
- Icon: an adaptive icon for Android 8+ (`mipmap-anydpi-v26`), legacy round and square icons, `store/play-store-icon-512.png` and a single 1024px iOS icon. The source SVG is in `store/icon.svg`.

## Ads (AdMob)

| Placement | Type | Where |
|---|---|---|
| "Watch an ad to double my stupidity" | Rewarded (opt-in) | Result screen |
| Between runs | Interstitial | On leaving the Result screen. Every 3rd run, never in the first 2, at least 3 minutes apart (`src/engine/adPolicy.ts`) |

There are never ads during challenges. Fast tapping near an ad would cause accidental clicks, which AdMob can ban you for.

**Before release:**
1. Create the app in [AdMob](https://apps.admob.com) and put your real **App IDs** in `app.json` under `react-native-google-mobile-ads`. Right now they are Google's test IDs.
2. Create one rewarded and one interstitial ad unit and paste their IDs into `src/config/ads.ts`. Debug builds always use test ads.
3. In Play Console, answer **"Yes, my app contains ads"** and complete the Data safety form. The SDK uses the advertising ID.
4. Publish a privacy policy that mentions AdMob.
5. The EU/UK consent form (Google UMP) is built in. Set up your consent message in AdMob → Privacy & messaging.
