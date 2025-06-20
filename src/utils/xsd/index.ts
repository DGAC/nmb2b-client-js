import fs from 'node:fs';
import path from 'node:path';
import lockfile from 'proper-lockfile';
import { promisify } from 'node:util';
import type { Config } from '../../config.js';
import { B2B_VERSION } from '../../constants.js';
import d from '../debug.js';
import { createDir, dirExists } from '../fs.js';
import { downloadFile } from './downloadFile.js';
import { requestFilename } from './filePath.js';
const debug = d('wsdl');

const readdir = promisify(fs.readdir);

const getWSDLPath = ({ XSD_PATH }: Config) => path.join(XSD_PATH, B2B_VERSION);

async function WSDLExists(config: Config): Promise<boolean> {
  const directory = getWSDLPath(config);

  debug(`Checking if directory ${directory} exists`);

  if (!(await dirExists(directory))) {
    return false;
  }

  const files = await readdir(directory);
  return files.length > 0;
}

export async function download(config: Config): Promise<void> {
  const outputDir = getWSDLPath(config);

  if (!(await dirExists(outputDir))) {
    debug(`Creating directory ${outputDir}`);
    await createDir(outputDir);
  }

  debug(`Acquiring lock for folder ${outputDir}`);
  const release = await lockfile.lock(outputDir, {
    retries: 5,
  });

  debug(`Lock acquired. Testing WSDL existence ...`);

  const hasWSDL = await WSDLExists(config);

  if (!config.ignoreWSDLCache && hasWSDL) {
    debug('WSDL found');
    await release();
    return;
  }

  const fileName = await requestFilename(config);

  debug(`Downloading ${fileName}`);

  await downloadFile(fileName, config);
  await release();
}
