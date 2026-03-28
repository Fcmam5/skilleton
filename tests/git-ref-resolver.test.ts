import { GitRefResolver } from '../src/core/git-ref-resolver';
import { SkillValidationError } from '../src/core/errors';

jest.mock('execa', () => ({
  execa: jest.fn(),
}));
import { execa } from 'execa';
const mockExeca = execa as jest.MockedFunction<typeof execa>;

describe('GitRefResolver', () => {
  let resolver: GitRefResolver;

  beforeEach(() => {
    resolver = new GitRefResolver();
    jest.clearAllMocks();
  });

  describe('resolve', () => {
    it('returns the ref directly if it is already a 40-char SHA', async () => {
      const sha = 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
      const result = await resolver.resolve('owner/repo', sha);
      expect(result).toBe(sha);
      expect(mockExeca).not.toHaveBeenCalled();
    });

    it('resolves a branch name via git ls-remote', async () => {
      mockExeca.mockResolvedValue({
        stdout: 'abc123def456789012345678901234567890abcd\trefs/heads/main\n',
      } as any);
      const result = await resolver.resolve('https://github.com/owner/repo', 'main');
      expect(result).toBe('abc123def456789012345678901234567890abcd');
      expect(mockExeca).toHaveBeenCalledWith('git', [
        'ls-remote',
        '--refs',
        'https://github.com/owner/repo.git',
        'main',
        'refs/heads/main',
        'refs/tags/main',
      ]);
    });

    it('resolves a tag name via git ls-remote', async () => {
      mockExeca.mockResolvedValue({
        stdout: 'fedcba098765432109876543210987654321fedc\trefs/tags/v1.2.3\n',
      } as any);
      const result = await resolver.resolve('owner/repo', 'v1.2.3');
      expect(result).toBe('fedcba098765432109876543210987654321fedc');
    });

    it('resolves a full ref via git ls-remote', async () => {
      mockExeca.mockResolvedValue({
        stdout: '1234567890abcdef1234567890abcdef12345678\trefs/heads/feature/test\n',
      } as any);
      const result = await resolver.resolve('git@github.com:owner/repo.git', 'refs/heads/feature/test');
      expect(result).toBe('1234567890abcdef1234567890abcdef12345678');
    });

    it('throws SkillValidationError when git ls-remote fails', async () => {
      const gitError = new Error('fatal: repository not found');
      mockExeca.mockRejectedValue(gitError);
      await expect(resolver.resolve('owner/repo', 'main')).rejects.toThrow(SkillValidationError);
      await expect(resolver.resolve('owner/repo', 'main')).rejects.toThrow(/git ls-remote failed/);
    });

    it('throws SkillValidationError when ref cannot be resolved', async () => {
      mockExeca.mockResolvedValue({ stdout: '' } as any);
      await expect(resolver.resolve('owner/repo', 'nonexistent')).rejects.toThrow(SkillValidationError);
      await expect(resolver.resolve('owner/repo', 'nonexistent')).rejects.toThrow(/Unable to resolve ref/);
    });

    it('normalizes repo URLs and appends .git for HTTPS', async () => {
      mockExeca.mockResolvedValue({
        stdout: 'cafedeadbeefdeadbeefdeadbeefdeadbeefdead\trefs/heads/main\n',
      } as any);
      await resolver.resolve('https://github.com/owner/repo', 'main');
      expect(mockExeca).toHaveBeenCalledWith('git', [
        'ls-remote',
        '--refs',
        'https://github.com/owner/repo.git',
        'main',
        'refs/heads/main',
        'refs/tags/main',
      ]);
    });

    it('resolves short SHA prefixes via prefix matching', async () => {
      mockExeca.mockResolvedValue({
        stdout:
          '47f47c12e62f62b5e171bd5af61d0fc24b329701\trefs/heads/main\nabc123def456789012345678901234567890abcd\trefs/heads/dev\n',
      } as any);
      const result = await resolver.resolve('owner/repo', '47f47c1');
      expect(result).toBe('47f47c12e62f62b5e171bd5af61d0fc24b329701');
    });

    it('handles SSH URLs without modification', async () => {
      mockExeca.mockResolvedValue({
        stdout: 'feedfacecafebabedeadbeefcafebabedeadbeef\trefs/heads/main\n',
      } as any);
      await resolver.resolve('git@github.com:owner/repo', 'main');
      expect(mockExeca).toHaveBeenCalledWith('git', [
        'ls-remote',
        '--refs',
        'https://github.com/git@github.com:owner/repo.git',
        'main',
        'refs/heads/main',
        'refs/tags/main',
      ]);
    });
  });
});
