import { ManifestValidator, ManifestValidationError } from '../src/core/validate';
import { SkillManifest } from '../src/core/types';

describe('ManifestValidator', () => {
  let validator: ManifestValidator;

  const baseManifest: SkillManifest = {
    $schema: './skilleton.schema.json',
    skills: [
      {
        name: 'alpha',
        repo: 'https://github.com/acme/skills',
        path: 'alpha',
        ref: 'main',
      },
      {
        name: 'beta',
        repo: 'https://github.com/acme/skills',
        path: 'beta',
        ref: 'dev',
      },
    ],
  };

  beforeEach(() => {
    validator = new ManifestValidator();
  });

  it('accepts a valid manifest', () => {
    expect(() => validator.validate(baseManifest)).not.toThrow();
  });

  it('throws when skill list is missing', () => {
    const invalidManifest = { $schema: './skilleton.schema.json' } as unknown as SkillManifest;
    expect(() => validator.validate(invalidManifest)).toThrow(ManifestValidationError);
  });

  it('throws when a skill is missing required fields', () => {
    const invalidManifest = {
      $schema: './skilleton.schema.json',
      skills: [
        {
          name: 'alpha',
          repo: 'https://github.com/acme/skills',
          path: 'alpha',
          ref: 'main',
        },
        {
          name: 'invalid',
        },
      ],
    } as unknown as SkillManifest;

    expect(() => validator.validate(invalidManifest)).toThrow(ManifestValidationError);
  });

  it('throws when duplicate skill names are declared', () => {
    const manifest: SkillManifest = {
      $schema: './skilleton.schema.json',
      skills: [baseManifest.skills[0], { ...baseManifest.skills[1], name: 'alpha' }],
    };

    expect(() => validator.validate(manifest)).toThrow(ManifestValidationError);
  });
});
