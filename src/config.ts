import type { Security } from './security.js';
import { isValidSecurity } from './security.js';
import type { B2BFlavour } from './constants.js';
import { B2B_VERSION, B2BFlavours } from './constants.js';
import { assert } from './utils/assert.js';
import { URL } from 'url';

export interface Config {
  endpoint?: string;
  xsdEndpoint?: string;
  ignoreWSDLCache?: boolean;
  security: Security;
  flavour: B2BFlavour;
  XSD_PATH: string;
}

export function isConfigValid(args: unknown): args is Config {
  assert(!!args && typeof args === 'object', 'Invalid config');

  assert(
    'security' in args && isValidSecurity(args.security),
    'Please provide a valid security option',
  );

  assert(
    'flavour' in args && typeof args.flavour === 'string',
    `Invalid config.flavour. Supported flavours: ${B2BFlavours.join(', ')}`,
  );

  assert(
    B2BFlavours.includes(args.flavour),
    `Invalid config.flavour. Supported flavours: ${B2BFlavours.join(', ')}`,
  );

  if ('apiKeyId' in args.security) {
    assert(
      'endpoint' in args && !!args.endpoint,
      `When using an config.security.apiKeyId, config.endpoint must be defined`,
    );

    assert(
      'xsdEndpoint' in args && !!args.xsdEndpoint,
      `When using an config.security.apiKeyId, config.xsdEndpoint must be defined`,
    );
  }

  return true;
}

const B2B_ROOTS = {
  OPS: 'https://www.b2b.nm.eurocontrol.int',
  PREOPS: 'https://www.b2b.preops.nm.eurocontrol.int',
};

export function getEndpoint(
  config: { endpoint?: string; flavour?: B2BFlavour } = {},
): string {
  const { endpoint, flavour } = config;

  if (flavour && flavour === 'PREOPS') {
    return `${
      endpoint ?? B2B_ROOTS.PREOPS
    }/B2B_PREOPS/gateway/spec/${B2B_VERSION}`;
  }

  return `${endpoint ?? B2B_ROOTS.OPS}/B2B_OPS/gateway/spec/${B2B_VERSION}`;
}

export function getFileEndpoint(
  config: { endpoint?: string; flavour?: B2BFlavour } = {},
): string {
  const { endpoint, flavour } = config;

  if (flavour && flavour === 'PREOPS') {
    return `${endpoint ?? B2B_ROOTS.PREOPS}/FILE_PREOPS/gateway/spec`;
  }

  return `${endpoint ?? B2B_ROOTS.OPS}/FILE_OPS/gateway/spec`;
}

export function getFileUrl(
  path: string,
  config: { flavour?: B2BFlavour; endpoint?: string } = {},
): string {
  if (config.endpoint) {
    return new URL(
      (path[0] && path.startsWith('/') ? '' : '/') + path,
      config.endpoint,
    ).toString();
  }

  return (
    getFileEndpoint(config) +
    (path[0] && path.startsWith('/') ? '' : '/') +
    path
  );
}

export function obfuscate(config: Config) {
  return {
    ...config,
    security: Object.keys(config.security).reduce((prev, curr) => {
      return {
        ...prev,
        [curr]: 'xxxxxxxxxxxxxxxx',
      };
    }, {}),
  };
}
