/** Base error type for Skilleton runtime and command failures. */
export class SkilletonError extends Error {
  /**
   * @param message Human-readable error message.
   */
  constructor(message: string) {
    super(message);
    this.name = 'SkilletonError';
  }
}

/** Error wrapper for HTTP status-based failures. */
export class HttpError extends SkilletonError {
  /**
   * @param status HTTP status code.
   * @param message Human-readable error message.
   */
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/** Thrown when `skilleton.json` cannot be found. */
export class ManifestNotFoundError extends SkilletonError {
  /**
   * @param path Expected manifest path.
   */
  constructor(path: string) {
    super(`Manifest not found at ${path}`);
    this.name = 'ManifestNotFoundError';
  }
}

/** Thrown when `skilleton.lock.json` cannot be found. */
export class LockfileNotFoundError extends SkilletonError {
  /**
   * @param path Expected lockfile path.
   */
  constructor(path: string) {
    super(`Lockfile not found at ${path}`);
    this.name = 'LockfileNotFoundError';
  }
}

/** Thrown when skill descriptors or refs fail validation. */
export class SkillValidationError extends SkilletonError {
  /**
   * @param message Human-readable error message.
   */
  constructor(message: string) {
    super(message);
    this.name = 'SkillValidationError';
  }
}

/** Thrown when skill export or metadata verification fails. */
export class SkillInstallError extends SkilletonError {
  /**
   * @param message Human-readable error message.
   */
  constructor(message: string) {
    super(message);
    this.name = 'SkillInstallError';
  }
}
