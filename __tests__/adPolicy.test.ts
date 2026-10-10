import {
  AD_POLICY,
  doubledScore,
  shouldShowInterstitial,
} from '../src/engine/adPolicy';

const base = { lastShownAt: null, now: 1_000_000, watchedRewarded: false };

describe('shouldShowInterstitial', () => {
  it('never shows on the first runs', () => {
    expect(shouldShowInterstitial({ ...base, runsCompleted: 1 })).toBe(false);
  });

  it('shows only every Nth run', () => {
    const shown = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n =>
      shouldShowInterstitial({ ...base, runsCompleted: n }),
    );
    expect(shown).toEqual([3, 6, 9]);
  });

  it('respects the minimum gap', () => {
    const tooSoon = { ...base, runsCompleted: 6, lastShownAt: base.now - 1000 };
    expect(shouldShowInterstitial(tooSoon)).toBe(false);
    const later = {
      ...base,
      runsCompleted: 6,
      lastShownAt: base.now - AD_POLICY.minGapMs,
    };
    expect(shouldShowInterstitial(later)).toBe(true);
  });

  it('skips the interstitial if the player just watched a rewarded ad', () => {
    expect(
      shouldShowInterstitial({
        ...base,
        runsCompleted: 3,
        watchedRewarded: true,
      }),
    ).toBe(false);
  });
});

describe('doubledScore', () => {
  it('doubles and caps at the max', () => {
    expect(doubledScore(300, 1000)).toBe(600);
    expect(doubledScore(700, 1000)).toBe(1000);
    expect(doubledScore(0, 1000)).toBe(0);
  });
});
