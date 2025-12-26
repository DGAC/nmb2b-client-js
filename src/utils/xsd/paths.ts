import path from 'node:path';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createHash } from 'node:crypto';
import type { Config } from '../../config.js';
import { B2B_VERSION, type B2BFlavour } from '../../constants.js';

// function getEndpointHash(endpoint: string): string {
//   return createHash('sha256').update(endpoint).digest('hex').slice(0, 8);
// }

export function getXSDCacheDirectory(
  config: Pick<Config, 'XSD_PATH' | 'xsdEndpoint'>,
): string {
  // if (config.xsdEndpoint) {
  //   const hash = getEndpointHash(config.xsdEndpoint);
  //   return path.join(config.XSD_PATH, `${B2B_VERSION}-${hash}`);
  // }

  return path.join(config.XSD_PATH, B2B_VERSION);
}

export function getServiceWSDLFilePath({
  service,
  flavour,
  XSD_PATH,
  xsdEndpoint,
}: {
  service: string;
  flavour: B2BFlavour;
  XSD_PATH: string;
  xsdEndpoint?: string;
}): string {
  const directory = getXSDCacheDirectory({ XSD_PATH, xsdEndpoint });
  return path.join(directory, `${service}_${flavour}_${B2B_VERSION}.wsdl`);
}
