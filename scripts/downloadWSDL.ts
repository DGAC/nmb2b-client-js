import { fromValues } from '../src/security.ts';
import { download } from '../src/utils/xsd/index.ts';
import { resolveB2BEnvironment } from '../tests/resolveB2BEnvironment.ts';

async function main() {
  const b2bEnv = resolveB2BEnvironment();

  await download({
    flavour: b2bEnv.B2B_FLAVOUR,
    XSD_PATH: b2bEnv.B2B_XSD_PATH,
    xsdEndpoint: b2bEnv.B2B_XSD_REMOTE_URL,
    security: fromValues(b2bEnv),
  });
}

main().catch(console.error);
