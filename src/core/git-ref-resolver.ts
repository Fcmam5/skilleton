import { ensureRepoUrl } from './repos';
import { SkillValidationError } from './errors';

const SHA_PATTERN = /^[0-9a-f]{40}$/i;
const SHORT_SHA_PATTERN = /^[0-9a-f]{6,}$/i;

type ExecaRunner = (_cmd: string, _args: string[]) => Promise<{ stdout: string }>;

async function defaultRunner(_cmd: string, _args: string[]): Promise<{ stdout: string }> {
  const { execa } = await import('execa');
  return execa(_cmd, _args);
}

export class GitRefResolver {
  constructor(
    private readonly _gitBinary: string = 'git',
    private readonly _run: ExecaRunner = defaultRunner,
  ) {}

  async resolve(repo: string, ref: string): Promise<string> {
    if (SHA_PATTERN.test(ref)) {
      return ref;
    }

    const remote = this.normalizeRepo(repo);
    const isShortSha = SHORT_SHA_PATTERN.test(ref);

    try {
      const refPatterns = this.buildRefPatterns(ref);
      const { stdout: refsStdout } = await this._run(this._gitBinary, ['ls-remote', '--refs', remote, ...refPatterns]);
      const exactSha = this.extractSha(refsStdout, refPatterns);
      if (exactSha) {
        return exactSha;
      }

      if (isShortSha) {
        const { stdout: prefixStdout } = await this._run(this._gitBinary, ['ls-remote', remote]);
        const sha = this.extractShaByPrefix(prefixStdout, ref);
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
    // Only append .git for HTTPS URLs, not SSH-style repos
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
      if (patterns.some((pattern) => name === pattern)) {
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

    const matches: string[] = [];
    for (const line of lines) {
      const [sha] = line.split(/\s+/);
      if (sha && sha.startsWith(prefix)) {
        matches.push(sha);
      }
    }

    if (matches.length === 0) {
      return null;
    }

    if (matches.length === 1) {
      return matches[0];
    }

    throw new SkillValidationError(`Ref prefix "${prefix}" is ambiguous. Matches: ${matches.join(', ')}`);
  }
}
