import { trigger } from 'react-native-haptic-feedback';
import { useSaveStore } from '../store/saveStore';

export type HapticKind = 'tap' | 'bonk' | 'success' | 'error';

const MAP = {
  tap: 'impactLight',
  bonk: 'impactHeavy',
  success: 'notificationSuccess',
  error: 'notificationError',
} as const;

/** Fire-and-forget haptic that respects the player's vibration setting. */
export function haptic(kind: HapticKind = 'tap'): void {
  if (!useSaveStore.getState().settings.haptics) {
    return;
  }
  trigger(MAP[kind], {
    enableVibrateFallback: false,
    ignoreAndroidSystemSettings: false,
  });
}
