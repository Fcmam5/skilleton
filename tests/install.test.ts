import path from 'node:path';
import { SkillInstaller } from '../src/core/install';
import { FileSystem, GitClient, LockedSkill } from '../src/core/types';
import { SkillInstallError } from '../src/core/errors';

const createFsMock = (): jest.Mocked<FileSystem> => ({
  pathExists: jest.fn(),
  ensureDir: jest.fn(),
  mkdtemp: jest.fn(),
  readJson: jest.fn(),
  writeJson: jest.fn(),
  readFile: jest.fn(),
  isDirectory: jest.fn(),
  remove: jest.fn(),
  copy: jest.fn(),
  symlink: jest.fn(),
  readDir: jest.fn(),
});

const createGitMock = (): jest.Mocked<GitClient> => ({
  ensureRepo: jest.fn(),
  exportPath: jest.fn(),
});

const skill: LockedSkill = {
  name: 'alpha',
  repo: 'https://github.com/acme/skills',
  path: 'alpha',
  ref: 'main',
  commit: 'abcdef1234567890abcdef1234567890abcdef12',
  timestamp: '2024-01-01T00:00:00.000Z',
};

describe('SkillInstaller', () => {
  let fsMock: jest.Mocked<FileSystem>;
  let gitMock: jest.Mocked<GitClient>;
  let installer: SkillInstaller;

  beforeEach(() => {
    fsMock = createFsMock();
    gitMock = createGitMock();
    installer = new SkillInstaller(fsMock, gitMock);
    gitMock.ensureRepo.mockResolvedValue('/cache/skills/alpha');
    gitMock.exportPath.mockResolvedValue();
    fsMock.ensureDir.mockResolvedValue();
  });

  it('returns empty array when no skills provided', async () => {
    const result = await installer.install([]);
    expect(result).toEqual([]);
    expect(gitMock.ensureRepo).not.toHaveBeenCalled();
  });

  it('installs a skill successfully', async () => {
    fsMock.pathExists.mockResolvedValueOnce(true).mockResolvedValueOnce(true);

    const result = await installer.install([skill], { cwd: '/workspace' });

    expect(fsMock.ensureDir).toHaveBeenCalledWith(path.join('/workspace', '.skilleton'));
    expect(gitMock.ensureRepo).toHaveBeenCalledWith(skill.repo);
    expect(gitMock.exportPath).toHaveBeenCalledWith(
      '/cache/skills/alpha',
      skill.commit,
      path.join('/workspace/.skilleton/skills', skill.name),
      skill.path,
    );
    expect(result).toEqual([
      {
        name: skill.name,
        commit: skill.commit,
        installPath: path.join('/workspace/.skilleton/skills', skill.name),
      },
    ]);
  });

  it('throws SkillInstallError when target directory is missing', async () => {
    fsMock.pathExists.mockResolvedValueOnce(false);

    await expect(installer.install([skill])).rejects.toStrictEqual(
      new SkillInstallError('Skill path missing after export: alpha'),
    );
  });

  it('throws SkillInstallError when SKILL.md is missing', async () => {
    fsMock.pathExists.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    await expect(installer.install([skill])).rejects.toStrictEqual(
      new SkillInstallError('Missing SKILL.md for alpha (repo: https://github.com/acme/skills, path: alpha)'),
    );
  });

  it('creates agent symlink when option provided', async () => {
    fsMock.pathExists.mockResolvedValue(true);
    await installer.install([skill], { agent: 'bot', cwd: '/workspace' });
    expect(fsMock.symlink).toHaveBeenCalledWith(
      path.join('/workspace/.skilleton/skills', skill.name),
      path.join('/workspace/.skilleton/agents', 'bot', skill.name),
    );
  });

  it('uses SKILLETON_AGENT env var when set', async () => {
    fsMock.pathExists.mockResolvedValue(true);
    const original = process.env.SKILLETON_AGENT;
    process.env.SKILLETON_AGENT = 'env-bot';
    try {
      await installer.install([skill], { cwd: '/workspace' });
      expect(fsMock.symlink).toHaveBeenCalledWith(
        path.join('/workspace/.skilleton/skills', skill.name),
        path.join('/workspace/.skilleton/agents', 'env-bot', skill.name),
      );
    } finally {
      if (original === undefined) {
        delete process.env.SKILLETON_AGENT;
      } else {
        process.env.SKILLETON_AGENT = original;
      }
    }
  });

  it('propagates installs for multiple skills', async () => {
    const secondSkill: LockedSkill = {
      ...skill,
      name: 'beta',
      path: 'beta',
      commit: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    };
    fsMock.pathExists.mockResolvedValue(true);

    const result = await installer.install([skill, secondSkill]);

    expect(result).toHaveLength(2);
    expect(gitMock.ensureRepo).toHaveBeenCalledTimes(2);
  });
});
