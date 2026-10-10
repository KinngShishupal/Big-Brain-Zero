import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkvStorage } from './storage';

/** Bump when the persisted shape changes and add a step to `migrateSave`. */
export const SAVE_VERSION = 3;
export const SAVE_KEY = 'big-brain-zero-save';

export type Language = 'en' | 'hi';

export interface Settings {
  haptics: boolean;
  language: Language;
  sound: boolean;
  music: boolean;
}

export interface SaveData {
  saveVersion: number;
  /** Lowest IQ ever achieved (lower is better). null until the first run. */
  bestIq: number | null;
  gamesPlayed: number;
  /** How to play has been shown (once, before the first game). */
  tutorialSeen: boolean;
  settings: Settings;
}

export interface SaveActions {
  recordRun: (iq: number) => boolean;
  improveBest: (iq: number) => boolean;
  markTutorialSeen: () => void;
  setHaptics: (enabled: boolean) => void;
  setLanguage: (language: Language) => void;
  setSound: (enabled: boolean) => void;
  setMusic: (enabled: boolean) => void;
  resetProgress: () => void;
}

export type SaveState = SaveData & SaveActions;

export function createInitialSave(): SaveData {
  return {
    saveVersion: SAVE_VERSION,
    bestIq: null,
    gamesPlayed: 0,
    tutorialSeen: false,
    settings: { haptics: true, language: 'en', sound: true, music: true },
  };
}

export const useSaveStore = create<SaveState>()(
  persist(
    (set, get) => ({
      ...createInitialSave(),

      /** Records a finished run. Returns true if it's a new (lower) best. */
      recordRun: iq => {
        const { bestIq, gamesPlayed } = get();
        const isBest = bestIq === null || iq < bestIq;
        set({
          gamesPlayed: gamesPlayed + 1,
          bestIq: isBest ? iq : bestIq,
        });
        return isBest;
      },

      /** Updates the best IQ for a run already recorded (e.g. after a rewarded bonus). */
      improveBest: iq => {
        const { bestIq } = get();
        if (bestIq !== null && iq >= bestIq) {
          return false;
        }
        set({ bestIq: iq });
        return true;
      },

      markTutorialSeen: () => set({ tutorialSeen: true }),

      setHaptics: haptics =>
        set(s => ({ settings: { ...s.settings, haptics } })),

      setLanguage: language =>
        set(s => ({ settings: { ...s.settings, language } })),

      setSound: sound => set(s => ({ settings: { ...s.settings, sound } })),

      setMusic: music => set(s => ({ settings: { ...s.settings, music } })),

      resetProgress: () => set({ bestIq: null, gamesPlayed: 0 }),
    }),
    {
      name: SAVE_KEY,
      version: SAVE_VERSION,
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (s): SaveData => ({
        saveVersion: SAVE_VERSION,
        bestIq: s.bestIq,
        gamesPlayed: s.gamesPlayed,
        tutorialSeen: s.tutorialSeen,
        settings: s.settings,
      }),
      migrate: (persisted, version) => migrateSave(persisted, version),
      // Deep-merge settings so newly added toggles get their defaults.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<SaveData>;
        return {
          ...current,
          ...p,
          settings: { ...current.settings, ...(p.settings ?? {}) },
        };
      },
    },
  ),
);

/** Upgrades old saves; corrupt data falls back to a fresh save. */
export function migrateSave(persisted: unknown, version: number): SaveData {
  const base = createInitialSave();
  if (!persisted || typeof persisted !== 'object') {
    return base;
  }
  const old = persisted as Partial<SaveData>;
  // v1 → v2: added settings.sound and settings.music (default on).
  let data: SaveData = {
    ...base,
    ...old,
    settings: { ...base.settings, ...(old.settings ?? {}) },
  };
  // v2 → v3: added tutorialSeen. Anyone who has already played has clearly figured it out.
  if (version < 3 && old.tutorialSeen === undefined) {
    data = { ...data, tutorialSeen: (old.gamesPlayed ?? 0) > 0 };
  }
  if (version < SAVE_VERSION) {
    data = { ...data, saveVersion: SAVE_VERSION };
  }
  return data;
}
