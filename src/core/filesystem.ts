import { promises as fs } from 'node:fs';
import path from 'node:path';
import { FileSystem } from './types';

/**
 * Node.js filesystem interface.
 *
 * This class provides a filesystem interface for Node.js environments.
 * It can be handy for testing and for dry-run operations.
 */
export class NodeFileSystem implements FileSystem {
  /**
   * Checks whether a path exists.
   * @param target Absolute or relative path.
   */
  async pathExists(target: string): Promise<boolean> {
    try {
      await fs.access(target);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Ensures a directory exists.
   * @param target Directory path.
   */
  async ensureDir(target: string): Promise<void> {
    await fs.mkdir(target, { recursive: true });
  }

  async mkdtemp(prefix: string): Promise<string> {
    return fs.mkdtemp(prefix);
  }

  /**
   * Reads and parses JSON from disk.
   * @param target JSON file path.
   */
  async readJson<T>(target: string): Promise<T> {
    const data = await fs.readFile(target, 'utf-8');
    return JSON.parse(data) as T;
  }

  /**
   * Serializes and writes JSON to disk.
   * @param target JSON file path.
   * @param data Serializable data to write.
   */
  async writeJson(target: string, data: unknown): Promise<void> {
    const serialized = JSON.stringify(data, null, 2);
    await this.ensureDir(path.dirname(target));
    await fs.writeFile(target, `${serialized}\n`, 'utf-8');
  }

  /**
   * Reads a UTF-8 file from disk.
   * @param target File path.
   */
  async readFile(target: string): Promise<string> {
    return fs.readFile(target, 'utf-8');
  }

  /**
   * Checks whether a path points to a directory.
   * @param target Path to inspect.
   */
  async isDirectory(target: string): Promise<boolean> {
    try {
      const stats = await fs.stat(target);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Removes a path recursively.
   * @param target Path to remove.
   */
  async remove(target: string): Promise<void> {
    await fs.rm(target, { recursive: true, force: true });
  }

  /**
   * Copies files or directories.
   * @param src Source path.
   * @param dest Destination path.
   */
  async copy(src: string, dest: string): Promise<void> {
    await this.ensureDir(path.dirname(dest));
    await fs.cp(src, dest, { recursive: true });
  }

  /**
   * Creates or replaces a symlink.
   * @param target Symlink target.
   * @param dest Symlink destination path.
   */
  async symlink(target: string, dest: string): Promise<void> {
    if (await this.pathExists(dest)) {
      await this.remove(dest);
    }
    await this.ensureDir(path.dirname(dest));
    await fs.symlink(target, dest);
  }

  /**
   * Reads directory entries.
   * @param target Directory path.
   */
  async readDir(target: string): Promise<string[]> {
    return fs.readdir(target);
  }
}
