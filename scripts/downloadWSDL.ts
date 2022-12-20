// if (process.env.CI && !process.env.REAL_B2B_CONNECTIONS) {
//   console.log('Running in CI context, disabling connections to NM B2B');
//   process.exit(0);
// }

import path from 'path';
import { downloadWSDL } from '../tests/setup_hook';
import { B2B_VERSION } from '../src/constants';
import { dirExists } from '../src/utils/fs';
import b2bOptions from '../tests/options';

dirExists(path.join(b2bOptions.XSD_PATH, B2B_VERSION)).then((exists) => {
  if (exists) {
    console.log(
      `B2B XSD for version ${B2B_VERSION} already exists, do not download`,
    );
    return;
  }

  return downloadWSDL().then(console.log, console.error);
});
