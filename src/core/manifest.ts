import { FileSystem, SkillDescriptor, SkillLockfile, SkillManifest } from './types';
import { getLockfilePath, getManifestPath, schemaUrl, getSkillsInstallPath } from './config';
import { normalizeDescriptor } from './repos';
import { LockfileNotFoundError, ManifestNotFoundError } from './errors';

/** Reads and writes manifest and lockfile data for a working directory. */
export class ManifestRepository {
  constructor(
    private readonly fs: FileSystem,
    private readonly cwd = process.cwd(),
  ) {}

  /** Returns the repository working directory used by this instance. */
  get cwdPath(): string {
    return this.cwd;
  }

  private normalizeManifest(manifest: SkillManifest): SkillManifest {
    return {
      ...manifest,
      skills: manifest.skills.map((skill) => normalizeDescriptor(skill)),
    };
  }

  /**
   * Reads and normalizes `skilleton.json`.
   * @throws {ManifestNotFoundError} When the manifest does not exist.
   */
  async readManifest(): Promise<SkillManifest> {
    const target = getManifestPath(this.cwd);
    if (!(await this.fs.pathExists(target))) {
      throw new ManifestNotFoundError(target);
    }
    const manifest = await this.fs.readJson<SkillManifest>(target);
    return this.normalizeManifest(manifest);
  }

  /** Reads `skilleton.json`, or returns an empty initialized manifest when missing. */
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

  /** Writes a normalized manifest and ensures `$schema` is set. */
  async writeManifest(manifest: SkillManifest): Promise<void> {
    const enriched = this.normalizeManifest({ ...manifest });
    if (!enriched.$schema) {
      enriched.$schema = schemaUrl();
    }
    await this.fs.writeJson(getManifestPath(this.cwd), enriched);
  }

  /**
   * Reads `skilleton.lock.json`.
   * @throws {LockfileNotFoundError} When the lockfile does not exist.
   */
  async readLockfile(): Promise<SkillLockfile> {
    const target = getLockfilePath(this.cwd);
    if (!(await this.fs.pathExists(target))) {
      throw new LockfileNotFoundError(target);
    }
    return this.fs.readJson<SkillLockfile>(target);
  }

  /** Reads the lockfile when present, otherwise returns `null`. */
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

  /** Writes `skilleton.lock.json`. */
  async writeLockfile(lockfile: SkillLockfile): Promise<void> {
    await this.fs.writeJson(getLockfilePath(this.cwd), lockfile);
  }

  /** Removes a skill by name from the manifest. */
  async removeSkillFromManifest(skillName: string): Promise<void> {
    const manifest = await this.readManifest();
    manifest.skills = manifest.skills.filter((skill) => skill.name !== skillName);
    await this.writeManifest(manifest);
  }

  /** Inserts or replaces a skill descriptor in the manifest by name. */
  async upsertSkill(skill: SkillDescriptor): Promise<void> {
    const manifest = await this.readOrInitializeManifest();
    const nextSkills = manifest.skills.filter((entry) => entry.name !== skill.name);
    nextSkills.push(skill);
    manifest.skills = nextSkills;
    await this.writeManifest(manifest);
  }

  /** Returns the absolute manifest file path for this repository. */
  manifestPath(): string {
    return getManifestPath(this.cwd);
  }

  /** Returns the absolute lockfile path for this repository. */
  lockfilePath(): string {
    return getLockfilePath(this.cwd);
  }

  /** Returns the install directory path for a skill name. */
  skillInstallPath(skillName: string): string {
    return getSkillsInstallPath(skillName, this.cwd);
  }
}
