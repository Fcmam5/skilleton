import path from 'node:path';
import { Command, CommandArgs } from './types';
import { SkilletonEnvironment } from '../env';
import { LockedSkill, SkillDescriptor } from '../core/types';
import { ManifestNotFoundError } from '../core/errors';

export class DescribeCommand implements Command {
  async run(env: SkilletonEnvironment, args: CommandArgs): Promise<void> {
    const [skillName] = args.positional;
    if (!skillName) {
      console.log('Usage: skilleton describe <skill-name>');
      return;
    }

    try {
      const manifest = await env.manifestRepo.readManifest();
      const skill = manifest.skills.find((entry) => entry.name === skillName);
      if (!skill) {
        console.log(`Skill "${skillName}" is not declared in skilleton.json.`);
        return;
      }

      const lockfile = await env.manifestRepo.readLockfileIfExists();
      const locked = this.getLockedSkillByName(lockfile, skillName);
      const installPath = env.manifestRepo.skillInstallPath(skillName);
      const installed = await env.fs.pathExists(installPath);

      this.printMetadata(skill, locked, installPath, installed);

      if (!installed) {
        console.log('');
        console.log('Install the skill with "skilleton install" to inspect its contents.');
        return;
      }

      await this.printFolderStructure(env, installPath);
      await this.printSkillHeader(env, installPath);
    } catch (error) {
      if (error instanceof ManifestNotFoundError) {
        console.log('No skilleton.json found. Run "skilleton add" to create one.');
        return;
      }
      throw error;
    }
  }

  private getLockedSkillByName(
    lockfile: { skills: Record<string, LockedSkill> } | null,
    skillName: string,
  ): LockedSkill | undefined {
    if (!lockfile) {
      return undefined;
    }

    const skillsByName = new Map(Object.entries(lockfile.skills));
    return skillsByName.get(skillName);
  }

  private printMetadata(
    skill: SkillDescriptor,
    locked: LockedSkill | undefined,
    installPath: string,
    installed: boolean,
  ): void {
    console.log(`Name: ${skill.name}`);
    console.log(`Repo: ${skill.repo}`);
    console.log(`Path: ${skill.path}`);
    console.log(`Ref: ${skill.ref}`);
    console.log(`Commit: ${locked?.commit ?? 'Not locked'}`);
    console.log(`Install path: ${installPath}${installed ? '' : ' (not installed)'}`);
  }

  private async printFolderStructure(env: SkilletonEnvironment, installPath: string): Promise<void> {
    console.log('');
    console.log('Folder structure:');
    const entries = await this.collectEntries(env, installPath);
    if (entries.length === 0) {
      console.log('  (empty)');
      return;
    }

    for (const entry of entries) {
      console.log(`  ${entry}`);
    }
  }

  private async collectEntries(env: SkilletonEnvironment, dir: string, prefix = ''): Promise<string[]> {
    const entries: string[] = [];
    const names = (await env.fs.readDir(dir)).sort((a, b) => a.localeCompare(b));

    for (const name of names) {
      const absolute = path.join(dir, name);
      const relative = prefix ? `${prefix}/${name}` : name;
      if (await env.fs.isDirectory(absolute)) {
        entries.push(`${relative}/`);
        const nested = await this.collectEntries(env, absolute, relative);
        entries.push(...nested);
      } else {
        entries.push(relative);
      }
    }

    return entries;
  }

  private async printSkillHeader(env: SkilletonEnvironment, installPath: string): Promise<void> {
    const skillFile = path.join(installPath, 'SKILL.md');
    const hasSkill = await env.fs.pathExists(skillFile);
    if (!hasSkill) {
      console.log('');
      console.log('No SKILL.md found.');
      return;
    }

    try {
      const content = await env.fs.readFile(skillFile);
      const header = this.extractFrontmatter(content);
      if (header) {
        console.log('');
        console.log('SKILL.md header:');
        console.log('---');
        for (const line of header.split('\n')) {
          console.log(line);
        }
        console.log('---');
      } else {
        console.log('');
        console.log('SKILL.md does not contain frontmatter.');
      }
    } catch (readError) {
      console.log('');
      console.log(`Unable to read SKILL.md: ${(readError as Error).message}`);
    }
  }

  private extractFrontmatter(content: string): string | null {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    return match ? match[1].trim() : null;
  }
}
