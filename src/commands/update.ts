import { Command, CommandArgs } from './types';
import { SkilletonEnvironment } from '../env';
import { reconcileLockfile } from '../core/lock';

/** Updates lockfile state and reinstalls changed skills only. */
export class UpdateCommand implements Command {
  /**
   * Re-resolves manifest skills and reinstalls only entries that changed.
   * @param env Runtime environment.
   * @param args Parsed command arguments.
   */
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

    const reconciliation = await reconcileLockfile({
      skills: manifest.skills,
      existingLock,
      resolveSkills: env.resolver.resolve.bind(env.resolver),
      writeLockfile: env.manifestRepo.writeLockfile.bind(env.manifestRepo),
    });
    const { changed, prunedRemovedEntries, lockCountChanged, wroteLockfile } = reconciliation;

    if (changed.length === 0 && !lockCountChanged && !prunedRemovedEntries) {
      console.log('All skills already up to date.');
      return;
    }

    if (changed.length === 0) {
      if (wroteLockfile) {
        console.log('Pruned skilleton.lock.json to match skilleton.json');
      }
      return;
    }

    if (!wroteLockfile) {
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
