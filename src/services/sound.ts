import { AppState } from 'react-native';
import {
  AudioContext,
  type AudioBuffer,
  type AudioBufferSourceNode,
  type GainNode,
} from 'react-native-audio-api';
import { useSaveStore } from '../store/saveStore';

/** All audio is synthesized by scripts/generate-audio.mjs. */
const SOURCES = {
  music: require('../assets/sounds/music.wav'),
  tap: require('../assets/sounds/tap.wav'),
  select: require('../assets/sounds/select.wav'),
  bonk: require('../assets/sounds/bonk.wav'),
  smart: require('../assets/sounds/smart.wav'),
  dumb: require('../assets/sounds/dumb.wav'),
  peak: require('../assets/sounds/peak.wav'),
  whoosh: require('../assets/sounds/whoosh.wav'),
  ding: require('../assets/sounds/ding.wav'),
  drumroll: require('../assets/sounds/drumroll.wav'),
} as const;

type SoundName = keyof typeof SOURCES;
export type Sfx = Exclude<SoundName, 'music'>;

const MUSIC_VOLUME = 0.32;
const SFX_VOLUME = 0.9;

let ctx: AudioContext | null = null;
const buffers = new Map<SoundName, AudioBuffer>();
let musicSource: AudioBufferSourceNode | null = null;
let musicGain: GainNode | null = null;
let initialized = false;

const settings = () => useSaveStore.getState().settings;

async function load(name: SoundName): Promise<void> {
  if (!ctx || buffers.has(name)) {
    return;
  }
  try {
    buffers.set(name, await ctx.decodeAudioData(SOURCES[name]));
  } catch (error) {
    console.warn(`[sound] failed to load ${name}`, error);
  }
}

/**
 * Call once at app start. Decodes the sounds, starts the music if enabled, follows the
 * Music toggle, and goes quiet while the app is in the background.
 */
export async function initSound(): Promise<void> {
  if (initialized) {
    return;
  }
  initialized = true;
  ctx = new AudioContext();

  // Short effects first so the first taps already make noise; music after.
  const names = Object.keys(SOURCES) as SoundName[];
  await Promise.all(names.filter(n => n !== 'music').map(load));
  await load('music');
  if (settings().music) {
    startMusic();
  }

  useSaveStore.subscribe((state, prev) => {
    if (state.settings.music !== prev.settings.music) {
      if (state.settings.music) {
        startMusic();
      } else {
        stopMusic();
      }
    }
  });

  AppState.addEventListener('change', status => {
    if (!ctx) {
      return;
    }
    if (status === 'active') {
      ctx.resume().catch(() => {});
    } else {
      ctx.suspend().catch(() => {});
    }
  });
}

export function playSfx(name: Sfx, volume = 1): void {
  if (!ctx || !settings().sound) {
    return;
  }
  const buffer = buffers.get(name);
  if (!buffer) {
    return;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.value = SFX_VOLUME * volume;
  source.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}

export function startMusic(): void {
  if (!ctx || musicSource) {
    return;
  }
  const buffer = buffers.get('music');
  if (!buffer) {
    return;
  }
  musicGain = ctx.createGain();
  musicGain.gain.value = MUSIC_VOLUME;
  musicGain.connect(ctx.destination);
  musicSource = ctx.createBufferSource();
  musicSource.loop = true;
  musicSource.buffer = buffer;
  musicSource.connect(musicGain);
  musicSource.start();
}

export function stopMusic(): void {
  musicSource?.stop();
  musicSource = null;
  musicGain = null;
}

/** Quieter music while a full-screen ad or important moment plays. */
export function duckMusic(ducked: boolean): void {
  if (musicGain) {
    musicGain.gain.value = ducked ? 0.05 : MUSIC_VOLUME;
  }
}
