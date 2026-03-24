import { promises as fs } from 'node:fs';
import path from 'node:path';
import { FileSystem } from './types';

export class NodeFileSystem implements FileSystem {
  async pathExists(target: string): Promise<boolean> {
    try {
      await fs.access(target);
      return true;
    } catch {
      return false;
    }
  }

  async ensureDir(target: string): Promise<void> {
    await fs.mkdir(target, { recursive: true });
  }

  async readJson<T>(target: string): Promise<T> {
    const data = await fs.readFile(target, 'utf-8');
    return JSON.parse(data) as T;
  }

  async writeJson(target: string, data: unknown): Promise<void> {
    const serialized = JSON.stringify(data, null, 2);
    await this.ensureDir(path.dirname(target));
    await fs.writeFile(target, `${serialized}\n`, 'utf-8');
  }

  async readFile(target: string): Promise<string> {
    return fs.readFile(target, 'utf-8');
  }

  async isDirectory(target: string): Promise<boolean> {
    try {
      const stats = await fs.stat(target);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  async remove(target: string): Promise<void> {
    await fs.rm(target, { recursive: true, force: true });
  }

  async copy(src: string, dest: string): Promise<void> {
    await this.ensureDir(path.dirname(dest));
    await fs.cp(src, dest, { recursive: true });
  }

  async symlink(target: string, dest: string): Promise<void> {
    if (await this.pathExists(dest)) {
      await this.remove(dest);
    }
    await this.ensureDir(path.dirname(dest));
    await fs.symlink(target, dest);
  }

  async readDir(target: string): Promise<string[]> {
    return fs.readdir(target);
  }
}
