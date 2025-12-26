import 'dotenv/config';
import { createDir } from '../src/utils/fs.js';
import { downloadAndExtractWSDL } from '../src/utils/xsd/downloadAndExtractWSDL.js';
import { getWSDLDownloadURL } from '../src/utils/xsd/getWSDLDownloadURL.js';
import { WSDLExists } from '../src/utils/xsd/index.js';
import { getXSDCacheDirectory } from '../src/utils/xsd/paths.js';
import b2bOptions from './options.js';

export async function downloadWSDL() {
  const outputDir = getXSDCacheDirectory(b2bOptions);

  if (await WSDLExists(b2bOptions)) {
    console.log(`XSD files already exist: ${outputDir}`);
    return;
  }

  console.log(
    `XSD files not found, creating output directory ${outputDir} ...`,
  );

  await createDir(outputDir);
  console.log('Getting XSD archive URL from B2B ...');
  const url = await getWSDLDownloadURL(b2bOptions);

  console.log(`Got XSD filename from B2B, downloading ${url} ...`);

  await downloadAndExtractWSDL(url, {
    security: b2bOptions.security,
    outputDir,
  });

  console.log('Done !');
}
