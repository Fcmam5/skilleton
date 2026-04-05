import { Command, CommandArgs } from './types';
import { SkilletonEnvironment } from '../env';
import { reconcileLockfile } from '../core/lock';

export class InstallCommand implements Command {
  async run(env: SkilletonEnvironment, args: CommandArgs): Promise<void> {
    const manifest = await env.manifestRepo.readManifest();
    env.validator.validate(manifest);

    const existingLock = await env.manifestRepo.readLockfileIfExists();
    if (!existingLock) {
      console.warn('No lockfile detected. Installing skills and creating skilleton.lock.json...');
    }

    const reconciliation = await reconcileLockfile({
      skills: manifest.skills,
      existingLock,
      resolveSkills: env.resolver.resolve.bind(env.resolver),
      writeLockfile: env.manifestRepo.writeLockfile.bind(env.manifestRepo),
    });
    const { resolvedSkills, changed, prunedRemovedEntries, lockCountChanged, wroteLockfile, createdLockfile } =
      reconciliation;

    if (createdLockfile) {
      console.log('Created skilleton.lock.json');
    } else if (wroteLockfile) {
      if (prunedRemovedEntries && changed.length === 0 && !lockCountChanged) {
        console.log('Pruned skilleton.lock.json to match skilleton.json');
      } else {
        console.log('Updated skilleton.lock.json to match skilleton.json');
      }
    }

    const agentFlag = this.parseAgentFlag(args);
    const results = await env.installer.install(resolvedSkills, {
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
