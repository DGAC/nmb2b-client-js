# Network Manager B2B Client

![License](https://img.shields.io/npm/l/@dgac/nmb2b-client.svg)
![NodeVersion](https://img.shields.io/node/v/@dgac/nmb2b-client.svg)
[![PackageVersion](https://img.shields.io/npm/v/@dgac/nmb2b-client.svg)](https://npmjs.com/package/@dgac/nmb2b-client)
![Downloads](https://img.shields.io/npm/dm/@dgac/nmb2b-client)
![Test](https://github.com/DGAC/nmb2b-client-js/workflows/Build,%20test,%20publish/badge.svg?branch=master)
[![codecov](https://codecov.io/gh/DGAC/nmb2b-client-js/branch/master/graph/badge.svg)](https://codecov.io/gh/DGAC/nmb2b-client-js)

A TypeScript client for the **EUROCONTROL Network Manager B2B** web services.
The library wraps the NM SOAP API and removes most of its pain points: it
downloads and caches the WSDL/XSD automatically, serializes/deserializes awkward
XSD types into idiomatic JavaScript values, reorders request keys to satisfy
SOAP ordering rules, and exposes a fully typed, promise-based API.

NM target version: **27.0.0** · Node `>=22` · ESM-only

## Documentation

Full guides live in [`docs/`](./docs/README.md). Start with the one that matches
what you are trying to do:

| If you are…                                      | Read this                                    |
| ------------------------------------------------ | -------------------------------------------- |
| **Consuming the library** in your app            | [API & Usage Guide](./docs/api-reference.md) |
| **Contributing / onboarding** to the repo        | [Getting Started](./docs/getting-started.md) |
| **Maintaining internals** / curious how it works | [Architecture](./docs/architecture.md)       |

A runnable example project: <https://github.com/DGAC/nmb2b-client-js-example>.

## 60-second example

```typescript
import { createB2BClient } from '@dgac/nmb2b-client';
import fs from 'node:fs';

const client = await createB2BClient({
  security: {
    pfx: fs.readFileSync('/path/to/cert.p12'),
    passphrase: 'your-passphrase',
  },
});

const res = await client.Airspace.queryCompleteAIXMDatasets();
console.log(res.data.datasetSummaries);
```

## Features

- **No WSDL/XSD dependency.** The schema is fetched from NM at startup and cached
  on disk, so the package stays small and always matches the targeted NM version.
- **Natural (de)serialization.** Pass JS `Date`s, get `Date`s back; durations
  become seconds; numeric strings become integers. See
  [API & Usage Guide → Natural (de)serialization](./docs/api-reference.md#natural-deserialization).
- **Request key reordering.** SOAP is order-sensitive; the library reorders
  request keys to match the WSDL schema, so key order in your code doesn't matter.
- **Fully typed.** Input typos are compile errors; response shapes are derived
  from each operation's query definition.
- **Typed errors.** A non-`OK` SOAP reply throws an `NMB2BError` carrying the NM
  status code and validation details.
- **Hooks.** User callbacks run around every query for logging, metrics, tracing.
- **Tree-shakeable subpath exports.** Besides the main entry, the package exposes
  `/security`, `/config`, `/types`, and `/utils`.

## Authentication

Provide **one** of three shapes via the `security` option — PFX certificate, PEM
certificate + key, or API-gateway credentials. See
[API & Usage Guide → Authentication](./docs/api-reference.md#authentication-security)
for the full details and env-based loading (`fromEnv()`).

```typescript
// PFX / PKCS#12
const security = {
  pfx: fs.readFileSync('/path/to/cert.p12'),
  passphrase: 'your-passphrase',
};

// PEM certificate + key
const security = {
  cert: fs.readFileSync('/path/to/cert.pem'),
  key: fs.readFileSync('/path/to/cert.key'),
  passphrase: 'your-passphrase', // optional if the key is not encrypted
};

// API-gateway credentials (requires endpoint + xsdEndpoint in config)
const security = {
  apiKeyId: process.env.B2B_API_KEY_ID!,
  apiSecretKey: process.env.B2B_API_SECRET_KEY!,
};
```

## Error handling

A non-`OK` reply is thrown as an `NMB2BError` with the NM `status`, `reason`, and
validation details. See
[API & Usage Guide → Error handling](./docs/api-reference.md#error-handling)
for the full field reference and status code list.

```typescript
import { NMB2BError } from '@dgac/nmb2b-client';

try {
  const res = await client.Airspace.queryCompleteAIXMDatasets();
} catch (err) {
  if (err instanceof NMB2BError) {
    console.error(err.status, err.reason);
  } else {
    throw err; // transport / unexpected error
  }
}
```

## Debug output

Tracing uses the [`debug`](https://npmjs.com/package/debug) package under the
`@dgac/nmb2b-client` namespace:

```bash
DEBUG='@dgac/nmb2b-client*' node your-app.js
```

[![asciicast](https://asciinema.org/a/xWovjkKlkqePBolRl3OqAFBi8.svg)](https://asciinema.org/a/xWovjkKlkqePBolRl3OqAFBi8)
