import { NodeFileSystem } from './core/filesystem';
import { ManifestRepository } from './core/manifest';
import { ManifestValidator } from './core/validate';
import { ExecaGitClient } from './adapters/git';
import { SkillResolver } from './core/resolve';
import { SkillInstaller } from './core/install';
import { GitRefResolver } from './core/git-ref-resolver';

export interface SkilletonEnvironment {
  fs: NodeFileSystem;
  validator: ManifestValidator;
  manifestRepo: ManifestRepository;
  git: ExecaGitClient;
  resolver: SkillResolver;
  installer: SkillInstaller;
}

export function createEnvironment(cwd: string = process.cwd()): SkilletonEnvironment {
  const fs = new NodeFileSystem();
  const validator = new ManifestValidator();
  const manifestRepo = new ManifestRepository(fs, cwd);
  const refResolver = new GitRefResolver();
  const git = new ExecaGitClient();
  const resolver = new SkillResolver(refResolver);
  const installer = new SkillInstaller(fs, git);

  return {
    fs,
    validator,
    manifestRepo,
    git,
    resolver,
    installer,
  };
}
