import os from 'node:os';
import path from 'node:path';
import { repoCacheKey } from './repos';
import packageJson from '../../package.json';

const SKILLETON_DIR_NAME = '.skilleton';
const SKILL_CACHE_DIR = 'cache';
const SKILL_INSTALL_DIR = 'skills';
export const MANIFEST_FILENAME = 'skilleton.json';
export const LOCKFILE_FILENAME = 'skilleton.lock.json';
const SCHEMA_BASENAME = MANIFEST_FILENAME.replace('.json', '.schema.json');

/** Returns the manifest file path for a working directory. */
export function getManifestPath(cwd: string = process.cwd()): string {
  return path.join(cwd, MANIFEST_FILENAME);
}

/** Returns the lockfile path for a working directory. */
export function getLockfilePath(cwd: string = process.cwd()): string {
  return path.join(cwd, LOCKFILE_FILENAME);
}

/** Returns the `.skilleton` root directory for a working directory. */
export function getSkillsRoot(cwd: string = process.cwd()): string {
  return path.join(cwd, SKILLETON_DIR_NAME);
}

/** Returns the install path for a skill name in a working directory. */
export function getSkillsInstallPath(skillName: string, cwd: string = process.cwd()): string {
  return path.join(getSkillsRoot(cwd), SKILL_INSTALL_DIR, skillName);
}

/** Returns the agent symlink path for a skill name. */
export function getAgentSymlinkPath(agent: string, skillName: string, cwd: string = process.cwd()): string {
  return path.join(getSkillsRoot(cwd), 'agents', agent, skillName);
}

/** Returns the global cache root used for cloned repositories. */
export function getCacheRoot(): string {
  return path.join(os.homedir(), SKILLETON_DIR_NAME, SKILL_CACHE_DIR);
}

/** Returns the cache path for a repository URL or spec. */
export function getRepoCachePath(repo: string): string {
  return path.join(getCacheRoot(), repoCacheKey(repo));
}

/** Returns the remote JSON schema URL for the current package version. */
export function schemaUrl(): string {
  const version = packageJson.version;
  // For prerelease versions, use stable main branch to avoid non-existent tags
  if (version.includes('-')) {
    return `https://raw.githubusercontent.com/Fcmam5/skilleton/main/${SCHEMA_BASENAME}`;
  }
  return `https://raw.githubusercontent.com/Fcmam5/skilleton/v${version}/${SCHEMA_BASENAME}`;
}
