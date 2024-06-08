import * as fs from 'fs/promises';
import d from './debug';
const debug = d('dir-exists');

export async function dirExists(
  path: string,
  { readable, writable }: { readable: boolean; writable?: boolean } = {
    readable: true,
    writable: false,
  },
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
