import mobileAds, {
  AdEventType,
  AdsConsent,
  AdsConsentPrivacyOptionsRequirementStatus,
  InterstitialAd,
  MaxAdContentRating,
  RewardedAd,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';
import { create } from 'zustand';
import { adUnitId } from '../config/ads';

interface AdsState {
  /** Consent allows requests and the SDK finished initializing. */
  ready: boolean;
  /** The user can (and in some regions must be able to) reopen the privacy form. */
  privacyOptionsRequired: boolean;
  /** Session-only: when the last interstitial was shown. */
  lastInterstitialAt: number | null;
  rewardedLoaded: boolean;
  interstitialLoaded: boolean;
  /** A full-screen ad is on screen right now. */
  showing: boolean;
}

export const useAds = create<AdsState>(() => ({
  ready: false,
  privacyOptionsRequired: false,
  lastInterstitialAt: null,
  rewardedLoaded: false,
  interstitialLoaded: false,
  showing: false,
}));

/** Wait this long before retrying after a failed / no-fill load. */
const RETRY_MS = 30_000;

let started = false;
let rewarded: RewardedAd | null = null;
let interstitial: InterstitialAd | null = null;
let earned = false;
let onRewardedDone: ((earned: boolean) => void) | null = null;
let onInterstitialDone: ((shown: boolean) => void) | null = null;

/**
 * Creates both full-screen ads once and keeps them loaded: they load at app start,
 * so they're ready by the time a run ends, and reload right after each show.
 */
function preloadAds(): void {
  rewarded = RewardedAd.createForAdRequest(adUnitId('rewarded'));
  rewarded.addAdEventListener(RewardedAdEventType.LOADED, () =>
    useAds.setState({ rewardedLoaded: true }),
  );
  rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
    earned = true;
  });
  rewarded.addAdEventListener(AdEventType.CLOSED, () => {
    useAds.setState({ rewardedLoaded: false, showing: false });
    const done = onRewardedDone;
    onRewardedDone = null;
    done?.(earned);
    earned = false;
    rewarded?.load();
  });
  rewarded.addAdEventListener(AdEventType.ERROR, error => {
    console.warn('[ads] rewarded error', error);
    useAds.setState({ rewardedLoaded: false, showing: false });
    const done = onRewardedDone;
    onRewardedDone = null;
    done?.(false);
    setTimeout(() => rewarded?.load(), RETRY_MS);
  });
  rewarded.load();

  interstitial = InterstitialAd.createForAdRequest(adUnitId('interstitial'));
  interstitial.addAdEventListener(AdEventType.LOADED, () =>
    useAds.setState({ interstitialLoaded: true }),
  );
  interstitial.addAdEventListener(AdEventType.CLOSED, () => {
    useAds.setState({ interstitialLoaded: false, showing: false });
    const done = onInterstitialDone;
    onInterstitialDone = null;
    done?.(true);
    interstitial?.load();
  });
  interstitial.addAdEventListener(AdEventType.ERROR, error => {
    console.warn('[ads] interstitial error', error);
    useAds.setState({ interstitialLoaded: false, showing: false });
    const done = onInterstitialDone;
    onInterstitialDone = null;
    done?.(false);
    setTimeout(() => interstitial?.load(), RETRY_MS);
  });
  interstitial.load();
}

async function startSdkIfAllowed(): Promise<void> {
  const info = await AdsConsent.getConsentInfo();
  useAds.setState({
    privacyOptionsRequired:
      info.privacyOptionsRequirementStatus ===
      AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
  });
  if (!info.canRequestAds || started) {
    return;
  }
  started = true;
  // A silly-but-harmless game: keep ads family-friendly.
  await mobileAds().setRequestConfiguration({
    maxAdContentRating: MaxAdContentRating.PG,
  });
  await mobileAds().initialize();
  useAds.setState({ ready: true });
  preloadAds();
}

/**
 * Call once at app start. Shows Google's consent form where the law requires it (EEA/UK/CH),
 * then initializes the SDK and preloads ads. Also tries consent from the previous session in
 * parallel so returning players get ads without waiting.
 */
export function initAds(): void {
  AdsConsent.gatherConsent()
    .then(startSdkIfAllowed)
    .catch(error => {
      console.warn('[ads] consent gathering failed', error);
      startSdkIfAllowed().catch(() => {});
    });
  startSdkIfAllowed().catch(() => {});
}

/** Reopens the consent / privacy choices form (Settings → Privacy options). */
export async function openPrivacyOptions(): Promise<void> {
  await AdsConsent.showPrivacyOptionsForm();
  await startSdkIfAllowed();
}

/** Shows the rewarded ad. Resolves true only if the player earned the reward. */
export function showRewarded(): Promise<boolean> {
  const ad = rewarded;
  if (!ad || !useAds.getState().rewardedLoaded || onRewardedDone) {
    return Promise.resolve(false);
  }
  return new Promise(resolve => {
    onRewardedDone = resolve;
    earned = false;
    useAds.setState({ showing: true });
    ad.show().catch(() => {
      onRewardedDone = null;
      useAds.setState({ showing: false });
      resolve(false);
    });
  });
}

/** Shows the interstitial if one is loaded. Resolves once it's closed (or immediately if not shown). */
export function showInterstitial(): Promise<boolean> {
  const ad = interstitial;
  if (!ad || !useAds.getState().interstitialLoaded || onInterstitialDone) {
    return Promise.resolve(false);
  }
  return new Promise(resolve => {
    onInterstitialDone = resolve;
    useAds.setState({ showing: true, lastInterstitialAt: Date.now() });
    ad.show().catch(() => {
      onInterstitialDone = null;
      useAds.setState({ showing: false });
      resolve(false);
    });
  });
}
