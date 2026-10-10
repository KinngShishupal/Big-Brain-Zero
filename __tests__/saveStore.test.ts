import {
  createInitialSave,
  migrateSave,
  SAVE_VERSION,
  useSaveStore,
} from '../src/store/saveStore';

jest.mock('../src/store/storage', () => {
  const mem = new Map<string, string>();
  return {
    mmkvStorage: {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => {
        mem.set(k, v);
      },
      removeItem: (k: string) => {
        mem.delete(k);
      },
    },
  };
});

beforeEach(() => {
  useSaveStore.setState(createInitialSave());
});

describe('recordRun', () => {
  it('keeps the lowest IQ and counts games', () => {
    const { recordRun } = useSaveStore.getState();
    expect(recordRun(90)).toBe(true);
    expect(recordRun(120)).toBe(false);
    expect(recordRun(12)).toBe(true);
    const s = useSaveStore.getState();
    expect(s.bestIq).toBe(12);
    expect(s.gamesPlayed).toBe(3);
  });

  it('resets stats but keeps settings', () => {
    useSaveStore.getState().setLanguage('hi');
    useSaveStore.getState().recordRun(50);
    useSaveStore.getState().resetProgress();
    const s = useSaveStore.getState();
    expect(s.bestIq).toBeNull();
    expect(s.gamesPlayed).toBe(0);
    expect(s.settings.language).toBe('hi');
  });
});

describe('migrateSave', () => {
  it('recovers from garbage', () => {
    expect(migrateSave('nope', 0)).toEqual(createInitialSave());
  });

  it('fills defaults and stamps the version', () => {
    const migrated = migrateSave({ bestIq: 33 }, 0);
    expect(migrated.bestIq).toBe(33);
    expect(migrated.gamesPlayed).toBe(0);
    expect(migrated.saveVersion).toBe(SAVE_VERSION);
  });
});

describe('v1 → v2 migration', () => {
  it('keeps old stats and settings, adds sound and music defaults', () => {
    const v1 = {
      bestIq: 42,
      gamesPlayed: 7,
      settings: { haptics: false, language: 'hi' },
    };
    const migrated = migrateSave(v1, 1);
    expect(migrated.bestIq).toBe(42);
    expect(migrated.gamesPlayed).toBe(7);
    expect(migrated.settings).toEqual({
      haptics: false,
      language: 'hi',
      sound: true,
      music: true,
    });
  });
});

describe('improveBest', () => {
  it('only lowers the best IQ', () => {
    useSaveStore.getState().recordRun(80);
    expect(useSaveStore.getState().improveBest(90)).toBe(false);
    expect(useSaveStore.getState().improveBest(40)).toBe(true);
    expect(useSaveStore.getState().bestIq).toBe(40);
    expect(useSaveStore.getState().gamesPlayed).toBe(1);
  });
});
