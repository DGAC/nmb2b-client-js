if (process.env.CI && !process.env.REAL_B2B_CONNECTIONS) {
  console.log('Running in CI context, disabling connections to NM B2B');
  process.exit(0);
}

const path = require('path');
const downloadWSDL = require('../tests/setup_hook');
const { B2B_VERSION } = require('../dist/constants');
const { dirExists } = require('../dist/utils/fs');
const b2bOptions = require('../tests/options');

dirExists(path.join(b2bOptions.XSD_PATH, B2B_VERSION)).then(exists => {
  if (exists) {
    console.log(
      `B2B XSD for version ${B2B_VERSION} already exists, do not download`,
    );
    return;
  }

  return downloadWSDL().then(console.log, console.error);
});
