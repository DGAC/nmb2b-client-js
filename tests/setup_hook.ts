import 'dotenv/config';
import { B2B_VERSION } from '../src/constants';
import { requestFilename } from '../src/utils/xsd/filePath';
import { downloadFile } from '../src/utils/xsd/downloadFile';
import path from 'path';
import { createDir, dirExists } from '../src/utils/fs';
import b2bOptions from './options';

export async function downloadWSDL() {
  console.log('Global setup !');

  const { flavour, security, XSD_PATH, xsdEndpoint } = b2bOptions;

  if (
    !(await dirExists(XSD_PATH)) ||
    !(await dirExists(path.join(XSD_PATH, B2B_VERSION)))
  ) {
    console.log('XSD files not found, downloading from B2B ...');
    await createDir(XSD_PATH);
    await requestFilename({ flavour, security, xsdEndpoint })
      .then((fileName) => {
        console.log(`Downloading ${fileName}`);
        return fileName;
      })
      .then((fileName) =>
        downloadFile(fileName, {
          flavour,
          security,
          XSD_PATH,
          xsdEndpoint,
        }),
      );
  }
}
