/**
 * Pure rules for Call Me Dumb: every challenge rewards the dumbest possible play.
 * Each challenge scores 0–100 "stupidity points". No React here — all unit-tested.
 */
import { QUESTIONS, type Answer, type Question } from '../data/questions';

export const MAX_POINTS = 100;

export type Challenge =
  | { kind: 'quiz'; question: Question; order: number[] }
  | { kind: 'button'; seconds: number }
  | { kind: 'reaction'; waitMs: number }
  | { kind: 'count'; count: number; dots: { x: number; y: number }[] };

export const RUN_LAYOUT = {
  quiz: 6,
  button: 1,
  reaction: 1,
  count: 2,
} as const;

export const BUTTON_SECONDS = 5;
export const REACTION_TIMEOUT_MS = 6000;

/** Small seeded PRNG (mulberry32) so runs are reproducible in tests. */
/* eslint-disable no-bitwise -- bit mixing is the whole point of a PRNG */
export function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/* eslint-enable no-bitwise */

export function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Builds one shuffled run of challenges. */
export function buildRun(rng: () => number): Challenge[] {
  const quizzes: Challenge[] = shuffle(QUESTIONS, rng)
    .slice(0, RUN_LAYOUT.quiz)
    .map(question => ({
      kind: 'quiz',
      question,
      order: shuffle([0, 1, 2, 3], rng),
    }));

  const others: Challenge[] = [];
  for (let i = 0; i < RUN_LAYOUT.button; i++) {
    others.push({ kind: 'button', seconds: BUTTON_SECONDS });
  }
  for (let i = 0; i < RUN_LAYOUT.reaction; i++) {
    others.push({ kind: 'reaction', waitMs: 1500 + Math.floor(rng() * 2000) });
  }
  for (let i = 0; i < RUN_LAYOUT.count; i++) {
    const count = 5 + Math.floor(rng() * 14);
    const dots = Array.from({ length: count }, () => ({ x: rng(), y: rng() }));
    others.push({ kind: 'count', count, dots });
  }
  return shuffle([...quizzes, ...others], rng);
}

export function maxScore(run: readonly Challenge[]): number {
  return run.length * MAX_POINTS;
}

const QUIZ_POINTS = [0, 50, 75, 100] as const;

/** The correct answer is worth nothing. The most absurd one is worth everything. */
export function scoreQuiz(answer: Answer): number {
  return QUIZ_POINTS[answer.dumb];
}

/** The button says DO NOT PRESS. Every press is 5 points. */
export function scoreButton(presses: number): number {
  return Math.min(MAX_POINTS, Math.max(0, presses) * 5);
}

/**
 * "Tap when it turns green" — the slower, the better. Tapping too early is also
 * pretty dumb, so it earns a consolation 60.
 */
export function scoreReaction(
  result: { early: true } | { early: false; delayMs: number },
): number {
  if (result.early) {
    return 60;
  }
  return Math.min(MAX_POINTS, Math.round(Math.max(0, result.delayMs) / 30));
}

/** "How many chickens?" — the further off your guess, the more points. */
export function scoreCount(guess: number, actual: number): number {
  return Math.min(MAX_POINTS, Math.abs(guess - actual) * 10);
}

/** Final "IQ": 160 for a perfect genius (bad), 5 for total stupidity (good). */
export function iqFor(total: number, max: number): number {
  if (max <= 0) {
    return 160;
  }
  const ratio = Math.min(1, Math.max(0, total / max));
  return Math.round(160 - ratio * 155);
}

export type Rank = 'potato' | 'goofball' | 'chicken' | 'normal' | 'genius';

export function rankFor(iq: number): Rank {
  if (iq <= 20) {
    return 'potato';
  }
  if (iq <= 50) {
    return 'goofball';
  }
  if (iq <= 90) {
    return 'chicken';
  }
  if (iq <= 130) {
    return 'normal';
  }
  return 'genius';
}

export type Verdict = 'smart' | 'meh' | 'dumb' | 'peak';

/** Feedback after each challenge. */
export function verdictFor(points: number): Verdict {
  if (points <= 0) {
    return 'smart';
  }
  if (points < 50) {
    return 'meh';
  }
  if (points < MAX_POINTS) {
    return 'dumb';
  }
  return 'peak';
}

/** Being smart (scoring 0) ends the run — unless the player watches a video to retry. */
export function isGameOver(points: number): boolean {
  return points <= 0;
}

/** How many funny game-over roasts exist (keys gameOver.title1…N / body1…N). */
export const GAME_OVER_QUIPS = 6;

/** Picks a roast number in 1…GAME_OVER_QUIPS, never the same as the previous one. */
export function pickQuip(previous: number, rng: () => number): number {
  const options = Array.from(
    { length: GAME_OVER_QUIPS },
    (_, i) => i + 1,
  ).filter(n => n !== previous);
  return options[Math.floor(rng() * options.length)];
}
