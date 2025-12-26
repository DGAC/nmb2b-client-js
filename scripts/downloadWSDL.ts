import { downloadWSDL } from '../tests/setup_hook.ts';

async function main() {
  if (process.env.CI && !process.env.REAL_B2B_CONNECTIONS) {
    console.log(`CI detected, no real B2B connection, disable XSD download`);
    return;
  }

  await downloadWSDL();
}

await main();
