import { ListCommand } from '../src/commands/list';
import { SkilletonEnvironment } from '../src/env';
import { ManifestValidator } from '../src/core/validate';
import { SkillManifest, SkillLockfile } from '../src/core/types';
import { ManifestNotFoundError } from '../src/core/errors';

describe('ListCommand', () => {
  let mockConsoleTable: jest.SpiedFunction<typeof console.table>;
  let mockConsoleLog: jest.SpiedFunction<typeof console.log>;

  beforeEach(() => {
    mockConsoleTable = jest.spyOn(console, 'table').mockImplementation();
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    mockConsoleTable.mockRestore();
    mockConsoleLog.mockRestore();
  });

  it('displays skills using console.table by default', async () => {
    const manifest: SkillManifest = {
      $schema: './skilleton.schema.json',
      skills: [
        {
          name: 'typescript-magician',
          repo: 'https://github.com/mcollina/skills',
          path: 'skills/typescript-magician',
          ref: '3e2ffbb',
        },
        {
          name: 'jest',
          repo: 'https://github.com/Mindrally/skills',
          path: 'jest',
          ref: '47f47c1',
        },
      ],
    };

    const lockfile: SkillLockfile = {
      skills: {
        'typescript-magician': {
          name: 'typescript-magician',
          repo: 'https://github.com/mcollina/skills',
          path: 'skills/typescript-magician',
          ref: '3e2ffbb',
          commit: '3e2ffbb123456789',
          timestamp: '2026-03-22T00:00:00.000Z',
        },
        jest: {
          name: 'jest',
          repo: 'https://github.com/Mindrally/skills',
          path: 'jest',
          ref: '47f47c1',
          commit: '47f47c1abcdef123',
          timestamp: '2026-03-22T00:00:00.000Z',
        },
      },
    };

    const manifestRepo = {
      readManifest: jest.fn().mockResolvedValue(manifest),
      readLockfileIfExists: jest.fn().mockResolvedValue(lockfile),
    };

    const validator = new ManifestValidator();

    const env: SkilletonEnvironment = {
      fs: null as never,
      validator,
      manifestRepo: manifestRepo as never,
      git: null as never,
      resolver: null as never,
      installer: null as never,
    };

    const command = new ListCommand();
    await command.run(env, { positional: [], flags: {} });

    expect(mockConsoleTable).toHaveBeenCalledWith([
      {
        Name: 'typescript-magician',
        Repo: 'https://github.com/mcollina/skills',
        Path: 'skills/typescript-magician',
        Ref: '3e2ffbb',
        Commit: '3e2ffbb',
      },
      {
        Name: 'jest',
        Repo: 'https://github.com/Mindrally/skills',
        Path: 'jest',
        Ref: '47f47c1',
        Commit: '47f47c1',
      },
    ]);
  });

  it('displays skills using console.table when format=table', async () => {
    const manifest: SkillManifest = {
      $schema: './skilleton.schema.json',
      skills: [
        {
          name: 'typescript-magician',
          repo: 'https://github.com/mcollina/skills',
          path: 'skills/typescript-magician',
          ref: '3e2ffbb',
        },
      ],
    };

    const lockfile: SkillLockfile = {
      skills: {
        'typescript-magician': {
          name: 'typescript-magician',
          repo: 'https://github.com/mcollina/skills',
          path: 'skills/typescript-magician',
          ref: '3e2ffbb',
          commit: '3e2ffbb123456789',
          timestamp: '2026-03-22T00:00:00.000Z',
        },
      },
    };

    const manifestRepo = {
      readManifest: jest.fn().mockResolvedValue(manifest),
      readLockfileIfExists: jest.fn().mockResolvedValue(lockfile),
    };

    const validator = new ManifestValidator();

    const env: SkilletonEnvironment = {
      fs: null as never,
      validator,
      manifestRepo: manifestRepo as never,
      git: null as never,
      resolver: null as never,
      installer: null as never,
    };

    const command = new ListCommand();
    await command.run(env, { positional: [], flags: { format: 'table' } });

    expect(mockConsoleTable).toHaveBeenCalledWith([
      {
        Name: 'typescript-magician',
        Repo: 'https://github.com/mcollina/skills',
        Path: 'skills/typescript-magician',
        Ref: '3e2ffbb',
        Commit: '3e2ffbb',
      },
    ]);
  });

  it('displays skills as JSON when format=json', async () => {
    const manifest: SkillManifest = {
      $schema: './skilleton.schema.json',
      skills: [
        {
          name: 'typescript-magician',
          repo: 'https://github.com/mcollina/skills',
          path: 'skills/typescript-magician',
          ref: '3e2ffbb',
        },
        {
          name: 'jest',
          repo: 'https://github.com/Mindrally/skills',
          path: 'jest',
          ref: '47f47c1',
        },
      ],
    };

    const lockfile: SkillLockfile = {
      skills: {
        'typescript-magician': {
          name: 'typescript-magician',
          repo: 'https://github.com/mcollina/skills',
          path: 'skills/typescript-magician',
          ref: '3e2ffbb',
          commit: '3e2ffbb123456789',
          timestamp: '2026-03-22T00:00:00.000Z',
        },
        jest: {
          name: 'jest',
          repo: 'https://github.com/Mindrally/skills',
          path: 'jest',
          ref: '47f47c1',
          commit: '47f47c1abcdef123',
          timestamp: '2026-03-22T00:00:00.000Z',
        },
      },
    };

    const manifestRepo = {
      readManifest: jest.fn().mockResolvedValue(manifest),
      readLockfileIfExists: jest.fn().mockResolvedValue(lockfile),
    };

    const validator = new ManifestValidator();

    const env: SkilletonEnvironment = {
      fs: null as never,
      validator,
      manifestRepo: manifestRepo as never,
      git: null as never,
      resolver: null as never,
      installer: null as never,
    };

    const command = new ListCommand();
    await command.run(env, { positional: [], flags: { format: 'json' } });

    expect(mockConsoleLog).toHaveBeenCalledWith(
      JSON.stringify(
        [
          {
            name: 'typescript-magician',
            repo: 'https://github.com/mcollina/skills',
            path: 'skills/typescript-magician',
            ref: '3e2ffbb',
            commit: '3e2ffbb123456789',
          },
          {
            name: 'jest',
            repo: 'https://github.com/Mindrally/skills',
            path: 'jest',
            ref: '47f47c1',
            commit: '47f47c1abcdef123',
          },
        ],
        null,
        2,
      ),
    );
    expect(mockConsoleTable).not.toHaveBeenCalled();
  });

  it('handles case-insensitive format flag', async () => {
    const manifest: SkillManifest = {
      $schema: './skilleton.schema.json',
      skills: [
        {
          name: 'typescript-magician',
          repo: 'https://github.com/mcollina/skills',
          path: 'skills/typescript-magician',
          ref: '3e2ffbb',
        },
      ],
    };

    const lockfile: SkillLockfile = {
      skills: {
        'typescript-magician': {
          name: 'typescript-magician',
          repo: 'https://github.com/mcollina/skills',
          path: 'skills/typescript-magician',
          ref: '3e2ffbb',
          commit: '3e2ffbb123456789',
          timestamp: '2026-03-22T00:00:00.000Z',
        },
      },
    };

    const manifestRepo = {
      readManifest: jest.fn().mockResolvedValue(manifest),
      readLockfileIfExists: jest.fn().mockResolvedValue(lockfile),
    };

    const validator = new ManifestValidator();

    const env: SkilletonEnvironment = {
      fs: null as never,
      validator,
      manifestRepo: manifestRepo as never,
      git: null as never,
      resolver: null as never,
      installer: null as never,
    };

    const command = new ListCommand();
    await command.run(env, { positional: [], flags: { format: 'JSON' } });

    expect(mockConsoleLog).toHaveBeenCalledWith(
      JSON.stringify(
        [
          {
            name: 'typescript-magician',
            repo: 'https://github.com/mcollina/skills',
            path: 'skills/typescript-magician',
            ref: '3e2ffbb',
            commit: '3e2ffbb123456789',
          },
        ],
        null,
        2,
      ),
    );
    expect(mockConsoleTable).not.toHaveBeenCalled();
  });

  it('shows message when no skills are declared', async () => {
    const manifest: SkillManifest = {
      $schema: './skilleton.schema.json',
      skills: [],
    };

    const manifestRepo = {
      readManifest: jest.fn().mockResolvedValue(manifest),
      readLockfileIfExists: jest.fn().mockResolvedValue(null),
    };

    const validator = new ManifestValidator();

    const env: SkilletonEnvironment = {
      fs: null as never,
      validator,
      manifestRepo: manifestRepo as never,
      git: null as never,
      resolver: null as never,
      installer: null as never,
    };

    const command = new ListCommand();
    await command.run(env, { positional: [], flags: {} });

    expect(mockConsoleLog).toHaveBeenCalledWith('No skills declared yet. Use "skilleton add" to add one.');
    expect(mockConsoleTable).not.toHaveBeenCalled();
  });

  it('shows message when manifest is not found', async () => {
    const manifestRepo = {
      readManifest: jest.fn().mockRejectedValue(new ManifestNotFoundError('Manifest not found')),
      readLockfileIfExists: jest.fn().mockResolvedValue(null),
    };

    const validator = new ManifestValidator();

    const env: SkilletonEnvironment = {
      fs: null as never,
      validator,
      manifestRepo: manifestRepo as never,
      git: null as never,
      resolver: null as never,
      installer: null as never,
    };

    const command = new ListCommand();
    await command.run(env, { positional: [], flags: {} });

    expect(mockConsoleLog).toHaveBeenCalledWith('No skilleton.json found. Run "skilleton add" to create one.');
    expect(mockConsoleTable).not.toHaveBeenCalled();
  });

  it('handles missing lockfile gracefully', async () => {
    const manifest: SkillManifest = {
      $schema: './skilleton.schema.json',
      skills: [
        {
          name: 'typescript-magician',
          repo: 'https://github.com/mcollina/skills',
          path: 'skills/typescript-magician',
          ref: '3e2ffbb',
        },
      ],
    };

    const manifestRepo = {
      readManifest: jest.fn().mockResolvedValue(manifest),
      readLockfileIfExists: jest.fn().mockResolvedValue(null),
    };

    const validator = new ManifestValidator();

    const env: SkilletonEnvironment = {
      fs: null as never,
      validator,
      manifestRepo: manifestRepo as never,
      git: null as never,
      resolver: null as never,
      installer: null as never,
    };

    const command = new ListCommand();
    await command.run(env, { positional: [], flags: {} });

    expect(mockConsoleTable).toHaveBeenCalledWith([
      {
        Name: 'typescript-magician',
        Repo: 'https://github.com/mcollina/skills',
        Path: 'skills/typescript-magician',
        Ref: '3e2ffbb',
        Commit: '———',
      },
    ]);
  });

  it('outputs null for missing commits in JSON format', async () => {
    const manifest: SkillManifest = {
      $schema: './skilleton.schema.json',
      skills: [
        {
          name: 'typescript-magician',
          repo: 'https://github.com/mcollina/skills',
          path: 'skills/typescript-magician',
          ref: '3e2ffbb',
        },
      ],
    };

    const manifestRepo = {
      readManifest: jest.fn().mockResolvedValue(manifest),
      readLockfileIfExists: jest.fn().mockResolvedValue(null),
    };

    const validator = new ManifestValidator();

    const env: SkilletonEnvironment = {
      fs: null as never,
      validator,
      manifestRepo: manifestRepo as never,
      git: null as never,
      resolver: null as never,
      installer: null as never,
    };

    const command = new ListCommand();
    await command.run(env, { positional: [], flags: { format: 'json' } });

    expect(mockConsoleLog).toHaveBeenCalledWith(
      JSON.stringify(
        [
          {
            name: 'typescript-magician',
            repo: 'https://github.com/mcollina/skills',
            path: 'skills/typescript-magician',
            ref: '3e2ffbb',
            commit: null,
          },
        ],
        null,
        2,
      ),
    );
    expect(mockConsoleTable).not.toHaveBeenCalled();
  });
});
