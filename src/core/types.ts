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
  ensureRepo(_repo: string, _destination?: string): Promise<string>;
  exportPath(_repoPath: string, _commit: string, _destination: string, _subPath?: string): Promise<void>;
}

export interface FileSystem {
  pathExists(_path: string): Promise<boolean>;
  ensureDir(_path: string): Promise<void>;
  readJson<T>(_path: string): Promise<T>;
  writeJson(_path: string, _data: unknown): Promise<void>;
  readFile(_path: string): Promise<string>;
  isDirectory(_path: string): Promise<boolean>;
  remove(_path: string): Promise<void>;
  copy(_src: string, _dest: string): Promise<void>;
  symlink(_target: string, _path: string): Promise<void>;
  readDir(_path: string): Promise<string[]>;
}
