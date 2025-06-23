// if (process.env.CI && !process.env.REAL_B2B_CONNECTIONS) {
//   console.log('Running in CI context, disabling connections to NM B2B');
//   process.exit(0);
// }

import path from 'path';
import { downloadWSDL } from '../tests/setup_hook';
import { B2B_VERSION } from '../src/constants';
import { dirExists } from '../src/utils/fs';
import b2bOptions from '../tests/options';

const XSD_PATH = path.join(b2bOptions.XSD_PATH, B2B_VERSION);
console.log(`Looking for XSD files in ${XSD_PATH} ...`);

dirExists(XSD_PATH).then((exists) => {
  if (exists) {
    console.log(
      `B2B XSD for version ${B2B_VERSION} already exists, do not download`,
    );
    return;
  }

  if (process.env.CI && !process.env.REAL_B2B_CONNECTIONS) {
    console.log(`CI detected, no real B2B connection, disable XSD download`);
    return;
  }

  return downloadWSDL().then(console.log, console.error);
});
