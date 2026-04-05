import { AddCommand } from '../src/commands/add';
import { parseSkillInput } from '../src/core/parse';
import { InstallCommand } from '../src/commands/install';
import type { SkilletonEnvironment } from '../src/env';
import type { SkillManifest, SkillDescriptor } from '../src/core/types';

const mockInstallRun = jest.fn();

jest.mock('../src/core/parse', () => ({
  parseSkillInput: jest.fn(),
}));

jest.mock('../src/commands/install', () => ({
  InstallCommand: jest.fn().mockImplementation(() => ({
    run: mockInstallRun,
  })),
}));

let consoleSpy: jest.SpyInstance;

describe('AddCommand', () => {
  const usageMessage = 'Usage: skilleton add <owner/skill[@ref]>';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy?.mockRestore();
  });

  it('throws when no skill input is provided', async () => {
    const command = new AddCommand();
    const { env } = createEnv();

    await expect(command.run(env, { positional: [], flags: {} })).rejects.toThrow(usageMessage);
    expect(parseSkillInput).not.toHaveBeenCalled();
    expect(mockInstallRun).not.toHaveBeenCalled();
  });

  it('adds or replaces the skill and triggers installation', async () => {
    const descriptor: SkillDescriptor = {
      name: 'jest',
      repo: 'https://github.com/mindrally/skills',
      path: 'jest',
      ref: 'main',
    };
    (parseSkillInput as jest.Mock).mockReturnValue(descriptor);

    const manifest: SkillManifest = {
      $schema: './skilleton.schema.json',
      skills: [
        {
          name: 'jest',
          repo: 'https://github.com/legacy/jest',
          path: 'old',
          ref: 'dev',
        },
      ],
    };

    const { env, manifestRepo, validator } = createEnv(manifest);
    const command = new AddCommand();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await command.run(env, { positional: ['owner/jest'], flags: {} });

    expect(parseSkillInput).toHaveBeenCalledWith('owner/jest');
    const expectedManifest: SkillManifest = {
      ...manifest,
      skills: [descriptor],
    };
    expect(validator.validate).toHaveBeenCalledWith(expectedManifest);
    expect(manifestRepo.writeManifest).toHaveBeenCalledWith(expectedManifest);
    expect(consoleSpy).toHaveBeenCalledWith('Added skill jest (https://github.com/mindrally/skills/jest@main)');
    expect(consoleSpy).toHaveBeenCalledWith('Installing skills...');
    expect(InstallCommand).toHaveBeenCalledTimes(1);
    expect(mockInstallRun).toHaveBeenCalledWith(env, { positional: ['owner/jest'], flags: {} });
  });
});

function createEnv(manifest?: SkillManifest) {
  const manifestRepo = {
    readOrInitializeManifest: jest
      .fn()
      .mockResolvedValue(manifest ?? ({ $schema: './skilleton.schema.json', skills: [] } as SkillManifest)),
    writeManifest: jest.fn().mockResolvedValue(undefined),
  };

  const validator = {
    validate: jest.fn(),
  };

  const env: SkilletonEnvironment = {
    fs: null as unknown as SkilletonEnvironment['fs'],
    git: null as unknown as SkilletonEnvironment['git'],
    resolver: null as unknown as SkilletonEnvironment['resolver'],
    installer: null as unknown as SkilletonEnvironment['installer'],
    manifestRepo: manifestRepo as unknown as SkilletonEnvironment['manifestRepo'],
    validator: validator as unknown as SkilletonEnvironment['validator'],
  };

  return { env, manifestRepo, validator };
}
