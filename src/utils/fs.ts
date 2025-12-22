import * as fs from 'node:fs/promises';
import { createDebugLogger } from './debug.js';
const debug = createDebugLogger('dir-exists');

export async function dirExists(
  path: string,
  {
    readable = true,
    writable = false,
  }: { readable?: boolean; writable?: boolean } = {},
): Promise<boolean> {
  debug(
    `Testing if directory ${path} is readable ${writable ? 'and writable ' : ''}...`,
  );

  try {
    const stats = await fs.stat(path);
    if (!stats.isDirectory()) {
      // Directory does not exists
      return false;
    }

    // Check that the directory is writable and readable
    await fs.access(
      path,
      (writable ? fs.constants.W_OK : 0) | (readable ? fs.constants.R_OK : 0),
    );

    debug(`Directory ${path} is accessible`);

    return true;
  } catch {
    return false;
  }
}

export async function createDir(path: string): Promise<void> {
  debug('Creating directory %s ...', path);
  await fs.mkdir(path, { recursive: true });
}
