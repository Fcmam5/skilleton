import { LockedSkill, SkillDescriptor, SkillLockfile } from './types';
import { SkillValidationError } from './errors';
import { GitRefResolver } from './git-ref-resolver';

/** Optional flags that control descriptor resolution behavior. */
export interface ResolveOptions {
  lockfile?: SkillLockfile | null;
  strictLock?: boolean;
}

/** Resolves skill descriptors into locked skills with commit SHAs. */
export class SkillResolver {
  constructor(private readonly refResolver: GitRefResolver) {}

  /**
   * Resolves all descriptors, reusing matching lockfile entries when possible.
   * @param descriptors Skill descriptors to resolve.
   * @param options Resolution options.
   */
  async resolve(descriptors: SkillDescriptor[], options: ResolveOptions = {}): Promise<LockedSkill[]> {
    if (!descriptors.length) {
      return [];
    }

    const lockSkills = options.lockfile?.skills ?? {};
    const resolved: LockedSkill[] = [];

    for (const descriptor of descriptors) {
      const locked = lockSkills[descriptor.name];
      if (locked && this.matchesDescriptor(locked, descriptor)) {
        resolved.push(locked);
        continue;
      }

      if (options.strictLock && !locked) {
        throw new SkillValidationError(`Skill ${descriptor.name} missing from lockfile. Run "skilleton update".`);
      }

      const commit = await this.refResolver.resolve(descriptor.repo, descriptor.ref);
      resolved.push({
        ...descriptor,
        commit,
        timestamp: new Date().toISOString(),
      });
    }

    return resolved;
  }

  private matchesDescriptor(locked: LockedSkill, descriptor: SkillDescriptor): boolean {
    return locked.repo === descriptor.repo && locked.path === descriptor.path && locked.ref === descriptor.ref;
  }
}
