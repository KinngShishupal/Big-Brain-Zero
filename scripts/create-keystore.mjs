#!/usr/bin/env node
/**
 * Creates the Google Play upload keystore and the properties file Gradle reads.
 *
 *   npm run keystore
 *
 * Writes (both git-ignored):
 *   android/upload-keystore.jks
 *   android/keystore.properties
 *
 * BACK BOTH UP somewhere safe (password manager / cloud drive). If you lose the keystore or
 * its password you can't publish updates without asking Google to reset your upload key.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const ANDROID = join(dirname(fileURLToPath(import.meta.url)), '..', 'android');
const STORE_FILE = 'upload-keystore.jks';
const STORE_PATH = join(ANDROID, STORE_FILE);
const PROPS_PATH = join(ANDROID, 'keystore.properties');
const ALIAS = 'upload';

function ask(question, { hidden = false } = {}) {
  return new Promise(resolve => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      // Hide typed characters (passwords).
      rl._writeToOutput = s => {
        if (s.includes(question)) {
          rl.output.write(s);
        }
      };
    }
    rl.question(question, answer => {
      rl.close();
      if (hidden) {
        process.stdout.write('\n');
      }
      resolve(answer.trim());
    });
  });
}

if (existsSync(STORE_PATH) || existsSync(PROPS_PATH)) {
  console.error(
    `A keystore already exists:\n  ${STORE_PATH}\n  ${PROPS_PATH}\n` +
      'Refusing to overwrite it. Delete both files first if you really want a new key.',
  );
  process.exit(1);
}

const keytool = spawnSync('keytool', ['-help'], { stdio: 'ignore', shell: true });
if (keytool.status !== 0 && keytool.status !== 1) {
  console.error('keytool not found. Install JDK 17 and make sure its bin folder is on PATH.');
  process.exit(1);
}

console.log('Create your Google Play upload key.\n');
const name = (await ask('Your name (shown in the certificate): ')) || 'Unknown';
const country = ((await ask('Two-letter country code [IN]: ')) || 'IN').toUpperCase();

let password = '';
while (password.length < 8) {
  password = await ask('Keystore password (min 8 characters): ', { hidden: true });
  if (password.length < 8) {
    console.log('Too short, try again.');
    continue;
  }
  const again = await ask('Repeat password: ', { hidden: true });
  if (again !== password) {
    console.log("Passwords didn't match, try again.");
    password = '';
  }
}

const result = spawnSync(
  'keytool',
  [
    '-genkeypair',
    '-v',
    '-storetype', 'PKCS12',
    '-keystore', STORE_PATH,
    '-alias', ALIAS,
    '-keyalg', 'RSA',
    '-keysize', '2048',
    '-validity', '10000',
    '-dname', `CN=${name}, C=${country}`,
    '-storepass', password,
    '-keypass', password,
  ],
  { stdio: 'inherit' },
);
if (result.status !== 0) {
  console.error('keytool failed; no files were written.');
  process.exit(result.status ?? 1);
}

writeFileSync(
  PROPS_PATH,
  [
    '# Upload key for release builds. DO NOT COMMIT. Back this file and the .jks up safely.',
    `storeFile=${STORE_FILE}`,
    `storePassword=${password}`,
    `keyAlias=${ALIAS}`,
    `keyPassword=${password}`,
    '',
  ].join('\n'),
);

console.log(`\n✅ Created ${STORE_PATH}`);
console.log(`✅ Created ${PROPS_PATH}`);
console.log('\nBack up BOTH files now. Then build with `npm run build:aab` (Play) or `npm run build:apk`.');
