import { GitRefResolver } from '../src/core/git-ref-resolver';
import { SkillValidationError } from '../src/core/errors';

describe('GitRefResolver', () => {
  let resolver: GitRefResolver;
  let mockRunner: jest.Mock<Promise<{ stdout: string }>, [string, string[]]>;

  beforeEach(() => {
    mockRunner = jest.fn();
    resolver = new GitRefResolver('git', mockRunner as unknown as ConstructorParameters<typeof GitRefResolver>[1]);
  });

  describe('resolve', () => {
    it('returns the ref directly if it is already a 40-char SHA', async () => {
      const sha = 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
      const result = await resolver.resolve('owner/repo', sha);
      expect(result).toBe(sha);
      expect(mockRunner).not.toHaveBeenCalled();
    });

    it('resolves a branch name via git ls-remote', async () => {
      mockRunner.mockResolvedValue({
        stdout: 'abc123def456789012345678901234567890abcd\trefs/heads/main\n',
      } as unknown as { stdout: string });
      const result = await resolver.resolve('https://github.com/owner/repo', 'main');
      expect(result).toBe('abc123def456789012345678901234567890abcd');
      expect(mockRunner).toHaveBeenCalledWith('git', [
        'ls-remote',
        '--refs',
        'https://github.com/owner/repo.git',
        'main',
        'refs/heads/main',
        'refs/tags/main',
      ]);
    });

    it('resolves a tag name via git ls-remote', async () => {
      mockRunner.mockResolvedValue({
        stdout: 'fedcba098765432109876543210987654321fedc\trefs/tags/v1.2.3\n',
      } as unknown as { stdout: string });
      const result = await resolver.resolve('owner/repo', 'v1.2.3');
      expect(result).toBe('fedcba098765432109876543210987654321fedc');
    });

    it('resolves a full ref via git ls-remote', async () => {
      mockRunner.mockResolvedValue({
        stdout: '1234567890abcdef1234567890abcdef12345678\trefs/heads/feature/test\n',
      } as unknown as { stdout: string });
      const result = await resolver.resolve('git@github.com:owner/repo.git', 'refs/heads/feature/test');
      expect(result).toBe('1234567890abcdef1234567890abcdef12345678');
    });

    it('throws SkillValidationError when git ls-remote fails', async () => {
      const gitError = new Error('fatal: repository not found');
      mockRunner.mockRejectedValue(gitError);
      await expect(resolver.resolve('owner/repo', 'main')).rejects.toThrow(SkillValidationError);
      await expect(resolver.resolve('owner/repo', 'main')).rejects.toThrow(/git ls-remote failed/);
    });

    it('throws SkillValidationError when ref cannot be resolved', async () => {
      mockRunner.mockResolvedValue({ stdout: '' });
      await expect(resolver.resolve('owner/repo', 'nonexistent')).rejects.toThrow(SkillValidationError);
      await expect(resolver.resolve('owner/repo', 'nonexistent')).rejects.toThrow(/Unable to resolve ref/);
    });

    it('normalizes repo URLs and appends .git for HTTPS', async () => {
      mockRunner.mockResolvedValue({
        stdout: 'cafedeadbeefdeadbeefdeadbeefdeadbeefdead\trefs/heads/main\n',
      });
      await resolver.resolve('https://github.com/owner/repo', 'main');
      expect(mockRunner).toHaveBeenCalledWith('git', [
        'ls-remote',
        '--refs',
        'https://github.com/owner/repo.git',
        'main',
        'refs/heads/main',
        'refs/tags/main',
      ]);
    });

    it('resolves short SHA prefixes via prefix matching with fallback', async () => {
      mockRunner
        .mockResolvedValueOnce({ stdout: '47f47c12e62f62b5e171bd5af61d0fc24b32970\trefs/heads/main\n' })
        .mockResolvedValueOnce({ stdout: 'deadbeef123456789012345678901234567890abcd\trefs/heads/main\n' });

      const result = await resolver.resolve('owner/repo', 'deadbeef');
      expect(result).toBe('deadbeef123456789012345678901234567890abcd');
      expect(mockRunner).toHaveBeenNthCalledWith(1, 'git', [
        'ls-remote',
        '--refs',
        'https://github.com/owner/repo.git',
        'deadbeef',
        'refs/heads/deadbeef',
        'refs/tags/deadbeef',
      ]);
      expect(mockRunner).toHaveBeenNthCalledWith(2, 'git', ['ls-remote', 'https://github.com/owner/repo.git']);
    });

    it('converts SSH shorthand to HTTPS URLs', async () => {
      mockRunner.mockResolvedValue({
        stdout: 'feedfacecafebabedeadbeefcafebabedeadbeef\trefs/heads/main\n',
      });
      await resolver.resolve('git@github.com:owner/repo', 'main');
      expect(mockRunner).toHaveBeenCalledWith('git', [
        'ls-remote',
        '--refs',
        'https://github.com/owner/repo.git',
        'main',
        'refs/heads/main',
        'refs/tags/main',
      ]);
    });

    it('propagates SkillValidationError without wrapping', async () => {
      const error = new SkillValidationError('bad ref');
      mockRunner.mockRejectedValue(error);
      await expect(resolver.resolve('owner/repo', 'main')).rejects.toBe(error);
    });
  });
});
