import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

const mmkv = createMMKV({ id: 'farm-to-empire' });

// Leftover saves from earlier prototypes in this project.
mmkv.remove('farm-to-empire-save');
mmkv.remove('shadow-protocol-save');

/** Synchronous MMKV adapter for zustand's persist middleware. */
export const mmkvStorage: StateStorage = {
  getItem: key => mmkv.getString(key) ?? null,
  setItem: (key, value) => mmkv.set(key, value),
  removeItem: key => {
    mmkv.remove(key);
  },
};
