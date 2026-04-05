import { promises as fs } from 'node:fs';
import { execa } from 'execa';
import { ExecaGitClient } from '../src/adapters/git';
import { SkillInstallError } from '../src/core/errors';

jest.mock('execa');
jest.mock('node:fs', () => ({
  promises: {
    access: jest.fn(),
    mkdir: jest.fn(),
    rm: jest.fn(),
    cp: jest.fn(),
    mkdtemp: jest.fn(),
  },
}));

describe('ExecaGitClient security hardening', () => {
  const mockedFs = fs as unknown as {
    access: jest.Mock;
    mkdir: jest.Mock;
    rm: jest.Mock;
    cp: jest.Mock;
    mkdtemp: jest.Mock;
  };
  const mockedExeca = execa as unknown as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedFs.access.mockResolvedValue(undefined);
    mockedFs.mkdir.mockResolvedValue(undefined);
    mockedFs.rm.mockResolvedValue(undefined);
    mockedFs.cp.mockResolvedValue(undefined);
    mockedFs.mkdtemp.mockResolvedValue('/tmp/skilleton-wt-123');
    mockedExeca.mockResolvedValue({ stdout: '', stderr: '' });
  });

  it('uses -- separator for git clone arguments', async () => {
    mockedFs.access.mockRejectedValueOnce(new Error('missing'));
    const client = new ExecaGitClient('/tmp/cache');

    await client.ensureRepo('https://github.com/acme/skills');

    expect(mockedExeca).toHaveBeenCalledWith(
      'git',
      ['clone', '--filter=blob:none', '--', 'https://github.com/acme/skills.git', '/tmp/cache/https_github.com_acme_skills'],
      expect.any(Object),
    );
  });

  it('rejects destination values that look like git options', async () => {
    const client = new ExecaGitClient('/tmp/cache');

    await expect(client.ensureRepo('https://github.com/acme/skills', '--upload-pack=sh')).rejects.toThrow(SkillInstallError);
    await expect(client.ensureRepo('https://github.com/acme/skills', '--upload-pack=sh')).rejects.toThrow(
      'Invalid repository cache path',
    );
    expect(mockedExeca).not.toHaveBeenCalled();
  });

  it('rejects non-SHA commit inputs before running git worktree', async () => {
    const client = new ExecaGitClient('/tmp/cache');

    await expect(client.exportPath('/tmp/cache/repo', 'main', '/tmp/out', 'skills/jest')).rejects.toThrow(SkillInstallError);
    await expect(client.exportPath('/tmp/cache/repo', 'main', '/tmp/out', 'skills/jest')).rejects.toThrow(
      'Invalid commit SHA: main',
    );
    expect(mockedExeca).not.toHaveBeenCalled();
    expect(mockedFs.mkdtemp).not.toHaveBeenCalled();
  });

  it('rejects path traversal in subPath', async () => {
    const client = new ExecaGitClient('/tmp/cache');
    const commit = 'abcdef1234567890abcdef1234567890abcdef12';

    await expect(client.exportPath('/tmp/cache/repo', commit, '/tmp/out', '../escape')).rejects.toThrow(
      'Invalid skill path ../escape',
    );

    expect(mockedExeca).toHaveBeenCalledWith(
      'git',
      ['-C', '/tmp/cache/repo', 'worktree', 'add', '--force', '--detach', '/tmp/skilleton-wt-123', commit],
      expect.any(Object),
    );
    expect(mockedExeca).toHaveBeenCalledWith(
      'git',
      ['-C', '/tmp/cache/repo', 'worktree', 'remove', '--force', '/tmp/skilleton-wt-123'],
      expect.any(Object),
    );
  });
});
