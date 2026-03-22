import { Command, CommandArgs } from './types';
import { SkilletonEnvironment } from '../env';
import { LockedSkill, SkillDescriptor } from '../core/types';
import { SkillValidationError } from '../core/errors';
import { serializeLockfile } from '../core/lock';

export class InstallCommand implements Command {
  async run(env: SkilletonEnvironment, args: CommandArgs): Promise<void> {
    const manifest = await env.manifestRepo.readManifest();
    env.validator.validate(manifest);

    const existingLock = await env.manifestRepo.readLockfileIfExists();
    const useLock = existingLock !== null;

    let lockedSkills: LockedSkill[];
    if (useLock && existingLock) {
      lockedSkills = manifest.skills.map((skill: SkillDescriptor) => {
        const locked = existingLock.skills[skill.name];
        if (!locked) {
          throw new SkillValidationError(`Skill ${skill.name} missing from lockfile. Run "skilleton update".`);
        }
        return locked;
      });
    } else {
      lockedSkills = await env.resolver.resolve(manifest.skills);
      await env.manifestRepo.writeLockfile(serializeLockfile(lockedSkills));
      console.log('Created skilleton.lock.json');
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
