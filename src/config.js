/* @flow */
import type { Security } from './security';
import type { B2BFlavour } from './constants';
import { isValidSecurity } from './security';
import { B2B_VERSION, B2BFlavours } from './constants';
import invariant from 'invariant';
import fs from 'fs';

export type Config = {
  security: Security,
  flavour: B2BFlavour,
  XSD_PATH: string,
};

export function isConfigValid(args: Config): boolean {
  invariant(
    args.security && isValidSecurity(args.security),
    'Please provide a valid security option',
  );

  invariant(
    args.flavour && B2BFlavours.includes(args.flavour),
    `${args.flavour} is not a supported B2B flavour\n` +
      `Supported flavours: ${B2BFlavours.join(', ')}`,
  );

  return true;
}

export function getEndpoint(config: { +flavour?: B2BFlavour } = {}): string {
  const { flavour } = config;

  if (flavour && flavour === 'PREOPS') {
    return `https://www.b2b.preops.nm.eurocontrol.int/B2B_PREOPS/gateway/spec/${B2B_VERSION}`;
  }

  return `https://www.b2b.nm.eurocontrol.int/B2B_OPS/gateway/spec/${B2B_VERSION}`;
}

export function getFileEndpoint(
  config: { +flavour?: B2BFlavour } = {},
): string {
  const { flavour } = config;

  if (flavour && flavour === 'PREOPS') {
    return `https://www.b2b.preops.nm.eurocontrol.int/FILE_PREOPS/gateway/spec`;
  }

  return `https://www.b2b.nm.eurocontrol.int/FILE_OPS/gateway/spec`;
}

export function getFileUrl(
  path: string,
  config: { +flavour?: B2BFlavour } = {},
): string {
  return (
    getFileEndpoint(config) +
    (path && path[0] && path[0] === '/' ? '' : '/') +
    path
  );
}
