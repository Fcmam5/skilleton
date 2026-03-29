import { getChangedSkills, serializeLockfile } from '../src/core/lock';
import { LockedSkill, SkillLockfile } from '../src/core/types';

const baseSkills: LockedSkill[] = [
  {
    name: 'alpha',
    repo: 'https://github.com/acme/skills',
    path: 'alpha',
    ref: 'main',
    commit: '1111111111111111111111111111111111111111',
    timestamp: '2024-01-01T00:00:00.000Z',
  },
  {
    name: 'beta',
    repo: 'https://github.com/acme/skills',
    path: 'beta',
    ref: 'dev',
    commit: '2222222222222222222222222222222222222222',
    timestamp: '2024-01-02T00:00:00.000Z',
  },
];

describe('lock helpers', () => {
  describe('serializeLockfile', () => {
    it('converts array of skills into keyed record', () => {
      const lockfile = serializeLockfile(baseSkills);
      expect(lockfile.skills).toHaveProperty('alpha');
      expect(lockfile.skills.alpha.commit).toBe(baseSkills[0].commit);
      expect(lockfile.skills.beta.ref).toBe('dev');
    });

    it('overwrites duplicate entries with last entry', () => {
      const duplicateSkills: LockedSkill[] = [...baseSkills, { ...baseSkills[0], commit: '3333333333333333333333333333333333333333' }];
      const lockfile = serializeLockfile(duplicateSkills);
      expect(lockfile.skills.alpha.commit).toBe('3333333333333333333333333333333333333333');
    });
  });

  describe('getChangedSkills', () => {
    it('returns all skills when there is no previous lockfile', () => {
      const changes = getChangedSkills(baseSkills, null);
      expect(changes).toEqual(baseSkills);
    });

    it('returns skills with differing commit/repo/path/ref', () => {
      const previous: SkillLockfile = serializeLockfile(baseSkills);
      const next: LockedSkill[] = [
        { ...baseSkills[0], commit: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' },
        { ...baseSkills[1] },
        {
          name: 'gamma',
          repo: 'https://github.com/acme/skills',
          path: 'gamma',
          ref: 'main',
          commit: '4444444444444444444444444444444444444444',
          timestamp: '2024-01-03T00:00:00.000Z',
        },
      ];

      const changes = getChangedSkills(next, previous);
      expect(changes).toHaveLength(2);
      expect(changes.map((skill) => skill.name)).toEqual(['alpha', 'gamma']);
    });

    it('returns empty array when nothing changed', () => {
      const previous: SkillLockfile = serializeLockfile(baseSkills);
      const changes = getChangedSkills([...baseSkills], previous);
      expect(changes).toEqual([]);
    });
  });
});
