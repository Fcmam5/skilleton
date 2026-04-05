import path from 'node:path';
import { FileSystem } from '../../src/core/types';

export class MockedFileSystem implements FileSystem {
  private directories = new Set<string>();
  private files = new Map<string, string>();
  private tempCounter = 0;

  constructor() {
    this.directories.add('/');
  }

  addDirectory(dir: string): void {
    this.addDirectoryTree(this.normalize(dir));
  }

  addFile(target: string, content: string): void {
    const normalized = this.normalize(target);
    this.addDirectoryTree(path.dirname(normalized));
    this.files.set(normalized, content);
  }

  pathExists = jest.fn(async (target: string): Promise<boolean> => {
    const normalized = this.normalize(target);
    return this.directories.has(normalized) || this.files.has(normalized);
  });

  ensureDir = jest.fn(async (target: string): Promise<void> => {
    this.addDirectoryTree(this.normalize(target));
  });

  mkdtemp = jest.fn(async (prefix: string): Promise<string> => {
    this.tempCounter += 1;
    const tempDir = this.normalize(`${prefix}tmp-${this.tempCounter}`);
    this.addDirectoryTree(tempDir);
    return tempDir;
  });

  readJson = jest.fn(async (target: string): Promise<unknown> => {
    const content = await this.readFile(target);
    return JSON.parse(content);
  }) as jest.MockedFunction<FileSystem['readJson']>;

  writeJson = jest.fn(async (target: string, data: unknown): Promise<void> => {
    const normalized = this.normalize(target);
    this.addDirectoryTree(path.dirname(normalized));
    this.files.set(normalized, `${JSON.stringify(data, null, 2)}\n`);
  });

  readFile = jest.fn(async (target: string): Promise<string> => {
    const normalized = this.normalize(target);
    const content = this.files.get(normalized);
    if (content === undefined) {
      throw new Error(`File not found: ${target}`);
    }
    return content;
  });

  isDirectory = jest.fn(async (target: string): Promise<boolean> => {
    return this.directories.has(this.normalize(target));
  });

  remove = jest.fn(async (target: string): Promise<void> => {
    const normalized = this.normalize(target);
    this.files.delete(normalized);
    this.directories.delete(normalized);

    for (const filePath of Array.from(this.files.keys())) {
      if (filePath.startsWith(`${normalized}/`)) {
        this.files.delete(filePath);
      }
    }

    for (const dirPath of Array.from(this.directories)) {
      if (dirPath.startsWith(`${normalized}/`)) {
        this.directories.delete(dirPath);
      }
    }
  });

  copy = jest.fn(async (src: string, dest: string): Promise<void> => {
    const srcNormalized = this.normalize(src);
    const destNormalized = this.normalize(dest);

    if (this.files.has(srcNormalized)) {
      const content = this.files.get(srcNormalized);
      if (content !== undefined) {
        this.addDirectoryTree(path.dirname(destNormalized));
        this.files.set(destNormalized, content);
      }
      return;
    }

    if (this.directories.has(srcNormalized)) {
      this.addDirectoryTree(destNormalized);
      for (const dirPath of Array.from(this.directories)) {
        if (dirPath.startsWith(`${srcNormalized}/`)) {
          const relative = dirPath.slice(srcNormalized.length);
          this.addDirectoryTree(`${destNormalized}${relative}`);
        }
      }
      for (const [filePath, content] of Array.from(this.files.entries())) {
        if (filePath.startsWith(`${srcNormalized}/`)) {
          const relative = filePath.slice(srcNormalized.length);
          const copiedFilePath = `${destNormalized}${relative}`;
          this.addDirectoryTree(path.dirname(copiedFilePath));
          this.files.set(copiedFilePath, content);
        }
      }
      return;
    }

    throw new Error(`Path not found: ${src}`);
  });

  symlink = jest.fn(async (_target: string, dest: string): Promise<void> => {
    const normalizedDest = this.normalize(dest);
    this.files.delete(normalizedDest);
    this.addDirectoryTree(path.dirname(normalizedDest));
    this.files.set(normalizedDest, '');
  });

  readDir = jest.fn(async (target: string): Promise<string[]> => {
    const normalized = this.normalize(target);
    const entries = new Set<string>();
    const prefix = normalized.endsWith('/') ? normalized : `${normalized}/`;

    for (const dir of this.directories) {
      if (dir === normalized || !dir.startsWith(prefix)) {
        continue;
      }
      const relative = dir.slice(prefix.length);
      if (relative.length > 0) {
        entries.add(relative.split('/')[0]);
      }
    }

    for (const filePath of this.files.keys()) {
      if (!filePath.startsWith(prefix)) {
        continue;
      }
      const relative = filePath.slice(prefix.length);
      if (relative.length > 0) {
        entries.add(relative.split('/')[0]);
      }
    }

    if (!this.directories.has(normalized)) {
      throw new Error(`Directory not found: ${target}`);
    }

    return Array.from(entries);
  });

  private normalize(target: string): string {
    return target.replace(/\\/g, '/');
  }

  private addDirectoryTree(dir: string): void {
    const normalized = this.normalize(dir);
    if (!normalized || normalized === '/') {
      this.directories.add('/');
      return;
    }

    const segments = normalized.split('/').filter(Boolean);
    let current = normalized.startsWith('/') ? '/' : '';

    for (const segment of segments) {
      current = current === '/' ? `/${segment}` : current ? `${current}/${segment}` : segment;
      this.directories.add(current);
    }
  }
}

export function createMockedFileSystem(): MockedFileSystem {
  return new MockedFileSystem();
}
