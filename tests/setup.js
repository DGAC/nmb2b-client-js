
import dotenv from 'dotenv';
dotenv.config();
import { fromEnv } from '../src/security';
import { B2B_VERSION } from '../src/constants';
import { requestFilename } from '../src/utils/xsd/filePath';
import { downloadFile } from '../src/utils/xsd/downloadFile';

export default (async function() {
  console.log('Global setup !');
});
