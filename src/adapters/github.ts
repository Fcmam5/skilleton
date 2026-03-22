import { GitHubClient } from '../core/types';
import { HttpError } from '../core/errors';
import packageJson from '../../package.json';

const API_BASE = 'https://api.github.com';
const USER_AGENT = `${packageJson.name}/${packageJson.version}`;

export class RestGitHubClient implements GitHubClient {
  constructor(private readonly token = process.env.SKILLETON_GITHUB_TOKEN ?? process.env.GITHUB_TOKEN) {}

  async resolveCommit(repo: string, ref: string): Promise<string> {
    const url = `${API_BASE}/repos/${repo}/commits/${encodeURIComponent(ref)}`;
    const headers: Record<string, string> = {
      'User-Agent': USER_AGENT,
      Accept: 'application/vnd.github+json',
    };
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      headers,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new HttpError(response.status, `GitHub API error (${response.status}) for ${repo}@${ref}: ${body}`);
    }

    const payload = (await response.json()) as { sha?: string };
    if (!payload.sha) {
      throw new HttpError(response.status, 'Commit SHA missing in response');
    }

    return payload.sha;
  }
}
