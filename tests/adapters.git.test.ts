import { execa } from 'execa';
import { ExecaGitClient } from '../src/adapters/git';
import { SkillInstallError } from '../src/core/errors';
import { MockedFileSystem, createMockedFileSystem } from './helpers/mocked-filesystem';

jest.mock('execa');

describe('ExecaGitClient security hardening', () => {
  let mockedFs: MockedFileSystem;
  const mockedExeca = execa as unknown as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedFs = createMockedFileSystem();
    mockedFs.pathExists.mockResolvedValue(true);
    mockedFs.ensureDir.mockResolvedValue(undefined);
    mockedFs.remove.mockResolvedValue(undefined);
    mockedFs.copy.mockResolvedValue(undefined);
    mockedFs.mkdtemp.mockResolvedValue('/tmp/skilleton-wt-123');
    mockedFs.readDir.mockResolvedValue([]);
    mockedFs.isSymlink.mockResolvedValue(false);
    mockedExeca.mockResolvedValue({ stdout: '', stderr: '' });
  });

  it('uses -- separator for git clone arguments', async () => {
    mockedFs.pathExists.mockResolvedValueOnce(false);
    const client = new ExecaGitClient('/tmp/cache', mockedFs);

    await client.ensureRepo('https://github.com/acme/skills');

    expect(mockedExeca).toHaveBeenCalledWith(
      'git',
      [
        'clone',
        '--filter=blob:none',
        '--',
        'https://github.com/acme/skills.git',
        '/tmp/cache/https_github.com_acme_skills',
      ],
      expect.any(Object),
    );
  });

  it('fetches existing repositories instead of cloning', async () => {
    const client = new ExecaGitClient('/tmp/cache', mockedFs);

    await client.ensureRepo('https://github.com/acme/skills');

    expect(mockedExeca).toHaveBeenCalledWith(
      'git',
      ['-C', '/tmp/cache/https_github.com_acme_skills', 'fetch', '--tags', '--prune', '--force'],
      expect.any(Object),
    );
  });

  it('rejects destination values that look like git options', async () => {
    const client = new ExecaGitClient('/tmp/cache', mockedFs);

    await expect(client.ensureRepo('https://github.com/acme/skills', '--upload-pack=sh')).rejects.toThrow(
      SkillInstallError,
    );
    await expect(client.ensureRepo('https://github.com/acme/skills', '--upload-pack=sh')).rejects.toThrow(
      'Invalid repository cache path',
    );
    expect(mockedExeca).not.toHaveBeenCalled();
  });

  it('rejects non-SHA commit inputs before running git worktree', async () => {
    const client = new ExecaGitClient('/tmp/cache', mockedFs);

    await expect(client.exportPath('/tmp/cache/repo', 'main', '/tmp/out', 'skills/jest')).rejects.toThrow(
      SkillInstallError,
    );
    await expect(client.exportPath('/tmp/cache/repo', 'main', '/tmp/out', 'skills/jest')).rejects.toThrow(
      'Invalid commit SHA: main',
    );
    expect(mockedExeca).not.toHaveBeenCalled();
    expect(mockedFs.mkdtemp).not.toHaveBeenCalled();
  });

  it('rejects path traversal in subPath', async () => {
    const client = new ExecaGitClient('/tmp/cache', mockedFs);
    const commit = 'abcdef1234567890abcdef1234567890abcdef12';

    await expect(client.exportPath('/tmp/cache/repo', commit, '/tmp/out', '../escape')).rejects.toThrow(
      'Invalid skill path ../escape',
    );

    expect(mockedFs.mkdtemp).not.toHaveBeenCalled();
    expect(mockedExeca).not.toHaveBeenCalled();
  });

  it('rejects absolute subPath values before worktree allocation', async () => {
    const client = new ExecaGitClient('/tmp/cache', mockedFs);
    const commit = 'abcdef1234567890abcdef1234567890abcdef12';

    await expect(client.exportPath('/tmp/cache/repo', commit, '/tmp/out', '/etc/passwd')).rejects.toThrow(
      'Invalid skill path /etc/passwd',
    );

    expect(mockedFs.mkdtemp).not.toHaveBeenCalled();
    expect(mockedExeca).not.toHaveBeenCalled();
  });

  it('exports path successfully and cleans up worktree', async () => {
    const client = new ExecaGitClient('/tmp/cache', mockedFs);
    const commit = 'abcdef1234567890abcdef1234567890abcdef12';

    await client.exportPath('/tmp/cache/repo', commit, '/tmp/out', 'skills/jest');

    expect(mockedExeca).toHaveBeenNthCalledWith(
      1,
      'git',
      ['-C', '/tmp/cache/repo', 'worktree', 'add', '--force', '--detach', '/tmp/skilleton-wt-123', commit],
      expect.any(Object),
    );
    expect(mockedFs.remove).toHaveBeenNthCalledWith(1, '/tmp/out');
    expect(mockedFs.copy).toHaveBeenCalledWith('/tmp/skilleton-wt-123/skills/jest', '/tmp/out');
    expect(mockedExeca).toHaveBeenNthCalledWith(
      2,
      'git',
      ['-C', '/tmp/cache/repo', 'worktree', 'remove', '--force', '/tmp/skilleton-wt-123'],
      expect.any(Object),
    );
    expect(mockedFs.remove).toHaveBeenNthCalledWith(2, '/tmp/skilleton-wt-123');
  });

  it('wraps missing source path errors and still cleans up worktree', async () => {
    const client = new ExecaGitClient('/tmp/cache', mockedFs);
    const commit = 'abcdef1234567890abcdef1234567890abcdef12';
    mockedFs.pathExists.mockResolvedValueOnce(false);

    await expect(client.exportPath('/tmp/cache/repo', commit, '/tmp/out', 'skills/missing')).rejects.toThrow(
      'Failed to export skills/missing from /tmp/cache/repo@abcdef1234567890abcdef1234567890abcdef12: Skill path skills/missing not found in repository /tmp/cache/repo',
    );

    expect(mockedExeca).toHaveBeenNthCalledWith(
      1,
      'git',
      ['-C', '/tmp/cache/repo', 'worktree', 'add', '--force', '--detach', '/tmp/skilleton-wt-123', commit],
      expect.any(Object),
    );
    expect(mockedExeca).toHaveBeenNthCalledWith(
      2,
      'git',
      ['-C', '/tmp/cache/repo', 'worktree', 'remove', '--force', '/tmp/skilleton-wt-123'],
      expect.any(Object),
    );
    expect(mockedFs.remove).toHaveBeenCalledWith('/tmp/skilleton-wt-123');
  });

  it('rejects a file symlink in skill content that escapes the skill root via absolute target', async () => {
    const client = new ExecaGitClient('/tmp/cache', mockedFs);
    const commit = 'abcdef1234567890abcdef1234567890abcdef12';
    const skillPath = '/tmp/skilleton-wt-123';

    mockedFs.readDir.mockImplementation(async (dir: string) => {
      if (dir === skillPath) return ['SKILL.md', 'stolen-key'];
      return [];
    });
    mockedFs.isSymlink.mockImplementation(async (p: string) => p === `${skillPath}/stolen-key`);
    mockedFs.readlink.mockImplementation(async () => '/home/victim/.ssh/id_rsa');

    await expect(client.exportPath('/tmp/cache/repo', commit, '/tmp/out', '.')).rejects.toThrow(
      'Symlink in skill content escapes the skill root: stolen-key -> /home/victim/.ssh/id_rsa',
    );

    expect(mockedFs.copy).not.toHaveBeenCalled();
  });

  it('rejects a directory symlink in skill content that escapes the skill root', async () => {
    const client = new ExecaGitClient('/tmp/cache', mockedFs);
    const commit = 'abcdef1234567890abcdef1234567890abcdef12';
    const skillPath = '/tmp/skilleton-wt-123';

    mockedFs.readDir.mockImplementation(async (dir: string) => {
      if (dir === skillPath) return ['SKILL.md', 'loot'];
      return [];
    });
    mockedFs.isSymlink.mockImplementation(async (p: string) => p === `${skillPath}/loot`);
    mockedFs.readlink.mockImplementation(async () => '/home/victim');

    await expect(client.exportPath('/tmp/cache/repo', commit, '/tmp/out', '.')).rejects.toThrow(
      'Symlink in skill content escapes the skill root: loot -> /home/victim',
    );

    expect(mockedFs.copy).not.toHaveBeenCalled();
  });

  it('rejects an escaping symlink inside a subdirectory of the skill', async () => {
    const client = new ExecaGitClient('/tmp/cache', mockedFs);
    const commit = 'abcdef1234567890abcdef1234567890abcdef12';
    const skillPath = '/tmp/skilleton-wt-123';

    mockedFs.readDir.mockImplementation(async (dir: string) => {
      if (dir === skillPath) return ['SKILL.md', 'subdir'];
      if (dir === `${skillPath}/subdir`) return ['nested-link'];
      return [];
    });
    mockedFs.isSymlink.mockImplementation(async (p: string) => p === `${skillPath}/subdir/nested-link`);
    mockedFs.isDirectory.mockImplementation(async (p: string) => p === `${skillPath}/subdir`);
    mockedFs.readlink.mockImplementation(async () => '../../../../etc/passwd');

    await expect(client.exportPath('/tmp/cache/repo', commit, '/tmp/out', '.')).rejects.toThrow(
      'Symlink in skill content escapes the skill root: nested-link -> ../../../../etc/passwd',
    );

    expect(mockedFs.copy).not.toHaveBeenCalled();
  });

  it('allows relative symlinks that stay within the skill root', async () => {
    const client = new ExecaGitClient('/tmp/cache', mockedFs);
    const commit = 'abcdef1234567890abcdef1234567890abcdef12';
    const skillPath = '/tmp/skilleton-wt-123';

    mockedFs.readDir.mockImplementation(async (dir: string) => {
      if (dir === skillPath) return ['SKILL.md', 'docs', 'internal-link'];
      if (dir === `${skillPath}/docs`) return [];
      return [];
    });
    mockedFs.isSymlink.mockImplementation(async (p: string) => p === `${skillPath}/internal-link`);
    mockedFs.isDirectory.mockImplementation(async (p: string) => p === `${skillPath}/docs`);
    mockedFs.readlink.mockImplementation(async () => './docs');

    await expect(client.exportPath('/tmp/cache/repo', commit, '/tmp/out', '.')).resolves.toBeUndefined();

    expect(mockedFs.copy).toHaveBeenCalledWith(skillPath, '/tmp/out');
  });
});
