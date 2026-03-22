import { ensureRepoUrl, normalizeDescriptor, repoCacheKey } from '../src/core/repos';
import { SkillDescriptor } from '../src/core/types';

describe('repos helpers', () => {
  it('normalizes owner/repo slugs into https URLs', () => {
    expect(ensureRepoUrl('owner/skills')).toBe('https://github.com/owner/skills');
  });

  it('preserves existing URLs while stripping .git suffix and trailing slashes', () => {
    expect(ensureRepoUrl('https://gitlab.com/acme/skills.git/')).toBe('https://gitlab.com/acme/skills');
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
});
