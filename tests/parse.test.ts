import { parseSkillInput } from '../src/core/parse';

describe('parseSkillInput', () => {
  it('parses owner/skill as direct repo with default ref', () => {
    const result = parseSkillInput('mindrally/jest');
    expect(result).toEqual({
      name: 'jest',
      repo: 'https://github.com/mindrally/jest',
      path: '.',
      ref: 'main',
    });
  });

  it('parses mhdcodes/react-query-skill as direct repo with default ref', () => {
    const result = parseSkillInput('mhdcodes/react-query-skill');
    expect(result).toEqual({
      name: 'react-query-skill',
      repo: 'https://github.com/mhdcodes/react-query-skill',
      path: '.',
      ref: 'main',
    });
  });

  it('parses owner/repo/path with explicit repo and custom ref', () => {
    const result = parseSkillInput('Mindrally/skills/chrome-extension-development@v1.0.0');
    expect(result).toEqual({
      name: 'chrome-extension-development',
      repo: 'https://github.com/Mindrally/skills',
      path: 'chrome-extension-development',
      ref: 'v1.0.0',
    });
  });

  it('keeps explicit skills monorepo paths intact', () => {
    const result = parseSkillInput('mhdcodes/skills/react-query-skill');
    expect(result).toEqual({
      name: 'react-query-skill',
      repo: 'https://github.com/mhdcodes/skills',
      path: 'react-query-skill',
      ref: 'main',
    });
  });

  it('supports nested paths under a repo', () => {
    const result = parseSkillInput('acme/ai-skills/agents/rag@dev');
    expect(result).toEqual({
      name: 'rag',
      repo: 'https://github.com/acme/ai-skills',
      path: 'agents/rag',
      ref: 'dev',
    });
  });

  it('accepts full repository URLs for non-GitHub hosts', () => {
    const result = parseSkillInput('https://gitlab.com/org/skills/agents/vector@release');
    expect(result).toEqual({
      name: 'vector',
      repo: 'https://gitlab.com/org/skills',
      path: 'agents/vector',
      ref: 'release',
    });
  });

  it('rejects inputs with multiple @ characters', () => {
    expect(() => parseSkillInput('owner/skill@main@next')).toThrow(/Multiple @ not allowed/);
  });

  it('rejects inputs without enough segments', () => {
    expect(() => parseSkillInput('invalidinput')).toThrow(/Invalid format/);
  });
});
