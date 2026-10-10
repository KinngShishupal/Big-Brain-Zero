/**
 * react-native-audio-api runs a bash script (mkdir, rm, curl…) before every Android build,
 * using Git for Windows' bash.exe. From cmd.exe / PowerShell, Git's Unix tools folder isn't
 * on PATH, so that script fails with "mkdir: command not found". This adds it.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const GIT_ROOTS = [
  process.env.ProgramFiles && join(process.env.ProgramFiles, 'Git'),
  process.env['ProgramFiles(x86)'] &&
    join(process.env['ProgramFiles(x86)'], 'Git'),
  process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'Programs', 'Git'),
].filter(Boolean);

export function envWithGitTools(env = process.env) {
  if (process.platform !== 'win32') {
    return env;
  }
  const pathKey =
    Object.keys(env).find(k => k.toLowerCase() === 'path') ?? 'Path';
  const current = env[pathKey] ?? '';
  const extra = GIT_ROOTS.flatMap(root => [
    join(root, 'usr', 'bin'),
    join(root, 'bin'),
  ])
    .filter(dir => existsSync(dir))
    .filter(dir => !current.toLowerCase().includes(dir.toLowerCase()));
  if (extra.length === 0) {
    return env;
  }
  // Append (not prepend) so Windows tools keep priority for everything else.
  return { ...env, [pathKey]: `${current};${extra.join(';')}` };
}
