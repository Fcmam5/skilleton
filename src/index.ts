export { createEnvironment } from './env';
export type { SkilletonEnvironment } from './env';

export { AddCommand } from './commands/add';
export { InstallCommand } from './commands/install';
export { UpdateCommand } from './commands/update';
export { ListCommand } from './commands/list';
export { DescribeCommand } from './commands/describe';
export { AuditCommand } from './commands/audit';
export type { Command, CommandArgs } from './commands/types';

export { ExecaGitClient } from './adapters/git';

export { ManifestRepository } from './core/manifest';
export { ManifestValidator } from './core/validate';
export { SkillResolver } from './core/resolve';
export type { ResolveOptions } from './core/resolve';
export { SkillInstaller } from './core/install';
export { GitRefResolver } from './core/git-ref-resolver';
export { NodeFileSystem } from './core/filesystem';

export { parseSkillInput } from './core/parse';
export { serializeLockfile, getChangedSkills, pruneLockfile, reconcileLockfile } from './core/lock';
export type { ReconcileLockfileResult } from './core/lock';
export { ensureRepoUrl, normalizeRepoUrl, isRepoUrl, normalizeDescriptor, repoCacheKey } from './core/repos';
export {
  getManifestPath,
  getLockfilePath,
  getSkillsRoot,
  getSkillsInstallPath,
  getAgentSymlinkPath,
  getCacheRoot,
  getRepoCachePath,
  schemaUrl,
} from './core/config';
export { Logger } from './core/logger';

export { LockfileNotFoundError, ManifestNotFoundError, SkillValidationError, SkillInstallError } from './core/errors';

export type {
  SkillDescriptor,
  SkillManifest,
  LockedSkill,
  SkillLockfile,
  InstallOptions,
  ResolutionResult,
  InstallResult,
  GitClient,
  FileSystem,
} from './core/types';
