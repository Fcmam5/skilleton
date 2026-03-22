export class SkillsetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SkillsetError';
  }
}

export class HttpError extends SkillsetError {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export class ManifestNotFoundError extends SkillsetError {
  constructor(path: string) {
    super(`Manifest not found at ${path}`);
    this.name = 'ManifestNotFoundError';
  }
}

export class LockfileNotFoundError extends SkillsetError {
  constructor(path: string) {
    super(`Lockfile not found at ${path}`);
    this.name = 'LockfileNotFoundError';
  }
}

export class SkillValidationError extends SkillsetError {
  constructor(message: string) {
    super(message);
    this.name = 'SkillValidationError';
  }
}

export class SkillInstallError extends SkillsetError {
  constructor(message: string) {
    super(message);
    this.name = 'SkillInstallError';
  }
}
