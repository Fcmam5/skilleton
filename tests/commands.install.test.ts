import { InstallCommand } from '../src/commands/install';
import { ManifestRepository } from '../src/core/manifest';
import { ManifestValidator } from '../src/core/validate';
import { SkillResolver } from '../src/core/resolve';
import { SkillInstaller } from '../src/core/install';
import { SkillValidationError } from '../src/core/errors';
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
    resolve: jest.fn<Promise<LockedSkill[]>, [SkillDescriptor[]]>(),
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

describe('InstallCommand', () => {
  let command: InstallCommand;
  let testEnv: TestEnv;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    testEnv = createTestEnv();
    command = new InstallCommand();
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('resolves refs, writes lockfile, and logs installs when no lock exists', async () => {
    const manifest: SkillManifest = { skills: [baseDescriptor] };
    const locked = [baseLockedSkill];
    const installs = [baseInstallResult];

    testEnv.manifestRepo.readManifest.mockResolvedValue(manifest);
    testEnv.manifestRepo.readLockfileIfExists.mockResolvedValue(null);
    testEnv.resolver.resolve.mockResolvedValue(locked);
    testEnv.installer.install.mockResolvedValue(installs);

    await command.run(testEnv.env, { positional: [], flags: {} });

    expect(testEnv.resolver.resolve).toHaveBeenCalledWith(manifest.skills);
    expect(testEnv.manifestRepo.writeLockfile).toHaveBeenCalledTimes(1);
    expect(testEnv.installer.install).toHaveBeenCalledWith(locked, expect.objectContaining({ agent: undefined }));
    expect(logSpy).toHaveBeenCalledWith('Created skilleton.lock.json');
    expect(logSpy).toHaveBeenCalledWith('Installed skill1 @ abc123 → .skilleton/skills/skill1');
  });

  it('installs using existing lockfile entries without resolving again', async () => {
    const manifest: SkillManifest = { skills: [baseDescriptor] };
    const locked = { skills: { skill1: baseLockedSkill } };

    testEnv.manifestRepo.readManifest.mockResolvedValue(manifest);
    testEnv.manifestRepo.readLockfileIfExists.mockResolvedValue(locked);
    testEnv.installer.install.mockResolvedValue([baseInstallResult]);

    await command.run(testEnv.env, { positional: [], flags: { agent: 'dev-agent' } });

    expect(testEnv.resolver.resolve).not.toHaveBeenCalled();
    expect(testEnv.installer.install).toHaveBeenCalledWith(
      [baseLockedSkill],
      expect.objectContaining({ agent: 'dev-agent' }),
    );
    expect(testEnv.manifestRepo.writeLockfile).not.toHaveBeenCalled();
  });

  it('throws when a manifest skill is missing from the lockfile', async () => {
    const manifest: SkillManifest = { skills: [baseDescriptor] };

    testEnv.manifestRepo.readManifest.mockResolvedValue(manifest);
    testEnv.manifestRepo.readLockfileIfExists.mockResolvedValue({ skills: {} });

    await expect(command.run(testEnv.env, { positional: [], flags: {} })).rejects.toThrow(SkillValidationError);
  });

  it('passes agent flag through to installer', async () => {
    const manifest: SkillManifest = { skills: [baseDescriptor] };
    const locked = [baseLockedSkill];
    const installs = [baseInstallResult];

    testEnv.manifestRepo.readManifest.mockResolvedValue(manifest);
    testEnv.manifestRepo.readLockfileIfExists.mockResolvedValue(null);
    testEnv.resolver.resolve.mockResolvedValue(locked);
    testEnv.installer.install.mockResolvedValue(installs);

    await command.run(testEnv.env, { positional: [], flags: { agent: 'qa-agent' } });

    expect(testEnv.installer.install).toHaveBeenCalledWith(locked, expect.objectContaining({ agent: 'qa-agent' }));
  });
});
