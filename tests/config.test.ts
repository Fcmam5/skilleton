import { homedir } from 'os';
import { join } from 'path';
import {
  getManifestPath,
  getLockfilePath,
  getSkillsRoot,
  getSkillsInstallPath,
  getAgentSymlinkPath,
  getCacheRoot,
  getRepoCachePath,
  schemaRelativePath,
} from '../src/core/config';
import { repoCacheKey } from '../src/core/repos';

describe('config helpers', () => {
  describe('getManifestPath', () => {
    it('returns skilleton.json under cwd', () => {
      const path = getManifestPath();
      expect(path).toBe(join(process.cwd(), 'skilleton.json'));
    });
  });

  describe('getLockfilePath', () => {
    it('returns skilleton.lock.json under cwd', () => {
      const path = getLockfilePath();
      expect(path).toBe(join(process.cwd(), 'skilleton.lock.json'));
    });
  });

  describe('getSkillsRoot', () => {
    it('returns .skilleton under cwd', () => {
      const path = getSkillsRoot();
      expect(path).toBe(join(process.cwd(), '.skilleton'));
    });
  });

  describe('getSkillsInstallPath', () => {
    it('returns .skilleton/skills under cwd', () => {
      const path = getSkillsInstallPath('demo-skill');
      expect(path).toBe(join(process.cwd(), '.skilleton', 'skills', 'demo-skill'));
    });
  });

  describe('getAgentSymlinkPath', () => {
    it('returns the symlink path under the agent directory', () => {
      const path = getAgentSymlinkPath('my-agent', 'demo-skill');
      expect(path).toBe(join(process.cwd(), '.skilleton', 'agents', 'my-agent', 'demo-skill'));
    });
  });

  describe('getCacheRoot', () => {
    it('returns ~/.skilleton/cache under the home directory', () => {
      const path = getCacheRoot();
      expect(path).toBe(join(homedir(), '.skilleton', 'cache'));
    });
  });

  describe('getRepoCachePath', () => {
    it('combines cache root with repo cache key', () => {
      const input = 'owner/repo';
      const path = getRepoCachePath(input);
      expect(path).toBe(join(getCacheRoot(), repoCacheKey(input)));
    });
  });

  describe('repoCacheKey', () => {
    it('sanitizes owner/repo to owner_repo', () => {
      const key = repoCacheKey('owner/repo');
      expect(key).toBe('https_github.com_owner_repo');
    });

    it('sanitizes owner/repo/subpath to owner_repo_subpath', () => {
      const key = repoCacheKey('owner/repo/sub/path');
      expect(key).toBe('https_github.com_owner_repo_sub_path');
    });

    it('handles HTTPS URLs with .git', () => {
      const key = repoCacheKey('https://github.com/owner/repo.git');
      expect(key).toBe('https_github.com_owner_repo');
    });

    it('handles HTTPS URLs without .git', () => {
      const key = repoCacheKey('https://github.com/owner/repo');
      expect(key).toBe('https_github.com_owner_repo');
    });

    it('handles HTTPS URLs with subpath', () => {
      const key = repoCacheKey('https://github.com/owner/repo/sub/path');
      expect(key).toBe('https_github.com_owner_repo_sub_path');
    });

    it('handles SSH shorthand', () => {
      const key = repoCacheKey('git@github.com:owner/repo.git');
      expect(key).toBe('https_github.com_owner_repo');
    });

    it('handles SSH shorthand without .git', () => {
      const key = repoCacheKey('git@github.com:owner/repo');
      expect(key).toBe('https_github.com_owner_repo');
    });

    it('handles SSH shorthand with subpath', () => {
      const key = repoCacheKey('git@github.com:owner/repo/sub/path');
      expect(key).toBe('https_github.com_owner_repo_sub_path');
    });
  });

  describe('schemaRelativePath', () => {
    it('returns ./skilleton.schema.json', () => {
      const path = schemaRelativePath();
      expect(path).toBe('./skilleton.schema.json');
    });
  });
});
