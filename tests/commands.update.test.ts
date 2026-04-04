import { UpdateCommand } from '../src/commands/update';
import { ManifestRepository } from '../src/core/manifest';
import { ManifestValidator } from '../src/core/validate';
import { SkillResolver } from '../src/core/resolve';
import { SkillInstaller } from '../src/core/install';
import { SkilletonEnvironment } from '../src/env';
import { InstallResult, LockedSkill, SkillDescriptor, SkillManifest, SkillLockfile } from '../src/core/types';

interface TestEnv {
  env: SkilletonEnvironment;
  manifestRepo: jest.Mocked<Pick<ManifestRepository, 'readManifest' | 'readLockfileIfExists' | 'writeLockfile'>>;
  validator: jest.Mocked<Pick<ManifestValidator, 'validate'>>;
  resolver: jest.Mocked<Pick<SkillResolver, 'resolve'>>;
  installer: jest.Mocked<Pick<SkillInstaller, 'install'>>;
}

const baseDescriptor: SkillDescriptor = {
  name: 'skill1',
  repo: 'owner/repo',
  path: '.',
  ref: 'main',
};

const baseLockedSkill: LockedSkill = {
  ...baseDescriptor,
  commit: 'abc123',
  timestamp: '2023-01-01T00:00:00Z',
};

const baseInstallResult: InstallResult = {
  name: 'skill1',
  commit: 'abc123',
  installPath: '.skilleton/skills/skill1',
};

function createTestEnv(): TestEnv {
  const manifestRepo = {
    readManifest: jest.fn<Promise<SkillManifest>, []>(),
    readLockfileIfExists: jest.fn<Promise<SkillLockfile | null>, []>(),
    writeLockfile: jest.fn<Promise<void>, [SkillLockfile]>(),
  } as jest.Mocked<Pick<ManifestRepository, 'readManifest' | 'readLockfileIfExists' | 'writeLockfile'>>;

  const validator = {
    validate: jest.fn<void, [SkillManifest]>(),
  } as jest.Mocked<Pick<ManifestValidator, 'validate'>>;

  const resolver = {
    resolve: jest.fn<Promise<LockedSkill[]>, [SkillDescriptor[], { lockfile?: SkillLockfile | null }?]>(),
  } as jest.Mocked<Pick<SkillResolver, 'resolve'>>;

  const installer = {
    install: jest.fn<Promise<InstallResult[]>, [LockedSkill[], { agent?: string }]>(),
  } as jest.Mocked<Pick<SkillInstaller, 'install'>>;

  const env = {
    fs: {} as any,
    git: {} as any,
    manifestRepo: manifestRepo as unknown as ManifestRepository,
    validator: validator as unknown as ManifestValidator,
    resolver: resolver as unknown as SkillResolver,
    installer: installer as unknown as SkillInstaller,
  } as SkilletonEnvironment;

  return { env, manifestRepo, validator, resolver, installer };
}

describe('UpdateCommand', () => {
  let command: UpdateCommand;
  let testEnv: TestEnv;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    testEnv = createTestEnv();
    command = new UpdateCommand();
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('falls back to full install when lockfile is missing', async () => {
    const manifest: SkillManifest = { skills: [baseDescriptor] };
    const resolved = [baseLockedSkill];

    testEnv.manifestRepo.readManifest.mockResolvedValue(manifest);
    testEnv.manifestRepo.readLockfileIfExists.mockResolvedValue(null);
    testEnv.resolver.resolve.mockResolvedValue(resolved);
    testEnv.installer.install.mockResolvedValue([baseInstallResult]);

    await command.run(testEnv.env, { positional: [], flags: {} });

    expect(logSpy).toHaveBeenCalledWith('No lockfile detected. Running full install...');
    expect(logSpy).toHaveBeenCalledWith('Created skilleton.lock.json');
    expect(testEnv.manifestRepo.writeLockfile).toHaveBeenCalledTimes(1);
  });

  it('prunes lockfile without reinstall when only removed skills are detected', async () => {
    const manifest: SkillManifest = { skills: [baseDescriptor] };
    const existingLock: SkillLockfile = {
      skills: {
        skill1: baseLockedSkill,
        removedSkill: {
          name: 'removedSkill',
          repo: 'owner/removed',
          path: '.',
          ref: 'main',
          commit: 'def456',
          timestamp: '2023-01-01T00:00:00Z',
        },
      },
    };

    testEnv.manifestRepo.readManifest.mockResolvedValue(manifest);
    testEnv.manifestRepo.readLockfileIfExists.mockResolvedValue(existingLock);
    testEnv.resolver.resolve.mockResolvedValue([baseLockedSkill]);

    await command.run(testEnv.env, { positional: [], flags: {} });

    expect(testEnv.manifestRepo.writeLockfile).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith('Pruned skilleton.lock.json to match skilleton.json');
    expect(testEnv.installer.install).not.toHaveBeenCalled();
  });

  it('updates lockfile and reinstalls changed skills only', async () => {
    const manifest: SkillManifest = { skills: [baseDescriptor] };
    const existingLock: SkillLockfile = {
      skills: {
        skill1: {
          ...baseLockedSkill,
          commit: 'old-commit',
        },
      },
    };
    const resolved: LockedSkill[] = [baseLockedSkill];

    testEnv.manifestRepo.readManifest.mockResolvedValue(manifest);
    testEnv.manifestRepo.readLockfileIfExists.mockResolvedValue(existingLock);
    testEnv.resolver.resolve.mockResolvedValue(resolved);
    testEnv.installer.install.mockResolvedValue([baseInstallResult]);

    await command.run(testEnv.env, { positional: [], flags: { agent: 'qa-agent' } });

    expect(testEnv.manifestRepo.writeLockfile).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith('skilleton.lock.json updated. Reinstalling changed skills...');
    expect(testEnv.installer.install).toHaveBeenCalledWith(
      resolved,
      expect.objectContaining({ agent: 'qa-agent' }),
    );
    expect(logSpy).toHaveBeenCalledWith('Updated skill1 → abc123');
  });

  it('reports up-to-date when no lock or commit changes are found', async () => {
    const manifest: SkillManifest = { skills: [baseDescriptor] };
    const existingLock: SkillLockfile = {
      skills: {
        skill1: baseLockedSkill,
      },
    };

    testEnv.manifestRepo.readManifest.mockResolvedValue(manifest);
    testEnv.manifestRepo.readLockfileIfExists.mockResolvedValue(existingLock);
    testEnv.resolver.resolve.mockResolvedValue([baseLockedSkill]);

    await command.run(testEnv.env, { positional: [], flags: {} });

    expect(logSpy).toHaveBeenCalledWith('All skills already up to date.');
    expect(testEnv.manifestRepo.writeLockfile).not.toHaveBeenCalled();
    expect(testEnv.installer.install).not.toHaveBeenCalled();
  });
});
