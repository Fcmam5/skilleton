import { Command, CommandArgs } from './types';
import { SkillsetEnvironment } from '../env';
import { LockedSkill, SkillDescriptor } from '../core/types';
import { ManifestNotFoundError } from '../core/errors';

function shortSha(commit?: string): string {
  return commit ? commit.slice(0, 7) : '———';
}

export class ListCommand implements Command {
  async run(env: SkillsetEnvironment, _args: CommandArgs): Promise<void> {
    try {
      const manifest = await env.manifestRepo.readManifest();
      env.validator.validate(manifest);

      const lockfile = await env.manifestRepo.readLockfileIfExists();
      if (manifest.skills.length === 0) {
        console.log('No skills declared yet. Use "skillset add" to add one.');
        return;
      }

      console.log('Installed skills:\n');
      this.printTable(manifest.skills, lockfile?.skills ?? {});
    } catch (error) {
      if (error instanceof ManifestNotFoundError) {
        console.log('No skillset.json found. Run "skillset add" to create one.');
        return;
      }
      throw error;
    }
  }

  private printTable(skills: SkillDescriptor[], locked: Record<string, LockedSkill>): void {
    const header = ['Name', 'Repo', 'Path', 'Ref', 'Commit'];
    console.log(header.join(' | '));
    console.log('-----|-----|-----|-----|-------');

    for (const skill of skills) {
      const lock = locked[skill.name];
      const row = [skill.name, skill.repo, skill.path, skill.ref, shortSha(lock?.commit)];
      console.log(row.join(' | '));
    }
  }
}
