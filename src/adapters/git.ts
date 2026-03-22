import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execa } from 'execa';
import { GitClient } from '../core/types';
import { getCacheRoot, getRepoCachePath } from '../core/config';
import { SkillInstallError } from '../core/errors';

async function pathExists(target: string): Promise<boolean> {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

export class ExecaGitClient implements GitClient {
  constructor(private readonly cacheRoot = getCacheRoot()) {}

  async ensureRepo(repo: string, destination?: string): Promise<string> {
    const repoCachePath = destination ?? getRepoCachePath(repo);
    if (!(await pathExists(repoCachePath))) {
      await fs.mkdir(path.dirname(repoCachePath), { recursive: true });
      await execa('git', ['clone', '--filter=blob:none', `https://github.com/${repo}.git`, repoCachePath]);
    } else {
      await execa('git', ['-C', repoCachePath, 'fetch', '--tags', '--prune', '--force']);
    }

    return repoCachePath;
  }

  async exportPath(repoPath: string, commit: string, destination: string, subPath?: string): Promise<void> {
    const worktreeDir = await fs.mkdtemp(path.join(os.tmpdir(), 'skilleton-wt-'));
    try {
      await execa('git', ['-C', repoPath, 'worktree', 'add', '--force', '--detach', worktreeDir, commit]);

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
      await execa('git', ['-C', repoPath, 'worktree', 'remove', '--force', worktreeDir]).catch(() => undefined);
      await fs.rm(worktreeDir, { recursive: true, force: true }).catch(() => undefined);
    }
  }
}
