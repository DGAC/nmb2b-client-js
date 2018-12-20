import fs, { Stats } from 'fs';
import mkdirpCb from 'mkdirp';
import { promisify } from 'util';
const stat = promisify(fs.stat);
const access = promisify(fs.access);
const mkdirp = promisify(mkdirpCb);

export async function dirExists(
  path: string,
  { readable, writable }: { readable: boolean; writable?: boolean } = {
    readable: true,
    writable: false,
  },
): Promise<boolean> {
  try {
    const stats: Stats = await stat(path);
    if (!stats.isDirectory()) {
      // Directory does not exists
      return false;
    }

    // Check that the directory is writable and readable
    await access(
      path,
      (writable ? fs.constants.W_OK : 0) | (readable ? fs.constants.R_OK : 0),
    );

    return true;
  } catch (err) {
    return false;
  }
}

export async function createDir(path: string): Promise<void> {
  await mkdirp(path);
}
