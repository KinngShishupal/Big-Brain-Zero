import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkvStorage } from './storage';

/** Bump when the persisted shape changes and add a step to `migrateSave`. */
export const SAVE_VERSION = 1;
export const SAVE_KEY = 'big-brain-zero-save';

export type Language = 'en' | 'hi';

export interface Settings {
  haptics: boolean;
  language: Language;
}

export interface SaveData {
  saveVersion: number;
  /** Lowest IQ ever achieved (lower is better). null until the first run. */
  bestIq: number | null;
  gamesPlayed: number;
  settings: Settings;
}

export interface SaveActions {
  recordRun: (iq: number) => boolean;
  setHaptics: (enabled: boolean) => void;
  setLanguage: (language: Language) => void;
  resetProgress: () => void;
}

export type SaveState = SaveData & SaveActions;

export function createInitialSave(): SaveData {
  return {
    saveVersion: SAVE_VERSION,
    bestIq: null,
    gamesPlayed: 0,
    settings: { haptics: true, language: 'en' },
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

      setHaptics: haptics =>
        set(s => ({ settings: { ...s.settings, haptics } })),

      setLanguage: language =>
        set(s => ({ settings: { ...s.settings, language } })),

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
        settings: s.settings,
      }),
      migrate: (persisted, version) => migrateSave(persisted, version),
    },
  ),
);

/** Upgrades old saves; corrupt data falls back to a fresh save. */
export function migrateSave(persisted: unknown, version: number): SaveData {
  const base = createInitialSave();
  if (!persisted || typeof persisted !== 'object') {
    return base;
  }
  let data: SaveData = { ...base, ...(persisted as Partial<SaveData>) };
  if (version < SAVE_VERSION) {
    data = { ...data, saveVersion: SAVE_VERSION };
  }
  return data;
}
