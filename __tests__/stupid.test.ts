import { QUESTIONS } from '../src/data/questions';
import {
  buildRun,
  iqFor,
  iqToAngle,
  GAME_OVER_QUIPS,
  isGameOver,
  pickLine,
  pickQuip,
  CONTINUE_LABELS,
  END_LABELS,
  VERDICT_LINES,
  makeRng,
  maxScore,
  rankFor,
  RUN_LAYOUT,
  scoreButton,
  scoreCount,
  scoreQuiz,
  scoreReaction,
  shuffle,
  verdictFor,
} from '../src/engine/stupid';

describe('question data', () => {
  it.each(QUESTIONS.map(q => [q.id, q] as const))(
    '%s has one answer per dumbness level',
    (_id, q) => {
      expect(q.answers.map(a => a.dumb).sort()).toEqual([0, 1, 2, 3]);
      q.answers.forEach(a => {
        expect(a.en.length).toBeGreaterThan(0);
        expect(a.hi.length).toBeGreaterThan(0);
      });
    },
  );

  it('has unique ids and enough questions for a run', () => {
    expect(new Set(QUESTIONS.map(q => q.id)).size).toBe(QUESTIONS.length);
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(RUN_LAYOUT.quiz);
  });
});

describe('rng and shuffle', () => {
  it('is deterministic per seed', () => {
    const a = makeRng(42);
    const b = makeRng(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('shuffle keeps every item', () => {
    const out = shuffle([1, 2, 3, 4, 5], makeRng(7));
    expect([...out].sort()).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('buildRun', () => {
  const run = buildRun(makeRng(1));

  it('has the configured mix of challenges', () => {
    const count = (k: string) => run.filter(c => c.kind === k).length;
    expect(count('quiz')).toBe(RUN_LAYOUT.quiz);
    expect(count('button')).toBe(RUN_LAYOUT.button);
    expect(count('reaction')).toBe(RUN_LAYOUT.reaction);
    expect(count('count')).toBe(RUN_LAYOUT.count);
    expect(maxScore(run)).toBe(run.length * 100);
  });

  it('never repeats a question and keeps dot counts honest', () => {
    const ids = run.flatMap(c => (c.kind === 'quiz' ? [c.question.id] : []));
    expect(new Set(ids).size).toBe(ids.length);
    run.forEach(c => {
      if (c.kind === 'count') {
        expect(c.dots).toHaveLength(c.count);
        expect(c.count).toBeGreaterThanOrEqual(5);
      }
      if (c.kind === 'quiz') {
        expect([...c.order].sort()).toEqual([0, 1, 2, 3]);
      }
    });
  });
});

describe('scoring rewards stupidity', () => {
  it('quiz: correct is worthless, absurd is perfect', () => {
    const q = QUESTIONS[0];
    const byDumb = (d: number) => q.answers.find(a => a.dumb === d)!;
    expect(scoreQuiz(byDumb(0))).toBe(0);
    expect(scoreQuiz(byDumb(1))).toBe(50);
    expect(scoreQuiz(byDumb(2))).toBe(75);
    expect(scoreQuiz(byDumb(3))).toBe(100);
  });

  it('button: pressing the forbidden button pays, capped at 100', () => {
    expect(scoreButton(0)).toBe(0);
    expect(scoreButton(7)).toBe(35);
    expect(scoreButton(500)).toBe(100);
  });

  it('reaction: slow wins, early gets a consolation prize', () => {
    expect(scoreReaction({ early: false, delayMs: 200 })).toBe(7);
    expect(scoreReaction({ early: false, delayMs: 3000 })).toBe(100);
    expect(scoreReaction({ early: false, delayMs: 99999 })).toBe(100);
    expect(scoreReaction({ early: true })).toBe(60);
  });

  it('count: the wronger the better', () => {
    expect(scoreCount(12, 12)).toBe(0);
    expect(scoreCount(9, 12)).toBe(30);
    expect(scoreCount(99, 12)).toBe(100);
  });
});

describe('IQ and ranks', () => {
  it('maps score to an inverted IQ', () => {
    expect(iqFor(0, 1000)).toBe(160);
    expect(iqFor(1000, 1000)).toBe(5);
    expect(iqFor(500, 1000)).toBe(83);
    expect(iqFor(5000, 1000)).toBe(5);
    expect(iqFor(10, 0)).toBe(160);
  });

  it('assigns ranks', () => {
    expect(rankFor(5)).toBe('potato');
    expect(rankFor(40)).toBe('goofball');
    expect(rankFor(83)).toBe('chicken');
    expect(rankFor(120)).toBe('normal');
    expect(rankFor(160)).toBe('genius');
  });

  it('gives verdicts', () => {
    expect(verdictFor(0)).toBe('smart');
    expect(verdictFor(30)).toBe('meh');
    expect(verdictFor(75)).toBe('dumb');
    expect(verdictFor(100)).toBe('peak');
  });
});

describe('isGameOver', () => {
  it('ends the run only on a smart (0-point) result', () => {
    expect(isGameOver(0)).toBe(true);
    expect(isGameOver(5)).toBe(false);
    expect(isGameOver(100)).toBe(false);
  });
});

describe('pickQuip', () => {
  it('stays in range and never repeats the previous roast', () => {
    const rng = makeRng(99);
    let prev = 0;
    for (let i = 0; i < 200; i++) {
      const q = pickQuip(prev, rng);
      expect(q).toBeGreaterThanOrEqual(1);
      expect(q).toBeLessThanOrEqual(GAME_OVER_QUIPS);
      expect(q).not.toBe(prev);
      prev = q;
    }
  });

  it('has an English and Hindi line for every roast', () => {
    const { en } = require('../src/i18n/en');
    const { hi } = require('../src/i18n/hi');
    for (let n = 1; n <= GAME_OVER_QUIPS; n++) {
      for (const dict of [en, hi]) {
        expect(dict[`gameOver.title${n}`]).toBeTruthy();
        expect(dict[`gameOver.body${n}`]).toBeTruthy();
      }
    }
  });
});

describe('iqToAngle (result gauge)', () => {
  it('maps the IQ range onto a half circle and clamps outside it', () => {
    expect(iqToAngle(5)).toBe(-90);
    expect(iqToAngle(160)).toBe(90);
    expect(iqToAngle(82.5)).toBeCloseTo(0);
    expect(iqToAngle(0)).toBe(-90);
    expect(iqToAngle(999)).toBe(90);
  });
});

describe('verdict lines', () => {
  it('pickLine never repeats and stays in range', () => {
    const rng = makeRng(7);
    let prev = 0;
    for (let i = 0; i < 100; i++) {
      const n = pickLine(prev, rng, VERDICT_LINES);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(VERDICT_LINES);
      expect(n).not.toBe(prev);
      prev = n;
    }
  });

  it('has every funny line in English and Hindi', () => {
    const { en } = require('../src/i18n/en');
    const { hi } = require('../src/i18n/hi');
    for (const v of ['meh', 'dumb', 'peak']) {
      for (let n = 1; n <= VERDICT_LINES; n++) {
        expect(en[`verdict.${v}${n}`]).toBeTruthy();
        expect(hi[`verdict.${v}${n}`]).toBeTruthy();
      }
    }
  });
});

describe('question pool', () => {
  it('has at least 50 questions', () => {
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(50);
  });

  it('puts 10 random questions in every game', () => {
    const run = buildRun(makeRng(3));
    expect(run.filter(c => c.kind === 'quiz')).toHaveLength(10);
  });

  it('avoids the previous game’s questions when it can', () => {
    const first = buildRun(makeRng(11));
    const used = new Set(
      first.flatMap(c => (c.kind === 'quiz' ? [c.question.id] : [])),
    );
    for (let seed = 0; seed < 20; seed++) {
      const next = buildRun(makeRng(seed), used);
      next.forEach(c => {
        if (c.kind === 'quiz') {
          expect(used.has(c.question.id)).toBe(false);
        }
      });
    }
  });

  it('different games get different question sets', () => {
    const ids = (seed: number) =>
      buildRun(makeRng(seed))
        .flatMap(c => (c.kind === 'quiz' ? [c.question.id] : []))
        .sort()
        .join(',');
    expect(ids(1)).not.toBe(ids(2));
  });
});

describe('button labels', () => {
  it('has every Next and End game label in English and Hindi', () => {
    const { en } = require('../src/i18n/en');
    const { hi } = require('../src/i18n/hi');
    for (const dict of [en, hi]) {
      for (let n = 1; n <= CONTINUE_LABELS; n++) {
        expect(dict[`verdict.continue${n}`]).toBeTruthy();
      }
      for (let n = 1; n <= END_LABELS; n++) {
        expect(dict[`gameOver.end${n}`]).toBeTruthy();
      }
    }
  });
});
