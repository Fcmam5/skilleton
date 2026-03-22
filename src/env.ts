import { NodeFileSystem } from './core/filesystem';
import { ManifestRepository } from './core/manifest';
import { ManifestValidator } from './core/validate';
import { RestGitHubClient } from './adapters/github';
import { ExecaGitClient } from './adapters/git';
import { SkillResolver } from './core/resolve';
import { SkillInstaller } from './core/install';

export interface SkilletonEnvironment {
  fs: NodeFileSystem;
  validator: ManifestValidator;
  manifestRepo: ManifestRepository;
  github: RestGitHubClient;
  git: ExecaGitClient;
  resolver: SkillResolver;
  installer: SkillInstaller;
}

export function createEnvironment(cwd: string = process.cwd()): SkilletonEnvironment {
  const fs = new NodeFileSystem();
  const validator = new ManifestValidator();
  const manifestRepo = new ManifestRepository(fs, cwd);
  const github = new RestGitHubClient();
  const git = new ExecaGitClient();
  const resolver = new SkillResolver(github);
  const installer = new SkillInstaller(fs, git);

  return {
    fs,
    validator,
    manifestRepo,
    github,
    git,
    resolver,
    installer,
  };
}
