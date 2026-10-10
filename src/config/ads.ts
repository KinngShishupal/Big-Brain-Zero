import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

/**
 * Production ad unit IDs from your AdMob account (Apps → Ad units).
 * Leave a value empty and that placement keeps using Google's test ads.
 * Debug builds ALWAYS use test ads — clicking your own live ads can get the account banned.
 *
 * The AdMob *App* IDs live in app.json under "react-native-google-mobile-ads".
 */
const PRODUCTION = {
  android: {
    rewarded: '',
    interstitial: '',
    banner: '',
  },
  ios: {
    rewarded: '',
    interstitial: '',
    banner: '',
  },
} as const;

const TEST = {
  rewarded: TestIds.REWARDED,
  interstitial: TestIds.INTERSTITIAL,
  banner: TestIds.BANNER,
} as const;

export type AdPlacement = keyof typeof TEST;

export function adUnitId(placement: AdPlacement): string {
  const prod = Platform.OS === 'ios' ? PRODUCTION.ios : PRODUCTION.android;
  if (__DEV__ || !prod[placement]) {
    return TEST[placement];
  }
  return prod[placement];
}
