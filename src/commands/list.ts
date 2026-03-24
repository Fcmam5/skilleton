import { Command, CommandArgs } from './types';
import { SkilletonEnvironment } from '../env';
import { LockedSkill, SkillDescriptor } from '../core/types';
import { ManifestNotFoundError } from '../core/errors';

function shortSha(commit?: string): string {
  return commit ? commit.slice(0, 7) : '———';
}

export class ListCommand implements Command {
  async run(env: SkilletonEnvironment, args: CommandArgs): Promise<void> {
    try {
      const manifest = await env.manifestRepo.readManifest();
      env.validator.validate(manifest);

      const lockfile = await env.manifestRepo.readLockfileIfExists();
      if (manifest.skills.length === 0) {
        console.log('No skills declared yet. Use "skilleton add" to add one.');
        return;
      }

      const format = this.parseFormatFlag(args);
      this.printSkills(manifest.skills, lockfile?.skills ?? {}, format);
    } catch (error) {
      if (error instanceof ManifestNotFoundError) {
        console.log('No skilleton.json found. Run "skilleton add" to create one.');
        return;
      }
      throw error;
    }
  }

  private parseFormatFlag(args: CommandArgs): string {
    const format = args.flags.format;
    if (typeof format === 'string') {
      return format.toLowerCase();
    }
    return 'table';
  }

  private printSkills(skills: SkillDescriptor[], locked: Record<string, LockedSkill>, format: string): void {
    switch (format) {
      case 'json':
        this.printJson(skills, locked);
        break;
      case 'table':
      default:
        this.printTable(skills, locked);
        break;
    }
  }

  private printJson(skills: SkillDescriptor[], locked: Record<string, LockedSkill>): void {
    const jsonData = skills.map((skill) => {
      const lock = locked[skill.name];
      return {
        name: skill.name,
        repo: skill.repo,
        path: skill.path,
        ref: skill.ref,
        commit: lock?.commit || null,
      };
    });
    console.log(JSON.stringify(jsonData, null, 2));
  }

  private printTable(skills: SkillDescriptor[], locked: Record<string, LockedSkill>): void {
    const tableData: Record<string, string>[] = [];

    for (const skill of skills) {
      const lock = locked[skill.name];
      tableData.push({
        Name: skill.name,
        Repo: skill.repo,
        Path: skill.path,
        Ref: skill.ref,
        Commit: shortSha(lock?.commit),
      });
    }

    console.table(tableData);
  }
}
