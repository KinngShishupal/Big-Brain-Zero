#!/usr/bin/env node
/**
 * Builds a signed release and copies it to dist/ with the version in the name.
 *
 *   npm run build:aab     → dist/CallMeDumb-<version>-<code>.aab  (upload this to Google Play)
 *   npm run build:apk     → dist/CallMeDumb-<version>-<code>.apk  (install directly on a phone)
 *   npm run build:release → both
 */
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ANDROID = join(ROOT, 'android');
const DIST = join(ROOT, 'dist');

const TARGETS = {
  apk: {
    task: 'assembleRelease',
    output: join(
      ANDROID,
      'app',
      'build',
      'outputs',
      'apk',
      'release',
      'app-release.apk',
    ),
  },
  aab: {
    task: 'bundleRelease',
    output: join(
      ANDROID,
      'app',
      'build',
      'outputs',
      'bundle',
      'release',
      'app-release.aab',
    ),
  },
};

const requested = process.argv.slice(2);
const kinds = requested.length ? requested : ['aab'];
for (const kind of kinds) {
  if (!TARGETS[kind]) {
    console.error(`Unknown target "${kind}". Use: apk, aab`);
    process.exit(1);
  }
}

const gradle = readFileSync(join(ANDROID, 'app', 'build.gradle'), 'utf8');
const versionName = gradle.match(/versionName\s+"([^"]+)"/)?.[1] ?? '0';
const versionCode = gradle.match(/versionCode\s+(\d+)/)?.[1] ?? '0';

if (!existsSync(join(ANDROID, 'keystore.properties'))) {
  console.warn(
    '\n⚠️  No android/keystore.properties: this build is signed with the DEBUG key.\n' +
      '    Fine for testing on your phone, but Google Play will reject it. Run `npm run keystore` first.\n',
  );
}

/**
 * Windows: native (C++) builds embed the project path in object file paths, which blows past
 * the 260-character limit when the project lives in a long folder. Temporarily map the project
 * to a spare drive letter (subst) and build from there; the mapping is removed afterwards.
 */
function mapShortDrive() {
  if (process.platform !== 'win32') {
    return null;
  }
  for (const letter of ['W', 'V', 'U', 'T', 'S', 'R']) {
    if (existsSync(`${letter}:\\`)) {
      continue;
    }
    const res = spawnSync('subst', [`${letter}:`, ROOT], { stdio: 'ignore' });
    if (res.status === 0) {
      return `${letter}:`;
    }
  }
  console.warn(
    '⚠️  No free drive letter for a short build path; building from the full path.',
  );
  return null;
}

const drive = mapShortDrive();
const buildRoot = drive ? `${drive}\\` : ROOT;
const buildAndroid = join(buildRoot, 'android');
const unmap = () => {
  if (drive) {
    spawnSync('subst', [drive, '/d'], { stdio: 'ignore' });
    // The autolinking cache now records the mapped drive's paths. Drop it so normal
    // 'npm run android' builds (from the real path) regenerate it.
    for (const dir of [
      join(ANDROID, 'build', 'generated', 'autolinking'),
      join(ANDROID, 'app', 'build', 'generated', 'autolinking'),
    ]) {
      rmSync(dir, { recursive: true, force: true });
    }
  }
};
process.on('SIGINT', () => {
  unmap();
  process.exit(130);
});

// Full, quoted path: the folder may contain spaces, and cmd.exe won't search cwd reliably.
const gradlew =
  process.platform === 'win32'
    ? '"' + join(buildAndroid, 'gradlew.bat') + '"'
    : './gradlew';
const tasks = kinds.map(k => TARGETS[k].task);
console.log(
  `Building ${kinds.join(' + ')} (v${versionName}, code ${versionCode})` +
    (drive ? ` from ${drive}\\ (short path)…` : '…'),
);
const gradleArgs = [
  ...tasks,
  // Real phones only: arm64 + 32-bit ARM. (x86/x86_64 are just for emulators.)
  '-PreactNativeArchitectures=armeabi-v7a,arm64-v8a',
  '--console=plain',
];
const spawnOptions = {
  cwd: buildAndroid,
  stdio: 'inherit',
  env: { ...process.env, PROJECT_REAL_ROOT: ROOT },
};
// Windows needs a shell to run the .bat; pass one command string (no separate args).
const run =
  process.platform === 'win32'
    ? spawnSync(`${gradlew} ${gradleArgs.join(' ')}`, {
        ...spawnOptions,
        shell: true,
      })
    : spawnSync(gradlew, gradleArgs, spawnOptions);
unmap();
if (run.status !== 0) {
  console.error('\n❌ Gradle build failed.');
  process.exit(run.status ?? 1);
}

mkdirSync(DIST, { recursive: true });
for (const kind of kinds) {
  const dest = join(DIST, `CallMeDumb-${versionName}-${versionCode}.${kind}`);
  copyFileSync(TARGETS[kind].output, dest);
  console.log(`✅ ${dest}`);
}
console.log(
  '\nBefore your next Play upload, bump versionCode (and versionName) in android/app/build.gradle.',
);
