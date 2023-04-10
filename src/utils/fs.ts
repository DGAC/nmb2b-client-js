import fs, { type Stats } from 'fs';
import { mkdirp } from 'mkdirp';
import { promisify } from 'util';
import d from './debug';
const debug = d('dir-exists');
const stat = promisify(fs.stat);
const access = promisify(fs.access);

export async function dirExists(
  path: string,
  { readable, writable }: { readable: boolean; writable?: boolean } = {
    readable: true,
    writable: false,
  },
): Promise<boolean> {
  debug(
    'Testing if directory %s is readable %s...',
    path,
    writable ? 'and writable ' : '',
  );

  try {
    const stats: Stats = await stat(path);
    if (!stats.isDirectory()) {
      // Directory does not exists
      return false;
    }

    // Check that the directory is writable and readable
    await access(
      path,
      // tslint:disable-next-line no-bitwise
      (writable ? fs.constants.W_OK : 0) | (readable ? fs.constants.R_OK : 0),
    );

    debug('Directory %s is accessible');

    return true;
  } catch (err) {
    return false;
  }
}

export async function createDir(path: string): Promise<void> {
  debug('Creating directory %s ...', path);
  await mkdirp(path);
}
