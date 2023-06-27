import 'dotenv/config';
import { Security, isValidSecurity } from './security';
import { B2B_VERSION, B2BFlavours, B2BFlavour } from './constants';
import invariant from 'invariant';
import { URL } from 'url';

export interface Config {
  endpoint?: string;
  xsdEndpoint?: string;
  ignoreWSDLCache?: boolean;
  security: Security;
  flavour: B2BFlavour;
  XSD_PATH: string;
  soapClient?: null | unknown;
}

export function isConfigValid(args: Config): args is Config {
  invariant(
    args.security && isValidSecurity(args.security),
    'Please provide a valid security option',
  );

  invariant(
    args.flavour && B2BFlavours.includes(args.flavour),
    `${args.flavour} is not a supported B2B flavour\n` +
      `Supported flavours: ${B2BFlavours.join(', ')}`,
  );

  invariant(
    !('apiKeyId' in args.security) ? true : !!args.endpoint,
    `When using an config.security.apiKeyId, config.endpoint must be defined`,
  );

  invariant(
    !('apiKeyId' in args.security) ? true : !!args.xsdEndpoint,
    `When using an config.security.apiKeyId, config.xsdEndpoint must be defined`,
  );

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
      endpoint || B2B_ROOTS.PREOPS
    }/B2B_PREOPS/gateway/spec/${B2B_VERSION}`;
  }

  return `${endpoint || B2B_ROOTS.OPS}/B2B_OPS/gateway/spec/${B2B_VERSION}`;
}

export function getFileEndpoint(
  config: { endpoint?: string; flavour?: B2BFlavour } = {},
): string {
  const { endpoint, flavour } = config;

  if (flavour && flavour === 'PREOPS') {
    return `${endpoint || B2B_ROOTS.PREOPS}/FILE_PREOPS/gateway/spec`;
  }

  return `${endpoint || B2B_ROOTS.OPS}/FILE_OPS/gateway/spec`;
}

export function getFileUrl(
  path: string,
  config: { flavour?: B2BFlavour; endpoint?: string } = {},
): string {
  if (!!config.endpoint) {
    return new URL(
      (path && path[0] && path[0] === '/' ? '' : '/') + path,
      config.endpoint,
    ).toString();
  }

  return (
    getFileEndpoint(config) +
    (path && path[0] && path[0] === '/' ? '' : '/') +
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
