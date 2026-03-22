export class SkilletonError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SkilletonError';
  }
}

export class HttpError extends SkilletonError {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export class ManifestNotFoundError extends SkilletonError {
  constructor(path: string) {
    super(`Manifest not found at ${path}`);
    this.name = 'ManifestNotFoundError';
  }
}

export class LockfileNotFoundError extends SkilletonError {
  constructor(path: string) {
    super(`Lockfile not found at ${path}`);
    this.name = 'LockfileNotFoundError';
  }
}

export class SkillValidationError extends SkilletonError {
  constructor(message: string) {
    super(message);
    this.name = 'SkillValidationError';
  }
}

export class SkillInstallError extends SkilletonError {
  constructor(message: string) {
    super(message);
    this.name = 'SkillInstallError';
  }
}
