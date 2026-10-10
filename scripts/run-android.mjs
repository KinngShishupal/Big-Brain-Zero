#!/usr/bin/env node
/**
 * `npm run android`: react-native run-android, with Git's Unix tools on PATH so the
 * audio library's pre-build script works from cmd.exe / PowerShell too.
 */
import { spawnSync } from 'node:child_process';
import { envWithGitTools } from './git-tools-env.mjs';

const args = ['react-native', 'run-android', ...process.argv.slice(2)];
const result =
  process.platform === 'win32'
    ? spawnSync(`npx ${args.join(' ')}`, {
        stdio: 'inherit',
        shell: true,
        env: envWithGitTools(),
      })
    : spawnSync('npx', args, { stdio: 'inherit', env: envWithGitTools() });
process.exit(result.status ?? 1);
