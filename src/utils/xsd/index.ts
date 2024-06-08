import fs from 'fs';
import path from 'path';
import lockfile from 'proper-lockfile';
import { promisify } from 'util';
import type { Config } from '../../config';
import { B2B_VERSION } from '../../constants';
import d from '../debug';
import { createDir, dirExists } from '../fs';
import { downloadFile } from './downloadFile';
import { requestFilename } from './filePath';
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
