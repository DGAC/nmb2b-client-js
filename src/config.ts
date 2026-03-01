import type { Security } from './security.js';
import { assertValidSecurity } from './security.js';
import type { B2BFlavour } from './constants.js';
import { B2B_VERSION, B2BFlavours } from './constants.js';
import { assert } from './utils/assert.js';
import type { SoapQueryHook } from './utils/hooks/hooks.js';

export interface Config {
  /**
   * The endpoint used to perform B2B queries.
   *
   * If not specified, uses the public NM B2B endpoints.
   */
  endpoint?: string;

  /**
   * Where to fetch the WSDL/XSD files.
   *
   * If not specified, uses the public NM B2B endpoints.
   */
  xsdEndpoint?: string;

  /**
   * If true, will redownload the WSDL/XSD files.
   */
  ignoreWSDLCache?: boolean;

  /**
   * The security configuration.
   *
   */
  security: Security;

  /**
   * Either 'OPS' or 'PREOPS'
   */
  flavour: B2BFlavour;

  /**
   * Where the WSDL/XSD files should be stored on the disk.
   */
  XSD_PATH: string;

  /**
   * Soap query hooks.
   *
   * @see {@link SoapQueryHook}
   */
  hooks: Array<SoapQueryHook>;
}

/**
 * @deprecated Use {@link assertValidConfig} instead.
 */
export function isConfigValid(args: unknown): args is Config {
  assertValidConfig(args);
  return true;
}

/**
 * Type guard to validate a {@link Config} object.
 * Checks for required fields and validity of nested objects like {@link Security}.
 *
 * @param args - The config object to validate.
 */
export function assertValidConfig(args: unknown): asserts args is Config {
  assert(!!args && typeof args === 'object', 'Invalid config');

  assert(
    'security' in args && typeof args.security === 'object' && !!args.security,
    'Please provide a valid security option',
  );

  assertValidSecurity(args.security);

  assert(
    'flavour' in args &&
      typeof args.flavour === 'string' &&
      // oxlint-disable-next-line no-unsafe-type-assertion
      B2BFlavours.includes(args.flavour as B2BFlavour),
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
}

const B2B_ROOTS = {
  OPS: 'https://www.b2b.nm.eurocontrol.int',
  PREOPS: 'https://www.b2b.preops.nm.eurocontrol.int',
};

/**
 * Constructs the full URL for the B2B SOAP Gateway (Specification Endpoint).
 *
 * The URL is built using the correct context (`B2B_OPS` or `B2B_PREOPS`) and version.
 *
 * @param config - Configuration object.
 * @param config.endpoint - Optional base URL override.
 * @param config.flavour - Target environment ('OPS' or 'PREOPS').
 * @returns The full SOAP Gateway URL (e.g. `https://www.b2b.nm.eurocontrol.int/B2B_OPS/gateway/spec/27.0.0`).
 */
export function getSoapEndpoint(
  config: { endpoint?: string; flavour?: B2BFlavour } = {},
): string {
  const { endpoint, flavour } = config;
  const isPreops = flavour === 'PREOPS';

  const root = endpoint ?? (isPreops ? B2B_ROOTS.PREOPS : B2B_ROOTS.OPS);
  const context = isPreops ? 'B2B_PREOPS' : 'B2B_OPS';

  // Ensure we don't have double slashes when concatenating the path
  const normalizedRoot = root.replace(/\/$/, '');

  return `${normalizedRoot}/${context}/gateway/spec/${B2B_VERSION}`;
}

/**
 * @deprecated Use {@link getSoapEndpoint} instead.
 */
export function getEndpoint(
  config: { endpoint?: string; flavour?: B2BFlavour } = {},
): string {
  return getSoapEndpoint(config);
}

/**
 * @internal
 * @deprecated Use {@link getFileUrl} instead.
 */
export function getFileEndpoint(
  config: { endpoint?: string; flavour?: B2BFlavour } = {},
): string {
  const { endpoint, flavour } = config;

  if (flavour && flavour === 'PREOPS') {
    return `${endpoint ?? B2B_ROOTS.PREOPS}/FILE_PREOPS/gateway/spec`;
  }

  return `${endpoint ?? B2B_ROOTS.OPS}/FILE_OPS/gateway/spec`;
}

/**
 * Constructs the absolute URL to download a specific file from the B2B Gateway.
 * Handles different environments (OPS/PREOPS) and custom endpoints.
 *
 * @param path - The relative file path (usually returned by a SOAP response).
 * @param config - Configuration object.
 * @returns The complete, absolute URL to the file.
 */
export function getFileUrl(
  path: string,
  config: { flavour?: B2BFlavour; endpoint?: string } = {},
): string {
  assert(
    config.endpoint === undefined,
    'File download URL is not supported when config.endpoint is overriden',
  );

  const baseUrl =
    config.flavour === 'PREOPS'
      ? `${B2B_ROOTS.PREOPS}/FILE_PREOPS/gateway/spec`
      : `${B2B_ROOTS.OPS}/FILE_OPS/gateway/spec`;

  return baseUrl + (path[0] && path.startsWith('/') ? '' : '/') + path;
}

/**
 * Creates a safe copy of the configuration object for logging purposes.
 * Masks all sensitive security credentials (passwords, keys, secrets) with 'xxxxxxxxxxxxxxxx'.
 *
 * @param config - The configuration object to obfuscate.
 * @returns A new configuration object with sensitive data masked.
 */
export function obfuscate(config: Config) {
  return {
    ...config,
    security: Object.fromEntries(
      Object.entries(config.security).map(([key]) => [key, 'xxxxxxxxxxxxxxxx']),
    ),
  };
}
