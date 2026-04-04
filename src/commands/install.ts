import { Command, CommandArgs } from './types';
import { SkilletonEnvironment } from '../env';
import { LockedSkill } from '../core/types';
import { getChangedSkills, pruneLockfile, serializeLockfile } from '../core/lock';

export class InstallCommand implements Command {
  async run(env: SkilletonEnvironment, args: CommandArgs): Promise<void> {
    const manifest = await env.manifestRepo.readManifest();
    env.validator.validate(manifest);

    const existingLock = await env.manifestRepo.readLockfileIfExists();
    if (!existingLock) {
      console.warn('No lockfile detected. Installing skills and creating skilleton.lock.json...');
    }

    const manifestSkillNames = manifest.skills.map((skill) => skill.name);
    const prunedLock = existingLock ? pruneLockfile(existingLock, manifestSkillNames) : null;

    const lockedSkills: LockedSkill[] = await env.resolver.resolve(manifest.skills, {
      lockfile: prunedLock,
    });
    const nextLockfile = serializeLockfile(lockedSkills);

    if (!existingLock) {
      await env.manifestRepo.writeLockfile(nextLockfile);
      console.log('Created skilleton.lock.json');
    } else {
      const lockForComparison = prunedLock!;
      const changed = getChangedSkills(lockedSkills, lockForComparison);
      const lockCountChanged = Object.keys(lockForComparison.skills).length !== Object.keys(nextLockfile.skills).length;
      const prunedRemovedEntries =
        Object.keys(existingLock.skills).length !== Object.keys(lockForComparison.skills).length;
      if (changed.length > 0 || lockCountChanged || prunedRemovedEntries) {
        await env.manifestRepo.writeLockfile(nextLockfile);
        if (prunedRemovedEntries && changed.length === 0 && !lockCountChanged) {
          console.log('Pruned skilleton.lock.json to match skilleton.json');
        } else {
          console.log('Updated skilleton.lock.json to match skilleton.json');
        }
      }
    }

    const agentFlag = this.parseAgentFlag(args);
    const results = await env.installer.install(lockedSkills, {
      agent: agentFlag,
    });

    for (const result of results) {
      console.log(`Installed ${result.name} @ ${result.commit} → ${result.installPath}`);
    }
  }

  private parseAgentFlag(args: CommandArgs): string | undefined {
    const agent = args.flags.agent;
    if (typeof agent === 'string') {
      return agent;
    }
    return undefined;
  }
}
