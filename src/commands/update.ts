import { Command, CommandArgs } from './types';
import { SkilletonEnvironment } from '../env';
import { getChangedSkills, pruneLockfile, serializeLockfile } from '../core/lock';

export class UpdateCommand implements Command {
  async run(env: SkilletonEnvironment, args: CommandArgs): Promise<void> {
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

    const manifestSkillNames = manifest.skills.map((skill) => skill.name);
    const prunedLock = pruneLockfile(existingLock, manifestSkillNames);

    const resolved = await env.resolver.resolve(manifest.skills, {
      lockfile: prunedLock,
    });
    const changed = getChangedSkills(resolved, prunedLock);
    const nextLockfile = serializeLockfile(resolved);
    const lockCountChanged = Object.keys(prunedLock.skills).length !== Object.keys(nextLockfile.skills).length;
    const prunedRemovedEntries = Object.keys(existingLock.skills).length !== Object.keys(prunedLock.skills).length;

    if (changed.length === 0 && !lockCountChanged && !prunedRemovedEntries) {
      console.log('All skills already up to date.');
      return;
    }

    await env.manifestRepo.writeLockfile(nextLockfile);
    if (changed.length === 0) {
      console.log('Pruned skilleton.lock.json to match skilleton.json');
      return;
    }

    console.log('skilleton.lock.json updated. Reinstalling changed skills...');

    const agentFlag = typeof args.flags.agent === 'string' ? (args.flags.agent as string) : undefined;
    const results = await env.installer.install(changed, {
      agent: agentFlag,
    });

    for (const result of results) {
      console.log(`Updated ${result.name} → ${result.commit}`);
    }
  }
}
