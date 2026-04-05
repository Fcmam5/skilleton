import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execa } from 'execa';
import { GitClient } from '../core/types';
import { getCacheRoot } from '../core/config';
import { ensureRepoUrl, repoCacheKey } from '../core/repos';
import { SkillInstallError } from '../core/errors';

// Reference: https://git-scm.com/book/en/v2/Git-Tools-Revision-Selection
// Pattern to match a 40-character hexadecimal SHA-1 hash
const COMMIT_SHA_PATTERN = /^[0-9a-f]{40}$/i;

async function pathExists(target: string): Promise<boolean> {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

// Rejects values that could be interpreted as git options or null bytes
// This is a security measure to prevent command injection when passing values to git commands as arguments
function assertSafeGitArg(value: string, label: string): void {
  if (!value || value.includes('\0') || value.startsWith('-')) {
    throw new SkillInstallError(`Invalid ${label}`);
  }
}

// Resolves a sub-path relative to a base directory, ensuring it stays within the base.
// Rejects absolute paths and paths that would escape the base directory.
function resolveSafeSubPath(baseDir: string, subPath?: string): string {
  if (!subPath || subPath === '.') {
    return baseDir;
  }

  if (path.isAbsolute(subPath)) {
    throw new SkillInstallError(`Invalid skill path ${subPath}`);
  }

  const normalized = path.resolve(baseDir, subPath);
  const relativeToBase = path.relative(baseDir, normalized);
  if (relativeToBase.startsWith('..') || path.isAbsolute(relativeToBase)) {
    throw new SkillInstallError(`Invalid skill path ${subPath}`);
  }

  return normalized;
}

/** Git client implementation backed by `execa` shell commands. */
export class ExecaGitClient implements GitClient {
  constructor(private readonly cacheRoot = getCacheRoot()) {}

  /**
   * Ensures a repository is present in local cache and fetches updates when already cloned.
   * @param repo Repository spec or URL.
   * @param destination Optional explicit cache path.
   */
  async ensureRepo(repo: string, destination?: string): Promise<string> {
    const repoCachePath = destination ?? path.join(this.cacheRoot, repoCacheKey(repo));
    const repoUrl = ensureRepoUrl(repo);
    const cloneSource = `${repoUrl}.git`.replace(/\.git\.git$/i, '.git');
    const gitEnv = { ...process.env, GIT_TERMINAL_PROMPT: '0' };

    // Security: Validate paths to prevent command injection
    assertSafeGitArg(repoCachePath, 'repository cache path');
    assertSafeGitArg(cloneSource, 'repository URL');

    if (!(await pathExists(repoCachePath))) {
      await fs.mkdir(path.dirname(repoCachePath), { recursive: true });
      // Security: Validate paths to prevent command injection
      await execa('git', ['clone', '--filter=blob:none', '--', cloneSource, repoCachePath], {
        timeout: 30000,
        env: gitEnv,
        stdin: 'ignore',
        stdout: 'pipe',
        stderr: 'pipe',
      });
    } else {
      await execa('git', ['-C', repoCachePath, 'fetch', '--tags', '--prune', '--force'], {
        timeout: 30000,
        env: gitEnv,
        stdin: 'ignore',
        stdout: 'pipe',
        stderr: 'pipe',
      });
    }

    return repoCachePath;
  }

  /**
   * Exports a repository path at a specific commit into a destination directory.
   * @param repoPath Local cached repository path.
   * @param commit Commit SHA to export.
   * @param destination Output directory.
   * @param subPath Optional subdirectory within the repository.
   */
  async exportPath(repoPath: string, commit: string, destination: string, subPath?: string): Promise<void> {
    assertSafeGitArg(repoPath, 'repository path');
    assertSafeGitArg(destination, 'destination path');
    if (!COMMIT_SHA_PATTERN.test(commit)) {
      throw new SkillInstallError(`Invalid commit SHA: ${commit}`);
    }

    const worktreeDir = await fs.mkdtemp(path.join(os.tmpdir(), 'skilleton-wt-'));
    const gitEnv = { ...process.env, GIT_TERMINAL_PROMPT: '0' };

    try {
      await execa('git', ['-C', repoPath, 'worktree', 'add', '--force', '--detach', worktreeDir, commit], {
        timeout: 30000,
        env: gitEnv,
        stdin: 'ignore',
        stdout: 'pipe',
        stderr: 'pipe',
      });

      const sourcePath = resolveSafeSubPath(worktreeDir, subPath);
      if (!(await pathExists(sourcePath))) {
        throw new SkillInstallError(`Skill path ${subPath ?? '.'} not found in repository ${repoPath}`);
      }

      await fs.rm(destination, { recursive: true, force: true });
      await fs.mkdir(path.dirname(destination), { recursive: true });
      await fs.cp(sourcePath, destination, { recursive: true });
    } catch (error) {
      throw new SkillInstallError(
        `Failed to export ${subPath ?? '.'} from ${repoPath}@${commit}: ${(error as Error).message}`,
      );
    } finally {
      await execa('git', ['-C', repoPath, 'worktree', 'remove', '--force', worktreeDir], {
        timeout: 30000,
        env: gitEnv,
        stdin: 'ignore',
        stdout: 'pipe',
        stderr: 'pipe',
      }).catch(() => undefined);
      await fs.rm(worktreeDir, { recursive: true, force: true }).catch(() => undefined);
    }
  }
}
