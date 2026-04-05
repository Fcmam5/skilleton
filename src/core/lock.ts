import { LockedSkill, SkillDescriptor, SkillLockfile } from './types';

interface ReconcileLockfileOptions {
  skills: SkillDescriptor[];
  existingLock: SkillLockfile | null;
  resolveSkills: (_skills: SkillDescriptor[], _options?: { lockfile?: SkillLockfile | null }) => Promise<LockedSkill[]>;
  writeLockfile: (_lockfile: SkillLockfile) => Promise<void>;
}

/**
 * Result details returned by lockfile reconciliation.
 */
export interface ReconcileLockfileResult {
  /**
   * Resolved skills with their lockfile details.
   */
  resolvedSkills: LockedSkill[];
  /**
   * The next lockfile state after reconciliation.
   */
  nextLockfile: SkillLockfile;
  /**
   * Skills that have changed compared to the previous lockfile.
   */
  changed: LockedSkill[];
  /**
   * Whether any removed entries were pruned from the lockfile.
   */
  prunedRemovedEntries: boolean;
  /**
   * Whether the number of locks in the lockfile has changed.
   */
  lockCountChanged: boolean;
  /**
   * Whether the lockfile was written to disk.
   */
  wroteLockfile: boolean;
  createdLockfile: boolean;
}

/** Converts resolved skills into lockfile record format keyed by skill name. */
export function serializeLockfile(skills: LockedSkill[]): SkillLockfile {
  const record: SkillLockfile['skills'] = {};
  for (const skill of skills) {
    record[skill.name] = skill;
  }
  return { skills: record };
}

/** Returns skills that are new or changed compared with a previous lockfile. */
export function getChangedSkills(nextSkills: LockedSkill[], previous: SkillLockfile | null): LockedSkill[] {
  if (!previous) {
    return nextSkills;
  }

  return nextSkills.filter((skill) => {
    const prior = previous.skills[skill.name];
    if (!prior) {
      return true;
    }
    return (
      prior.commit !== skill.commit || prior.repo !== skill.repo || prior.path !== skill.path || prior.ref !== skill.ref
    );
  });
}

/** Removes lockfile entries whose skill names are no longer declared. */
export function pruneLockfile(lockfile: SkillLockfile, names: string[]): SkillLockfile {
  const keep = new Set(names);
  const nextSkills: SkillLockfile['skills'] = {};

  for (const [name, skill] of Object.entries(lockfile.skills)) {
    if (keep.has(name)) {
      nextSkills[name] = skill;
    }
  }

  return { skills: nextSkills };
}

/** Resolves manifest skills, computes lockfile diffs, and writes updates only when needed. */
export async function reconcileLockfile(options: ReconcileLockfileOptions): Promise<ReconcileLockfileResult> {
  const { skills, existingLock, resolveSkills, writeLockfile } = options;

  const manifestSkillNames = skills.map((skill) => skill.name);
  const prunedLock = existingLock ? pruneLockfile(existingLock, manifestSkillNames) : null;

  const resolvedSkills = await resolveSkills(skills, {
    lockfile: prunedLock,
  });
  const nextLockfile = serializeLockfile(resolvedSkills);
  const changed = getChangedSkills(resolvedSkills, prunedLock);

  if (!existingLock) {
    await writeLockfile(nextLockfile);
    return {
      resolvedSkills,
      nextLockfile,
      changed,
      prunedRemovedEntries: false,
      lockCountChanged: false,
      wroteLockfile: true,
      createdLockfile: true,
    };
  }

  const lockCountChanged = Object.keys(prunedLock!.skills).length !== Object.keys(nextLockfile.skills).length;
  const prunedRemovedEntries = Object.keys(existingLock.skills).length !== Object.keys(prunedLock!.skills).length;
  const shouldWrite = changed.length > 0 || lockCountChanged || prunedRemovedEntries;

  if (shouldWrite) {
    await writeLockfile(nextLockfile);
  }

  return {
    resolvedSkills,
    nextLockfile,
    changed,
    prunedRemovedEntries,
    lockCountChanged,
    wroteLockfile: shouldWrite,
    createdLockfile: false,
  };
}
