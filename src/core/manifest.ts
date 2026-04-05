import { FileSystem, SkillDescriptor, SkillLockfile, SkillManifest } from './types';
import { getLockfilePath, getManifestPath, schemaUrl, getSkillsInstallPath } from './config';
import { normalizeDescriptor } from './repos';
import { LockfileNotFoundError, ManifestNotFoundError } from './errors';

export class ManifestRepository {
  constructor(
    private readonly fs: FileSystem,
    private readonly cwd = process.cwd(),
  ) {}

  get cwdPath(): string {
    return this.cwd;
  }

  private normalizeManifest(manifest: SkillManifest): SkillManifest {
    return {
      ...manifest,
      skills: manifest.skills.map((skill) => normalizeDescriptor(skill)),
    };
  }

  async readManifest(): Promise<SkillManifest> {
    const target = getManifestPath(this.cwd);
    if (!(await this.fs.pathExists(target))) {
      throw new ManifestNotFoundError(target);
    }
    const manifest = await this.fs.readJson<SkillManifest>(target);
    return this.normalizeManifest(manifest);
  }

  async readOrInitializeManifest(): Promise<SkillManifest> {
    try {
      return await this.readManifest();
    } catch (error) {
      if (error instanceof ManifestNotFoundError) {
        return {
          $schema: schemaUrl(),
          skills: [],
        };
      }
      throw error;
    }
  }

  async writeManifest(manifest: SkillManifest): Promise<void> {
    const enriched = this.normalizeManifest({ ...manifest });
    if (!enriched.$schema) {
      enriched.$schema = schemaUrl();
    }
    await this.fs.writeJson(getManifestPath(this.cwd), enriched);
  }

  async readLockfile(): Promise<SkillLockfile> {
    const target = getLockfilePath(this.cwd);
    if (!(await this.fs.pathExists(target))) {
      throw new LockfileNotFoundError(target);
    }
    return this.fs.readJson<SkillLockfile>(target);
  }

  async readLockfileIfExists(): Promise<SkillLockfile | null> {
    try {
      return await this.readLockfile();
    } catch (error) {
      if (error instanceof LockfileNotFoundError) {
        return null;
      }
      throw error;
    }
  }

  async writeLockfile(lockfile: SkillLockfile): Promise<void> {
    await this.fs.writeJson(getLockfilePath(this.cwd), lockfile);
  }

  async removeSkillFromManifest(skillName: string): Promise<void> {
    const manifest = await this.readManifest();
    manifest.skills = manifest.skills.filter((skill) => skill.name !== skillName);
    await this.writeManifest(manifest);
  }

  async upsertSkill(skill: SkillDescriptor): Promise<void> {
    const manifest = await this.readOrInitializeManifest();
    const nextSkills = manifest.skills.filter((entry) => entry.name !== skill.name);
    nextSkills.push(skill);
    manifest.skills = nextSkills;
    await this.writeManifest(manifest);
  }

  manifestPath(): string {
    return getManifestPath(this.cwd);
  }

  lockfilePath(): string {
    return getLockfilePath(this.cwd);
  }

  skillInstallPath(skillName: string): string {
    return getSkillsInstallPath(skillName, this.cwd);
  }
}
