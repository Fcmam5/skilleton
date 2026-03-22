import { parseSkillInput } from '../src/core/parse';

describe('parseSkillInput', () => {
  it('parses owner/skill with implicit skills repo and default ref', () => {
    const result = parseSkillInput('mindrally/jest');
    expect(result).toEqual({
      name: 'jest',
      repo: 'mindrally/skills',
      path: 'jest',
      ref: 'main',
    });
  });

  it('parses owner/repo/path with explicit repo and custom ref', () => {
    const result = parseSkillInput('Mindrally/skills/chrome-extension-development@v1.0.0');
    expect(result).toEqual({
      name: 'chrome-extension-development',
      repo: 'Mindrally/skills',
      path: 'chrome-extension-development',
      ref: 'v1.0.0',
    });
  });

  it('supports nested paths under a repo', () => {
    const result = parseSkillInput('acme/ai-skills/agents/rag@dev');
    expect(result).toEqual({
      name: 'rag',
      repo: 'acme/ai-skills',
      path: 'agents/rag',
      ref: 'dev',
    });
  });

  it('rejects inputs with multiple @ characters', () => {
    expect(() => parseSkillInput('owner/skill@main@next')).toThrow(/Multiple @ not allowed/);
  });

  it('rejects inputs without enough segments', () => {
    expect(() => parseSkillInput('invalidinput')).toThrow(/Invalid format/);
  });
});
