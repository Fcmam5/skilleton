import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execa } from 'execa';
import { GitClient } from '../core/types';
import { getCacheRoot } from '../core/config';
import { ensureRepoUrl, repoCacheKey } from '../core/repos';
import { SkillInstallError } from '../core/errors';

async function pathExists(target: string): Promise<boolean> {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
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

    if (!(await pathExists(repoCachePath))) {
      await fs.mkdir(path.dirname(repoCachePath), { recursive: true });
      await execa('git', ['clone', '--filter=blob:none', cloneSource, repoCachePath], {
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

      const relative = subPath && subPath !== '.' ? subPath : undefined;
      const sourcePath = relative ? path.join(worktreeDir, relative) : worktreeDir;
      if (!(await pathExists(sourcePath))) {
        throw new SkillInstallError(`Skill path ${relative ?? '.'} not found in repository ${repoPath}`);
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
