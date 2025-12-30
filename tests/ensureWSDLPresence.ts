import { WSDLExists } from '../src/utils/xsd/index.js';
import { resolveB2BEnvironment } from './resolveB2BEnvironment.js';

export async function setup() {
  const env = resolveB2BEnvironment();

  const exists = await WSDLExists({
    XSD_PATH: env.B2B_XSD_PATH,
    xsdEndpoint: env.B2B_XSD_REMOTE_URL,
  });

  if (!exists) {
    throw new Error(
      `\n[B2B-CLIENT] CRITICAL ERROR: WSDL/XSD files are missing in:\n` +
        `              ${env.B2B_XSD_PATH}\n\n` +
        `Initialization of SOAP clients will fail. Tests aborted.\n` +
        `Please run 'pnpm downloadWSDL' before launching tests.\n`,
    );
  }
}
