import { SkillDescriptor } from './types';
import { DEFAULT_REPO_HOST, isRepoUrl, normalizeRepoUrl } from './repos';

const DEFAULT_REF = 'main';

class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}

const MULTIPLE_AT_ERROR = new ParseError('Multiple @ not allowed');
const INVALID_FORMAT_ERROR = new ParseError('Invalid format. Use owner/skill[@ref] or a repo URL');

function splitRef(input: string): { spec: string; ref: string } {
  const atCount = (input.match(/@/g) ?? []).length;
  if (atCount > 1) {
    throw MULTIPLE_AT_ERROR;
  }

  if (atCount === 1) {
    const idx = input.lastIndexOf('@');
    const spec = input.slice(0, idx);
    const ref = input.slice(idx + 1);
    if (!spec || !ref) {
      throw INVALID_FORMAT_ERROR;
    }
    return { spec, ref };
  }

  return { spec: input, ref: DEFAULT_REF };
}

function deriveRepoAndPathFromUrl(spec: string): { repo: string; path: string } {
  try {
    const parsed = new URL(spec);
    const segments = parsed.pathname.split('/').filter(Boolean);
    if (segments.length < 2) {
      throw INVALID_FORMAT_ERROR;
    }
    const repoSegments = segments.slice(0, 2);
    const pathSegments = segments.slice(2);
    return {
      repo: normalizeRepoUrl(`${parsed.origin}/${repoSegments.join('/')}`),
      path: pathSegments.length ? pathSegments.join('/') : '.',
    };
  } catch {
    throw INVALID_FORMAT_ERROR;
  }
}

function deriveFromSegments(segments: string[]): { repo: string; path: string } {
  if (segments.length === 2) {
    const [owner, skill] = segments;
    return {
      repo: normalizeRepoUrl(`${DEFAULT_REPO_HOST}/${owner}/skills`),
      path: skill,
    };
  }

  if (segments.length >= 3) {
    const [owner, repo] = segments;
    const subPath = segments.slice(2).join('/');
    return {
      repo: normalizeRepoUrl(`${DEFAULT_REPO_HOST}/${owner}/${repo}`),
      path: subPath || '.',
    };
  }

  throw INVALID_FORMAT_ERROR;
}

function normalizeSegments(spec: string): string[] {
  const segments = spec.split('/').filter(Boolean);
  if (segments.length < 2) {
    throw INVALID_FORMAT_ERROR;
  }
  return segments;
}

export function parseSkillInput(input: string): SkillDescriptor {
  if (!input || typeof input !== 'string') {
    throw INVALID_FORMAT_ERROR;
  }

  const trimmed = input.trim();
  const { spec, ref } = splitRef(trimmed);
  const { repo, path } = isRepoUrl(spec) ? deriveRepoAndPathFromUrl(spec) : deriveFromSegments(normalizeSegments(spec));
  const normalizedPath = path === '.' ? path : path.replace(/\\/g, '/');
  const pathSegments = normalizedPath.split('/').filter(Boolean);
  const name = pathSegments[pathSegments.length - 1] || repo.split('/').filter(Boolean).pop() || spec;

  return {
    name,
    repo,
    path: normalizedPath,
    ref,
  };
}

export type { SkillDescriptor } from './types';
