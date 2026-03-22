import { AddCommand } from '../src/commands/add';
import { SkilletonEnvironment } from '../src/env';
import { ManifestValidator, ManifestValidationError } from '../src/core/validate';
import { normalizeDescriptor } from '../src/core/repos';
import { LockedSkill, SkillDescriptor, SkillLockfile, SkillManifest } from '../src/core/types';

class InMemoryManifestRepository {
  private manifest: SkillManifest | null = null;
  private lockfile: SkillLockfile | null = null;

  async readManifest(): Promise<SkillManifest> {
    if (!this.manifest) {
      throw new ManifestValidationError('Manifest missing');
    }
    return this.manifest;
  }

  async readOrInitializeManifest(): Promise<SkillManifest> {
    if (!this.manifest) {
      this.manifest = {
        $schema: './skilleton.schema.json',
        skills: [],
      };
    }
    return this.manifest;
  }

  async writeManifest(manifest: SkillManifest): Promise<void> {
    this.manifest = {
      ...manifest,
      skills: manifest.skills.map((skill) => normalizeDescriptor(skill)),
    };
  }

  async readLockfileIfExists(): Promise<SkillLockfile | null> {
    return this.lockfile;
  }

  async writeLockfile(lockfile: SkillLockfile): Promise<void> {
    this.lockfile = lockfile;
  }

  getSnapshot() {
    return { manifest: this.manifest, lockfile: this.lockfile };
  }
}

class FakeResolver {
  public readonly requests: SkillDescriptor[][] = [];

  async resolve(descriptors: SkillDescriptor[]): Promise<LockedSkill[]> {
    this.requests.push(descriptors);
    return descriptors.map((descriptor) => ({
      ...descriptor,
      commit: `sha-${descriptor.name}`,
      timestamp: '2026-03-22T00:00:00.000Z',
    }));
  }
}

class FakeInstaller {
  public readonly installs: LockedSkill[][] = [];

  async install(skills: LockedSkill[]): Promise<{ name: string; installPath: string; commit: string }[]> {
    this.installs.push(skills);
    return skills.map((skill) => ({
      name: skill.name,
      installPath: `.skilleton/skills/${skill.name}`,
      commit: skill.commit,
    }));
  }
}

describe('end-to-end command flow', () => {
  it('adds a skill, normalizes repo URLs, resolves commits, and installs', async () => {
    const manifestRepo = new InMemoryManifestRepository();
    const resolver = new FakeResolver();
    const installer = new FakeInstaller();
    const validator = new ManifestValidator();

    const env: SkilletonEnvironment = {
      fs: null as never,
      validator,
      manifestRepo: manifestRepo as never,
      github: null as never,
      git: null as never,
      resolver: resolver as never,
      installer: installer as never,
    };

    const command = new AddCommand();
    await command.run(env, { positional: ['mindrally/jest@dev'], flags: {} });

    const snapshot = manifestRepo.getSnapshot();
    expect(snapshot.manifest?.skills).toHaveLength(1);
    expect(snapshot.manifest?.skills[0]).toMatchObject({
      name: 'jest',
      repo: 'https://github.com/mindrally/skills',
      path: 'jest',
      ref: 'dev',
    });

    expect(snapshot.lockfile?.skills.jest.commit).toBe('sha-jest');
    expect(resolver.requests).toHaveLength(1);
    expect(installer.installs[0][0]).toMatchObject({ name: 'jest', commit: 'sha-jest' });
  });
});
