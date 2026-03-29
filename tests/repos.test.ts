import { ensureRepoUrl, isRepoUrl, normalizeDescriptor, repoCacheKey } from '../src/core/repos';
import { SkillDescriptor } from '../src/core/types';

describe('repos helpers', () => {
  describe('isRepoUrl', () => {
    it('detects https and ssh urls', () => {
      expect(isRepoUrl('https://github.com/owner/repo')).toBe(true);
      expect(isRepoUrl('git@github.com:owner/repo.git')).toBe(true);
    });

    it('rejects invalid specs', () => {
      expect(isRepoUrl('')).toBe(false);
      expect(isRepoUrl('not-a-url')).toBe(false);
    });
  });

  it('normalizes owner/repo slugs into https URLs', () => {
    expect(ensureRepoUrl('owner/skills')).toBe('https://github.com/owner/skills');
  });

  it('preserves existing URLs while stripping .git suffix and trailing slashes', () => {
    expect(ensureRepoUrl('https://gitlab.com/acme/skills.git/')).toBe('https://gitlab.com/acme/skills');
  });

  it('converts ssh shorthand with dots and subpaths to https', () => {
    expect(ensureRepoUrl('git@github.com:owner/repo.name.git')).toBe('https://github.com/owner/repo.name');
    expect(ensureRepoUrl('git@github.com:owner/repo/sub/path')).toBe('https://github.com/owner/repo/sub/path');
  });

  it('throws for empty specs', () => {
    expect(() => ensureRepoUrl('')).toThrow('Repository must be a non-empty string');
  });

  it('normalizes descriptors by fixing repo URLs and Windows paths', () => {
    const descriptor: SkillDescriptor = {
      name: 'rag',
      repo: 'acme/ai-skills',
      path: 'agents\\rag',
      ref: 'main',
    };

    const normalized = normalizeDescriptor(descriptor);
    expect(normalized.repo).toBe('https://github.com/acme/ai-skills');
    expect(normalized.path).toBe('agents/rag');
  });

  it('derives stable cache keys from repo URLs', () => {
    expect(repoCacheKey('https://github.com/owner/skills')).toBe('https_github.com_owner_skills');
  });

  it('derives stable cache keys from ssh shorthand', () => {
    expect(repoCacheKey('git@github.com:owner/skills.git')).toBe('https_github.com_owner_skills');
  });

  it('derives stable cache keys from owner/repo slugs with subpaths', () => {
    expect(repoCacheKey('owner/skills/sub/path')).toBe('https_github.com_owner_skills_sub_path');
  });
});
