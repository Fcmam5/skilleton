import path from 'node:path';
import { FileSystem, GitClient, InstallOptions, InstallResult, LockedSkill } from './types';
import { getAgentSymlinkPath, getSkillsInstallPath, getSkillsRoot } from './config';
import { SkillInstallError } from './errors';

function resolveAgent(options: InstallOptions): string | null {
  return options.agent ?? process.env.SKILLSET_AGENT ?? process.env.AGENT ?? null;
}

export class SkillInstaller {
  constructor(
    private readonly fs: FileSystem,
    private readonly git: GitClient,
  ) {}

  async install(skills: LockedSkill[], options: InstallOptions = {}): Promise<InstallResult[]> {
    if (!skills.length) {
      return [];
    }

    const cwd = options.cwd ?? process.cwd();
    await this.fs.ensureDir(getSkillsRoot(cwd));
    const agent = resolveAgent(options);
    const results: InstallResult[] = [];

    for (const skill of skills) {
      const repoPath = await this.git.ensureRepo(skill.repo);
      const targetDir = getSkillsInstallPath(skill.name, cwd);
      await this.git.exportPath(repoPath, skill.commit, targetDir, skill.path);
      await this.assertSkillMetadata(targetDir, skill);
      if (agent) {
        const symlinkPath = getAgentSymlinkPath(agent, skill.name, cwd);
        await this.fs.symlink(targetDir, symlinkPath);
      }

      results.push({
        name: skill.name,
        installPath: targetDir,
        commit: skill.commit,
      });
    }

    return results;
  }

  private async assertSkillMetadata(targetDir: string, skill: LockedSkill) {
    const skillFile = path.join(targetDir, 'SKILL.md');
    if (!(await this.fs.pathExists(targetDir))) {
      throw new SkillInstallError(`Skill path missing after export: ${skill.name}`);
    }
    if (!(await this.fs.pathExists(skillFile))) {
      throw new SkillInstallError(`Missing SKILL.md for ${skill.name} (repo: ${skill.repo}, path: ${skill.path})`);
    }
  }
}
