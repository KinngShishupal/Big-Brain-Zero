/**
 * When the between-runs interstitial may appear. Pure so it can be unit-tested.
 * Tune these to trade revenue against annoyance.
 */
export const AD_POLICY = {
  /** Show an interstitial after every Nth finished run… */
  interstitialEvery: 3,
  /** …but never before this many runs (first impressions matter)… */
  minRunsBeforeFirst: 2,
  /** …and never twice within this window. */
  minGapMs: 3 * 60 * 1000,
} as const;

export interface InterstitialContext {
  /** Runs finished so far, including the one that just ended. */
  runsCompleted: number;
  /** When the last interstitial was shown this session, or null. */
  lastShownAt: number | null;
  now: number;
  /** The player just chose to watch a rewarded ad on this result screen. */
  watchedRewarded: boolean;
}

export function shouldShowInterstitial(ctx: InterstitialContext): boolean {
  if (ctx.watchedRewarded) {
    return false;
  }
  if (ctx.runsCompleted < AD_POLICY.minRunsBeforeFirst) {
    return false;
  }
  if (ctx.runsCompleted % AD_POLICY.interstitialEvery !== 0) {
    return false;
  }
  return (
    ctx.lastShownAt === null || ctx.now - ctx.lastShownAt >= AD_POLICY.minGapMs
  );
}

/** The rewarded "double my stupidity" bonus: twice the points, capped at the max. */
export function doubledScore(score: number, max: number): number {
  return Math.min(max, score * 2);
}
