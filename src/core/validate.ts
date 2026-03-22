import { Ajv, type ValidateFunction } from 'ajv';
import formatsPlugin from 'ajv-formats';
import schema from '../../skillset.schema.json';
import { SkillManifest } from './types';

export class ManifestValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ManifestValidationError';
  }
}

export class ManifestValidator {
  private readonly ajv: Ajv;
  private readonly validateFn: ValidateFunction<SkillManifest>;

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      allowUnionTypes: true,
      strict: false,
    });
    // Hacky way to use the default export, see: https://github.com/ajv-validator/ajv-formats/issues/85#issuecomment-3374070837
    formatsPlugin.default(this.ajv);
    this.validateFn = this.ajv.compile<SkillManifest>(schema);
  }

  public validate(manifest: SkillManifest): void {
    const valid = this.validateFn(manifest);
    if (!valid && this.validateFn.errors) {
      const message = this.ajv.errorsText(this.validateFn.errors, {
        separator: '\n',
      });
      throw new ManifestValidationError(message);
    }

    const names = new Set<string>();
    for (const skill of manifest.skills) {
      if (names.has(skill.name)) {
        throw new ManifestValidationError(`Duplicate skill name detected: ${skill.name}`);
      }
      names.add(skill.name);
    }
  }
}
