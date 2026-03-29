import { SkillDescriptor } from './types';

export const DEFAULT_REPO_HOST = 'https://github.com';
const SUPPORTED_PROTOCOLS = new Set(['http:', 'https:', 'git:', 'ssh:', 'git+ssh:']);

export function isRepoUrl(spec: string): boolean {
  if (!spec || typeof spec !== 'string') {
    return false;
  }

  // Check for SSH-style git@host:owner/repo pattern
  if (/^git@[\w\.-]+:[\w\-/]+$/.test(spec)) {
    return true;
  }

  try {
    const parsed = new URL(spec);
    return SUPPORTED_PROTOCOLS.has(parsed.protocol.toLowerCase());
  } catch {
    return false;
  }
}

export function normalizeRepoUrl(url: string): string {
  const withoutTrailingSlash = url.replace(/\/+$/, '');
  return withoutTrailingSlash.replace(/\.git$/i, '');
}

export function ensureRepoUrl(spec: string): string {
  if (!spec || typeof spec !== 'string') {
    throw new Error('Repository must be a non-empty string');
  }

  // Handle SSH-style git@host:owner/repo pattern - convert to HTTPS
  const sshMatch = spec.match(/^git@([\w\.-]+):([\w\-/]+)$/);
  if (sshMatch) {
    const [, host, path] = sshMatch;
    return normalizeRepoUrl(`https://${host}/${path}`);
  }

  if (isRepoUrl(spec)) {
    return normalizeRepoUrl(spec);
  }

  return normalizeRepoUrl(`${DEFAULT_REPO_HOST}/${spec}`);
}

export function repoCacheKey(repo: string): string {
  return ensureRepoUrl(repo)
    .replace(/[^a-z0-9._-]/gi, '_')
    .replace(/_+/g, '_');
}

export function normalizeDescriptor<T extends SkillDescriptor>(descriptor: T): T {
  const normalizedRepo = ensureRepoUrl(descriptor.repo);
  const normalizedPath = descriptor.path === '.' ? descriptor.path : descriptor.path.replace(/\\/g, '/');
  return {
    ...descriptor,
    repo: normalizedRepo,
    path: normalizedPath,
  };
}
