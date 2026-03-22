import os from 'node:os';
import path from 'node:path';
import { repoCacheKey } from './repos';

const SKILLETON_DIR_NAME = '.skilleton';
const SKILL_CACHE_DIR = 'cache';
const SKILL_INSTALL_DIR = 'skills';
export const MANIFEST_FILENAME = 'skilleton.json';
export const LOCKFILE_FILENAME = 'skilleton.lock.json';

export function getManifestPath(cwd: string = process.cwd()): string {
  return path.join(cwd, MANIFEST_FILENAME);
}

export function getLockfilePath(cwd: string = process.cwd()): string {
  return path.join(cwd, LOCKFILE_FILENAME);
}

export function getSkillsRoot(cwd: string = process.cwd()): string {
  return path.join(cwd, SKILLETON_DIR_NAME);
}

export function getSkillsInstallPath(skillName: string, cwd: string = process.cwd()): string {
  return path.join(getSkillsRoot(cwd), SKILL_INSTALL_DIR, skillName);
}

export function getAgentSymlinkPath(agent: string, skillName: string, cwd: string = process.cwd()): string {
  return path.join(getSkillsRoot(cwd), 'agents', agent, skillName);
}

export function getCacheRoot(): string {
  return path.join(os.homedir(), SKILLETON_DIR_NAME, SKILL_CACHE_DIR);
}

export function getRepoCachePath(repo: string): string {
  return path.join(getCacheRoot(), repoCacheKey(repo));
}

export function schemaRelativePath(): string {
  return `./${MANIFEST_FILENAME.replace('.json', '.schema.json')}`;
}
