import type { Security } from './security';
import { isValidSecurity } from './security';
import type { B2BFlavour } from './constants';
import { B2B_VERSION, B2BFlavours } from './constants';
import invariant from 'invariant';
import { URL } from 'url';
import type { Client as SoapClient } from 'soap';

export interface Config {
  endpoint?: string;
  xsdEndpoint?: string;
  ignoreWSDLCache?: boolean;
  security: Security;
  flavour: B2BFlavour;
  XSD_PATH: string;
  soapClient?: null | SoapClient;
}

export function isConfigValid(args: unknown): args is Config {
  invariant(!!args && typeof args === 'object', 'Invalid config');

  invariant(
    'security' in args && isValidSecurity(args.security),
    'Please provide a valid security option',
  );

  invariant(
    'flavour' in args && typeof args.flavour === 'string',
    `Invalid config.flavour. Supported flavours: ${B2BFlavours.join(', ')}`,
  );

  invariant(
    B2BFlavours.includes(args.flavour),
    `Invalid config.flavour. Supported flavours: ${B2BFlavours.join(', ')}`,
  );

  if ('apiKeyId' in args.security) {
    invariant(
      'endpoint' in args && !!args.endpoint,
      `When using an config.security.apiKeyId, config.endpoint must be defined`,
    );

    invariant(
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
