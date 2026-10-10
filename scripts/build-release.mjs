#!/usr/bin/env node
/**
 * Builds a signed release and copies it to dist/ with the version in the name.
 *
 *   npm run build:aab     → dist/CallMeDumb-<version>-<code>.aab  (upload this to Google Play)
 *   npm run build:apk     → dist/CallMeDumb-<version>-<code>.apk  (install directly on a phone)
 *   npm run build:release → both
 */
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ANDROID = join(ROOT, 'android');
const DIST = join(ROOT, 'dist');

const TARGETS = {
  apk: {
    task: 'assembleRelease',
    output: join(ANDROID, 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk'),
  },
  aab: {
    task: 'bundleRelease',
    output: join(ANDROID, 'app', 'build', 'outputs', 'bundle', 'release', 'app-release.aab'),
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

// Full, quoted path: the project folder may contain spaces, and cmd.exe won't search cwd reliably.
const gradlew =
  process.platform === 'win32'
    ? '"' + join(ANDROID, 'gradlew.bat') + '"'
    : './gradlew';
const tasks = kinds.map(k => TARGETS[k].task);
console.log(`Building ${kinds.join(' + ')} (v${versionName}, code ${versionCode})…`);
const run = spawnSync(gradlew, [...tasks, '--console=plain'], {
  cwd: ANDROID,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
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
