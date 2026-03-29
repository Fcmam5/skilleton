import {
  HttpError,
  LockfileNotFoundError,
  ManifestNotFoundError,
  SkillInstallError,
  SkillValidationError,
  SkilletonError,
} from '../src/core/errors';

describe('errors', () => {
  it('creates SkilletonError with message', () => {
    const error = new SkilletonError('boom');
    expect(error.message).toBe('boom');
    expect(error.name).toBe('SkilletonError');
  });

  it('creates HttpError with status and message', () => {
    const error = new HttpError(404, 'Not Found');
    expect(error.status).toBe(404);
    expect(error.message).toBe('Not Found');
    expect(error.name).toBe('HttpError');
  });

  it('creates ManifestNotFoundError with path', () => {
    const error = new ManifestNotFoundError('/tmp/skilleton.json');
    expect(error.message).toBe('Manifest not found at /tmp/skilleton.json');
    expect(error.name).toBe('ManifestNotFoundError');
  });

  it('creates LockfileNotFoundError with path', () => {
    const error = new LockfileNotFoundError('/tmp/skilleton.lock.json');
    expect(error.message).toBe('Lockfile not found at /tmp/skilleton.lock.json');
    expect(error.name).toBe('LockfileNotFoundError');
  });

  it('creates SkillValidationError with message', () => {
    const error = new SkillValidationError('Invalid skill');
    expect(error.message).toBe('Invalid skill');
    expect(error.name).toBe('SkillValidationError');
  });

  it('creates SkillInstallError with message', () => {
    const error = new SkillInstallError('install failed');
    expect(error.message).toBe('install failed');
    expect(error.name).toBe('SkillInstallError');
  });
});
