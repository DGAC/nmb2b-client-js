import type { Security } from '../../security.js';
import https from 'node:https';

export function createAxiosConfig({ security }: { security?: Security }) {
  if (!!security && 'apiKeyId' in security) {
    return {
      auth: {
        username: security.apiKeyId,
        password: security.apiSecretKey,
      },
    };
  }

  const httpsAgent = new https.Agent(security);

  return { httpsAgent };
}
