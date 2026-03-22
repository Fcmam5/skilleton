export interface SkillDescriptor {
  name: string;
  repo: string;
  path: string;
  ref: string;
}

export interface SkillManifest {
  $schema?: string;
  skills: SkillDescriptor[];
}

export interface LockedSkill extends SkillDescriptor {
  commit: string;
  timestamp: string;
}

export interface SkillLockfile {
  skills: Record<string, LockedSkill>;
}

export interface InstallOptions {
  agent?: string;
  lockfileOnly?: boolean;
  cwd?: string;
}

export interface ResolutionResult {
  descriptor: SkillDescriptor;
  commit: string;
}

export interface InstallResult {
  name: string;
  installPath: string;
  commit: string;
}

export interface GitClient {
  ensureRepo(repo: string, destination?: string): Promise<string>;
  exportPath(repoPath: string, commit: string, destination: string, subPath?: string): Promise<void>;
}

export interface FileSystem {
  pathExists(path: string): Promise<boolean>;
  ensureDir(path: string): Promise<void>;
  readJson<T>(path: string): Promise<T>;
  writeJson(path: string, data: unknown): Promise<void>;
  remove(path: string): Promise<void>;
  copy(src: string, dest: string): Promise<void>;
  symlink(target: string, path: string): Promise<void>;
  readDir(path: string): Promise<string[]>;
}

export interface GitHubClient {
  resolveCommit(repo: string, ref: string, token?: string): Promise<string>;
}
