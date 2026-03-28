import { execa } from 'execa';
import { ensureRepoUrl } from './repos';
import { SkillValidationError } from './errors';

const SHA_PATTERN = /^[0-9a-f]{40}$/i;
const SHORT_SHA_PATTERN = /^[0-9a-f]{6,}$/i;

export class GitRefResolver {
  constructor(private readonly _gitBinary: string = 'git') {}

  async resolve(repo: string, ref: string): Promise<string> {
    if (SHA_PATTERN.test(ref)) {
      return ref;
    }

    const remote = this.normalizeRepo(repo);
    const isShortSha = SHORT_SHA_PATTERN.test(ref);

    try {
      const args = isShortSha ? ['ls-remote', remote] : ['ls-remote', '--refs', remote, ...this.buildRefPatterns(ref)];
      const { stdout } = await execa(this._gitBinary, args);

      if (isShortSha) {
        const sha = this.extractShaByPrefix(stdout, ref);
        if (sha) {
          return sha;
        }
        // Fallback: try with --refs to include branch/tag names that might contain the prefix
        const { stdout: refsStdout } = await execa(this._gitBinary, ['ls-remote', '--refs', remote]);
        const refsSha = this.extractShaByPrefix(refsStdout, ref);
        if (refsSha) {
          return refsSha;
        }
      } else {
        const sha = this.extractSha(stdout, this.buildRefPatterns(ref));
        if (sha) {
          return sha;
        }
      }

      throw new SkillValidationError(`Unable to resolve ref "${ref}" in ${remote}`);
    } catch (error) {
      if (error instanceof SkillValidationError) {
        throw error;
      }
      throw new SkillValidationError(`git ls-remote failed for ${remote}@${ref}: ${(error as Error).message}`);
    }
  }

  private normalizeRepo(repo: string): string {
    const normalized = ensureRepoUrl(repo);
    if (normalized.startsWith('https://')) {
      return `${normalized}.git`.replace(/\.git\.git$/i, '.git');
    }
    return normalized;
  }

  private buildRefPatterns(ref: string): string[] {
    const candidates = new Set<string>([ref]);
    candidates.add(`refs/heads/${ref}`);
    candidates.add(`refs/tags/${ref}`);
    return Array.from(candidates);
  }

  private extractSha(output: string, patterns: string[]): string | null {
    const lines = output
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    for (const line of lines) {
      const [sha, name] = line.split(/\s+/);
      if (!sha || !name) {
        continue;
      }
      if (patterns.some((pattern) => name === pattern || name.endsWith(pattern))) {
        return sha;
      }
    }
    return null;
  }

  private extractShaByPrefix(output: string, prefix: string): string | null {
    const lines = output
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    for (const line of lines) {
      const [sha] = line.split(/\s+/);
      if (sha && sha.startsWith(prefix)) {
        return sha;
      }
    }
    return null;
  }
}
