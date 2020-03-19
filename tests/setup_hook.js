const dotenv = require('dotenv');
dotenv.config();
const { B2B_VERSION } = require('../dist/constants');
const { requestFilename } = require('../dist/utils/xsd/filePath');
const { downloadFile } = require('../dist/utils/xsd/downloadFile');
const path = require('path');
const { createDir, dirExists } = require('../dist/utils/fs');

const b2bOptions = require('./options');

module.exports = async function() {
  console.log('Global setup !');

  const { flavour, security, XSD_PATH, xsdEndpoint } = b2bOptions;

  if (
    !(await dirExists(XSD_PATH)) ||
    !(await dirExists(path.join(XSD_PATH, B2B_VERSION)))
  ) {
    console.log('XSD files not found, downloading from B2B ...');
    await createDir(XSD_PATH);
    await requestFilename({ flavour, security, xsdEndpoint })
      .then(fileName => {
        console.log(`Downloading ${fileName}`);
        return fileName;
      })
      .then(fileName =>
        downloadFile(fileName, {
          flavour,
          security,
          XSD_PATH,
          xsdEndpoint,
        }),
      );
  }
};
