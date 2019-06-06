import { getFileUrl, getEndpoint } from '../../config';
import { B2B_VERSION, B2BFlavour } from '../../constants';
import { Security } from '../../security';
import request from 'request';
import zlib from 'zlib';
import tar from 'tar';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import d from '../debug';
const debug = d('wsdl');
import lockfile from 'proper-lockfile';
import { dirExists, createDir } from '../fs';
import { Config } from '../../config';
import { requestFilename } from './filePath';
import { downloadFile } from './downloadFile';

const readdir = promisify(fs.readdir);

const getWSDLPath = ({ XSD_PATH }: Config) => path.join(XSD_PATH, B2B_VERSION);

async function WSDLExists(config: Config): Promise<boolean> {
  const directory = getWSDLPath(config);
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

  const release = await lockfile.lock(outputDir, {
    retries: 5,
  });

  const hasWSDL = await WSDLExists(config);

  if (hasWSDL) {
    debug('WSDL found');
    await release();
    return;
  }

  const fileName = await requestFilename(config);

  debug(`Downloading ${fileName}`);

  await downloadFile(fileName, config);
  await release();
}
