import { AddCommand } from '../src/commands/add';
import { SkilletonEnvironment } from '../src/env';
import { ManifestValidator, ManifestValidationError } from '../src/core/validate';
import { normalizeDescriptor } from '../src/core/repos';
import { SkillResolver } from '../src/core/resolve';
import { GitRefResolver } from '../src/core/git-ref-resolver';
import { LockedSkill, SkillLockfile, SkillManifest } from '../src/core/types';

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
  function createTestContext(refResolver: GitRefResolver) {
    const manifestRepo = new InMemoryManifestRepository();
    const resolver = new SkillResolver(refResolver);
    const installer = new FakeInstaller();
    const validator = new ManifestValidator();

    const env: SkilletonEnvironment = {
      fs: null as unknown as SkilletonEnvironment['fs'],
      validator: validator as unknown as SkilletonEnvironment['validator'],
      manifestRepo: manifestRepo as unknown as SkilletonEnvironment['manifestRepo'],
      git: null as unknown as SkilletonEnvironment['git'],
      resolver: resolver as unknown as SkilletonEnvironment['resolver'],
      installer: installer as unknown as SkilletonEnvironment['installer'],
    };

    return { env, manifestRepo, installer };
  }

  it('adds a folder-based skill from a skills monorepo path', async () => {
    const refResolver = {
      resolve: jest.fn().mockResolvedValueOnce('sha-jest-dev'),
    } as unknown as GitRefResolver;
    const { env, manifestRepo, installer } = createTestContext(refResolver);

    const command = new AddCommand();
    await command.run(env, { positional: ['mindrally/skills/jest@dev'], flags: {} });

    const snapshot = manifestRepo.getSnapshot();
    expect(snapshot.manifest?.skills[0]).toMatchObject({
      name: 'jest',
      repo: 'https://github.com/mindrally/skills',
      path: 'jest',
      ref: 'dev',
    });
    expect(snapshot.lockfile?.skills.jest).toMatchObject({
      commit: 'sha-jest-dev',
    });
    expect(refResolver.resolve).toHaveBeenCalledWith('https://github.com/mindrally/skills', 'dev');
    expect(installer.installs[0][0]).toMatchObject({
      name: 'jest',
      commit: 'sha-jest-dev',
    });
  });

  it('adds mhdcodes/react-query-skill from a root repository', async () => {
    const refResolver = {
      resolve: jest.fn().mockResolvedValueOnce('ba97adfb52a49fd8be112f1c58d5ae059d3d6537'),
    } as unknown as GitRefResolver;
    const { env, manifestRepo, installer } = createTestContext(refResolver);

    const command = new AddCommand();
    await command.run(env, { positional: ['mhdcodes/react-query-skill'], flags: {} });

    const snapshot = manifestRepo.getSnapshot();
    expect(snapshot.manifest?.skills[0]).toMatchObject({
      name: 'react-query-skill',
      repo: 'https://github.com/mhdcodes/react-query-skill',
      path: '.',
      ref: 'main',
    });
    expect(snapshot.lockfile?.skills['react-query-skill']).toMatchObject({
      repo: 'https://github.com/mhdcodes/react-query-skill',
      path: '.',
      commit: 'ba97adfb52a49fd8be112f1c58d5ae059d3d6537',
    });
    expect(refResolver.resolve).toHaveBeenCalledTimes(1);
    expect(refResolver.resolve).toHaveBeenCalledWith('https://github.com/mhdcodes/react-query-skill', 'main');
    expect(installer.installs[0][0]).toMatchObject({
      name: 'react-query-skill',
      repo: 'https://github.com/mhdcodes/react-query-skill',
      path: '.',
      commit: 'ba97adfb52a49fd8be112f1c58d5ae059d3d6537',
    });
  });
});
