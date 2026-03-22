import { LockedSkill, SkillLockfile } from './types';

export function serializeLockfile(skills: LockedSkill[]): SkillLockfile {
  const record: SkillLockfile['skills'] = {};
  for (const skill of skills) {
    record[skill.name] = skill;
  }
  return { skills: record };
}

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
