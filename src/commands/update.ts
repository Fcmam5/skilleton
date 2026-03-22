import { Command, CommandArgs } from './types';
import { SkillsetEnvironment } from '../env';
import { getChangedSkills, serializeLockfile } from '../core/lock';

export class UpdateCommand implements Command {
  async run(env: SkillsetEnvironment, args: CommandArgs): Promise<void> {
    const manifest = await env.manifestRepo.readManifest();
    env.validator.validate(manifest);

    const existingLock = await env.manifestRepo.readLockfileIfExists();
    if (!existingLock) {
      console.log('No lockfile detected. Running full install...');
      const installCommand = await import('./install');
      const cmd = new installCommand.InstallCommand();
      await cmd.run(env, args);
      return;
    }

    const resolved = await env.resolver.resolve(manifest.skills);
    const changed = getChangedSkills(resolved, existingLock);

    if (changed.length === 0) {
      console.log('All skills already up to date.');
      return;
    }

    await env.manifestRepo.writeLockfile(serializeLockfile(resolved));
    console.log('skillset.lock.json updated. Reinstalling changed skills...');

    const agentFlag = typeof args.flags.agent === 'string' ? (args.flags.agent as string) : undefined;
    const results = await env.installer.install(changed, {
      agent: agentFlag,
    });

    for (const result of results) {
      console.log(`Updated ${result.name} → ${result.commit}`);
    }
  }
}
