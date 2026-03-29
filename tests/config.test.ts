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

  describe('schemaRelativePath', () => {
    it('returns ./skilleton.schema.json', () => {
      const path = schemaRelativePath();
      expect(path).toBe('./skilleton.schema.json');
    });
  });
});
