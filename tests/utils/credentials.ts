import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import type { Security } from '../../src/security.ts';
import {
  CREDENTIAL_FIXTURES,
  PEM_PASSPHRASE,
  PFX_PASSPHRASE,
} from '../fixtures/credentials/constants.ts';

/**
 * Throwaway credentials, one per security mode.
 *
 * Node parses client certificates before any request goes out, MSW or not:
 * the PFX and PEM credentials are a real self-signed certificate and key, read
 * from `tests/fixtures/credentials/`. The API Gateway keys are unique to each
 * call.
 */
export function createTestSecurities() {
  return {
    'API Gateway': {
      apiKeyId: `test-api-key-id-${randomUUID()}`,
      apiSecretKey: `test-api-secret-key-${randomUUID()}`,
    },
    PFX: { pfx: readFileSync(CREDENTIAL_FIXTURES.pfx), passphrase: PFX_PASSPHRASE },
    PEM: {
      cert: readFileSync(CREDENTIAL_FIXTURES.cert),
      key: readFileSync(CREDENTIAL_FIXTURES.key),
      passphrase: PEM_PASSPHRASE,
    },
  } satisfies Record<string, Security>;
}

/**
 * Walks `value` deeply (own properties, enumerable or not, symbol keys,
 * getters, prototypes, Map and Set entries, cycle-safe) and returns the
 * property paths through which a credential of `security` is reachable,
 * as a value or as a property key (shown as `<credential>`).
 *
 * A credential is matched as a raw string, as the Basic auth encoding of the
 * API key pair, or as the bytes of a certificate or key, in strings or buffers.
 * `secrets` are matched as raw strings too, e.g. a password put in a configured
 * URL.
 */
export function findCredentialPaths(
  value: unknown,
  security: Security,
  secrets: Array<string> = [],
): Array<string> {
  const needles = [...getNeedles(security), ...secrets.map((secret) => Buffer.from(secret))];
  const found: Array<string> = [];
  const visited = new WeakSet<object>();

  const contains = (haystack: Buffer) => needles.some((needle) => haystack.includes(needle));

  const walk = (current: unknown, path: string): void => {
    if (typeof current === 'string') {
      if (contains(Buffer.from(current))) {
        found.push(path);
      }
      return;
    }

    if ((typeof current !== 'object' && typeof current !== 'function') || current === null) {
      return;
    }

    if (visited.has(current)) {
      return;
    }
    visited.add(current);

    if (ArrayBuffer.isView(current)) {
      if (contains(Buffer.from(current.buffer, current.byteOffset, current.byteLength))) {
        found.push(path);
      }
      return;
    }

    if (current instanceof ArrayBuffer) {
      if (contains(Buffer.from(current))) {
        found.push(path);
      }
      return;
    }

    if (current instanceof Map) {
      for (const [key, entry] of current) {
        walk(key, `${path}.<map key>`);
        walk(entry, `${path}.<map value>`);
      }
    }

    if (current instanceof Set) {
      for (const entry of current) {
        walk(entry, `${path}.<set entry>`);
      }
    }

    // Getters are read through `current`, wherever they sit on the prototype
    // chain; data values on a prototype are walked with the prototype itself.
    for (let owner: object | null = current; owner; owner = Object.getPrototypeOf(owner)) {
      for (const key of Reflect.ownKeys(owner)) {
        // A credential can sit in a key too (an HTTPS agent's socket pool).
        const keyLeaks = typeof key === 'string' && contains(Buffer.from(key));
        const childPath = `${path}.${keyLeaks ? '<credential>' : String(key)}`;
        if (keyLeaks) {
          found.push(childPath);
        }

        const descriptor = Object.getOwnPropertyDescriptor(owner, key);

        if (descriptor && 'value' in descriptor) {
          if (owner === current) {
            walk(descriptor.value, childPath);
          }
        } else if (descriptor?.get) {
          try {
            walk(descriptor.get.call(current), childPath);
          } catch {
            // A getter that throws exposes nothing.
          }
        }
      }
    }

    walk(Object.getPrototypeOf(current), `${path}.<prototype>`);
  };

  walk(value, '<root>');

  return found;
}

function getNeedles(security: Security): Array<Buffer> {
  const strings: Array<string> = [];
  const buffers: Array<Buffer> = [];

  if ('apiKeyId' in security) {
    strings.push(
      security.apiSecretKey,
      Buffer.from(`${security.apiKeyId}:${security.apiSecretKey}`).toString('base64'),
    );
  } else if ('pfx' in security) {
    strings.push(security.passphrase);
    buffers.push(security.pfx);
  } else {
    if (security.passphrase) {
      strings.push(security.passphrase);
    }
    buffers.push(security.cert, security.key);
  }

  return [
    ...strings.map((s) => Buffer.from(s)),
    ...buffers.flatMap((b) => [b, Buffer.from(b.toString('base64'))]),
  ];
}
