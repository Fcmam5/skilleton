import path from 'node:path';
import { DescribeCommand } from '../src/commands/describe';
import { SkilletonEnvironment } from '../src/env';
import { FileSystem, SkillLockfile, SkillManifest } from '../src/core/types';
import { ManifestNotFoundError } from '../src/core/errors';

describe('DescribeCommand', () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('requires a skill name', async () => {
    const command = new DescribeCommand();
    const env = createEnv();

    await command.run(env, { positional: [], flags: {} });

    expect(consoleLogSpy).toHaveBeenCalledWith('Usage: skilleton describe <skill-name>');
  });

  it('warns when skill is not declared', async () => {
    const manifest: SkillManifest = { $schema: './skilleton.schema.json', skills: [] };
    const env = createEnv({ manifest });
    const command = new DescribeCommand();

    await command.run(env, { positional: ['jest'], flags: {} });

    expect(consoleLogSpy).toHaveBeenCalledWith('Skill "jest" is not declared in skilleton.json.');
  });

  it('prints metadata when skill exists but is not installed', async () => {
    const manifest: SkillManifest = {
      $schema: './skilleton.schema.json',
      skills: [{ name: 'jest', repo: 'https://github.com/mindrally/skills', path: 'jest', ref: 'main' }],
    };

    const lockfile: SkillLockfile = {
      skills: {
        jest: {
          name: 'jest',
          repo: 'https://github.com/mindrally/skills',
          path: 'jest',
          ref: 'main',
          commit: 'abc123',
          timestamp: '2026-03-23T00:00:00.000Z',
        },
      },
    };

    const env = createEnv({
      manifest,
      lockfile,
      installPaths: { jest: '/repo/.skilleton/skills/jest' },
    });
    const command = new DescribeCommand();

    await command.run(env, { positional: ['jest'], flags: {} });

    expect(consoleLogSpy).toHaveBeenCalledWith('Name: jest');
    expect(consoleLogSpy).toHaveBeenCalledWith('Commit: abc123');
    expect(consoleLogSpy).toHaveBeenCalledWith('Install path: /repo/.skilleton/skills/jest (not installed)');
    expect(consoleLogSpy).toHaveBeenCalledWith('');
    expect(consoleLogSpy).toHaveBeenCalledWith('Install the skill with "skilleton install" to inspect its contents.');
  });

  it('prints folder structure and SKILL.md header when installed', async () => {
    const skillName = 'typescript-magician';
    const installPath = `/repo/.skilleton/skills/${skillName}`;

    const manifest: SkillManifest = {
      $schema: './skilleton.schema.json',
      skills: [
        {
          name: skillName,
          repo: 'https://github.com/mcollina/skills',
          path: 'skills/typescript-magician',
          ref: 'main',
        },
      ],
    };

    const fs = new InMemoryFileSystem();
    fs.addDirectory(installPath);
    fs.addDirectory(path.join(installPath, 'rules'));
    fs.addFile(
      path.join(installPath, 'SKILL.md'),
      ['---', 'name: typescript-magician', 'description: Test skill', '---', '', '## Content'].join('\n'),
    );
    fs.addFile(path.join(installPath, 'README.md'), '# Readme');
    fs.addFile(path.join(installPath, 'rules', 'rule.md'), '# Rule');

    const env = createEnv({
      manifest,
      installPaths: { [skillName]: installPath },
      fileSystem: fs,
    });

    const command = new DescribeCommand();
    await command.run(env, { positional: [skillName], flags: {} });

    const logs = consoleLogSpy.mock.calls.map(([message]) => message);
    expect(logs).toContain('Name: typescript-magician');
    expect(logs).toContain('Folder structure:');
    expect(logs).toContain('  README.md');
    expect(logs).toContain('  SKILL.md');
    expect(logs).toContain('  rules/');
    expect(logs).toContain('  rules/rule.md');
    expect(logs).toContain('SKILL.md header:');
    expect(logs).toContain('---');
    expect(logs).toContain('name: typescript-magician');
  });

  it('prints message when SKILL is installed but no SKILL.md exists', async () => {
    const skillName = 'no-skill-file';
    const installPath = `/repo/.skilleton/skills/${skillName}`;
    const manifest: SkillManifest = {
      $schema: './skilleton.schema.json',
      skills: [
        {
          name: skillName,
          repo: 'https://github.com/example/skills',
          path: 'skills/no-skill-file',
          ref: 'main',
        },
      ],
    };

    const fs = new InMemoryFileSystem();
    fs.addDirectory(installPath);
    fs.addFile(path.join(installPath, 'README.md'), '# Readme');
    const env = createEnv({ manifest, installPaths: { [skillName]: installPath }, fileSystem: fs });

    const command = new DescribeCommand();
    await command.run(env, { positional: [skillName], flags: {} });

    const logs = consoleLogSpy.mock.calls.map(([message]) => message);
    expect(logs).toContain('No SKILL.md found.');
  });

  it('prints message when SKILL.md lacks frontmatter', async () => {
    const skillName = 'missing-frontmatter';
    const installPath = `/repo/.skilleton/skills/${skillName}`;
    const manifest: SkillManifest = {
      $schema: './skilleton.schema.json',
      skills: [
        {
          name: skillName,
          repo: 'https://github.com/example/skills',
          path: 'skills/missing-frontmatter',
          ref: 'main',
        },
      ],
    };

    const fs = new InMemoryFileSystem();
    fs.addDirectory(installPath);
    fs.addFile(path.join(installPath, 'SKILL.md'), '# Hello world');
    const env = createEnv({ manifest, installPaths: { [skillName]: installPath }, fileSystem: fs });

    const command = new DescribeCommand();
    await command.run(env, { positional: [skillName], flags: {} });

    const logs = consoleLogSpy.mock.calls.map(([message]) => message);
    expect(logs).toContain('SKILL.md does not contain frontmatter.');
  });

  it('warns when manifest is missing entirely', async () => {
    const env = createEnv({ manifestError: new ManifestNotFoundError('missing') });
    const command = new DescribeCommand();

    await command.run(env, { positional: ['jest'], flags: {} });

    expect(consoleLogSpy).toHaveBeenCalledWith('No skilleton.json found. Run "skilleton add" to create one.');
  });
});

interface CreateEnvOptions {
  manifest?: SkillManifest;
  lockfile?: SkillLockfile | null;
  installPaths?: Record<string, string>;
  fileSystem?: FileSystem;
  manifestError?: Error | null;
}

function createEnv(options: CreateEnvOptions = {}): SkilletonEnvironment {
  const manifest: SkillManifest =
    options.manifest ?? ({ $schema: './skilleton.schema.json', skills: [] } as SkillManifest);
  const lockfile = options.lockfile ?? null;
  const installPaths = options.installPaths ?? {};
  const fs = options.fileSystem ?? new InMemoryFileSystem();
  const manifestError = options.manifestError ?? null;

  const manifestRepo = {
    async readManifest() {
      if (manifestError) {
        throw manifestError;
      }
      return manifest;
    },
    async readLockfileIfExists() {
      return lockfile;
    },
    skillInstallPath(skillName: string) {
      return installPaths[skillName] ?? `/repo/.skilleton/skills/${skillName}`;
    },
  };

  return {
    fs: fs as unknown as SkilletonEnvironment['fs'],
    validator: createThrowingProxy('validator') as unknown as SkilletonEnvironment['validator'],
    manifestRepo: manifestRepo as unknown as SkilletonEnvironment['manifestRepo'],
    git: createThrowingProxy('git') as unknown as SkilletonEnvironment['git'],
    resolver: createThrowingProxy('resolver') as unknown as SkilletonEnvironment['resolver'],
    installer: createThrowingProxy('installer') as unknown as SkilletonEnvironment['installer'],
  };
}

function createThrowingProxy(name: string): ProxyHandler<object> {
  return new Proxy(
    {},
    {
      get() {
        throw new Error(`Unexpected access to stubbed dependency: ${name}`);
      },
      set() {
        throw new Error(`Unexpected mutation of stubbed dependency: ${name}`);
      },
      has() {
        return true;
      },
      ownKeys() {
        return [];
      },
      getOwnPropertyDescriptor() {
        return { enumerable: true, configurable: true };
      },
    },
  );
}

class InMemoryFileSystem implements FileSystem {
  private directories = new Set<string>();
  private files = new Map<string, string>();

  constructor() {
    this.directories.add('/');
  }

  addDirectory(dir: string): void {
    const normalized = this.normalize(dir);
    this.directories.add(normalized);
  }

  addFile(target: string, content: string): void {
    const normalized = this.normalize(target);
    const dir = path.dirname(normalized);
    this.directories.add(dir);
    this.files.set(normalized, content);
  }

  async pathExists(target: string): Promise<boolean> {
    const normalized = this.normalize(target);
    return this.directories.has(normalized) || this.files.has(normalized);
  }

  async ensureDir(target: string): Promise<void> {
    this.directories.add(this.normalize(target));
  }

  async readJson<T>(_path: string): Promise<T> {
    throw new Error('Not implemented');
  }

  async writeJson(_path: string, _data: unknown): Promise<void> {
    throw new Error('Not implemented');
  }

  async readFile(target: string): Promise<string> {
    const normalized = this.normalize(target);
    const content = this.files.get(normalized);
    if (content === undefined) {
      throw new Error(`File not found: ${target}`);
    }
    return content;
  }

  async isDirectory(target: string): Promise<boolean> {
    return this.directories.has(this.normalize(target));
  }

  async remove(_path: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async copy(_src: string, _dest: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async symlink(_target: string, _path: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async readDir(target: string): Promise<string[]> {
    const normalized = this.normalize(target);
    const entries = new Set<string>();
    const prefix = normalized.endsWith('/') ? normalized : `${normalized}/`;

    for (const dir of this.directories) {
      if (dir === normalized) {
        continue;
      }
      if (!dir.startsWith(prefix)) {
        continue;
      }
      const relative = dir.slice(prefix.length);
      if (relative.length === 0) {
        continue;
      }
      const segment = relative.split('/')[0];
      entries.add(segment);
    }

    for (const filePath of this.files.keys()) {
      if (!filePath.startsWith(prefix)) {
        continue;
      }
      const relative = filePath.slice(prefix.length);
      if (relative.length === 0) {
        continue;
      }
      const segment = relative.split('/')[0];
      entries.add(segment);
    }

    if (!this.directories.has(normalized) && entries.size === 0) {
      throw new Error(`Directory not found: ${target}`);
    }

    return Array.from(entries);
  }

  private normalize(target: string): string {
    return target.replace(/\\/g, '/');
  }
}
