import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

/**
 * Creates an empty temporary directory, removed when disposed.
 */
export async function createTempDirectory(prefix: string) {
  const directory = await mkdtemp(path.join(os.tmpdir(), prefix));

  return {
    path: directory,
    [Symbol.asyncDispose]: () => rm(directory, { recursive: true, force: true }),
  };
}
