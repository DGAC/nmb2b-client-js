import 'dotenv/config';
import { B2B_VERSION } from '../src/constants.js';
import { requestFilename } from '../src/utils/xsd/filePath.js';
import { downloadFile } from '../src/utils/xsd/downloadFile.js';
import path from 'path';
import { createDir, dirExists } from '../src/utils/fs.js';
import b2bOptions from './options.js';

export async function downloadWSDL() {
  console.log('Global setup !');

  const { flavour, security, XSD_PATH, xsdEndpoint } = b2bOptions;

  if (
    !(await dirExists(XSD_PATH)) ||
    !(await dirExists(path.join(XSD_PATH, B2B_VERSION)))
  ) {
    console.log('XSD files not found, downloading from B2B ...');
    await createDir(XSD_PATH);
    const filename = await requestFilename({ flavour, security, xsdEndpoint });

    console.log(`Got XSD filename from B2B, downloading ${filename}`);

    await downloadFile(filename, {
      flavour,
      security,
      XSD_PATH,
      xsdEndpoint,
    });
  }
}
