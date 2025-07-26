# Network Manager B2B Client

![License](https://img.shields.io/npm/l/@dgac/nmb2b-client.svg)
![NodeVersion](https://img.shields.io/node/v/@dgac/nmb2b-client.svg)
[![PackageVersion](https://img.shields.io/npm/v/@dgac/nmb2b-client.svg)](https://npmjs.com/package/@dgac/nmb2b-client)
![Downloads](https://img.shields.io/npm/dm/@dgac/nmb2b-client)
![Test](https://github.com/DGAC/nmb2b-client-js/workflows/Build,%20test,%20publish/badge.svg?branch=master)
[![codecov](https://codecov.io/gh/DGAC/nmb2b-client-js/branch/master/graph/badge.svg)](https://codecov.io/gh/DGAC/nmb2b-client-js)

Exposes a general purpose Javascript library to interact with NM B2B web services. The idea is to abstract pain points while offering an API that maps the NM B2B WS API.

NM target version: **27.0.0**

## Simple usage example

https://github.com/DGAC/nmb2b-client-js-example

# Features

- No WSDL/XSD dependency. The library will download and cache those on start up.
- Natural serialization/deserialization of certain types.

For instance, the Flow.retrieveOTMVPlan query expects a `day` attribute with the XSD type `DateYearMonthDay`. This type is a string, representing a date in the `YYYY-MM-DD` format. This library allows you to pass a traditional JS Date object instead.

```typescript
const res = await Flow.retrieveOTMVPlan({
  dataset: { type: 'OPERATIONAL' },
  day: new Date(),
  otmvsWithDuration: { item: [{ trafficVolume: 'LFERMS' }] },
});
```

- Request object key reordering when needed.

In SOAP, key order matters.

```typescript
// OK
await Flow.retrieveOTMVPlan({
  dataset: { type: 'OPERATIONAL' },
  day: moment.utc().toDate(),
  otmvsWithDuration: { item: [{ trafficVolume: 'LFERMS' }] },
});

// Would normally fail
await const Flow.retrieveOTMVPlan({
  day: moment.utc().toDate(),
  dataset: { type: 'OPERATIONAL' },
  otmvsWithDuration: { item: [{ trafficVolume: 'LFERMS' }] },
});
```

The library reorder request object keys to match what's expressed in the XSD/WSDL. Therefore, the second example works fine.

- TypeScript support.

The following example will raise a type error.

```typescript
// Raises a type error
await Flow.retrieveOTMVPlan({
  dataset: { type: 'OPERATIONNAL' }, // Notice the typo
  day: moment.utc().toDate(),
  otmvsWithDuration: { item: [{ trafficVolume: 'LFERMS' }] },
});
```

- Debug output

Debug output is controlled via the [`debug`](https://npmjs.com/package/debug) package. All debug output from this library is scoped under `@dgac/nmb2b-client` namespace.

Just set a `DEBUG=@dgac/nmb2b-client*` environment variable :
[![asciicast](https://asciinema.org/a/xWovjkKlkqePBolRl3OqAFBi8.svg)](https://asciinema.org/a/xWovjkKlkqePBolRl3OqAFBi8)

# Usage

## Main service

```typescript
import { createB2BClient } from '@dgac/nmb2b-client';

// See below for more information about the security argument
const client = await createB2BClient({ security });

const res = await client.Airspace.queryCompleteAIXMDatasets();
```

## Per domain service

```typescript
import { createAirspaceClient } from '@dgac/nmb2b-client';

// See below for more information about the security argument
const Airspace = await createAirspaceClient({ security });

const res = await Airspace.queryCompleteAIXMDatasets();
```

## Error handling

```typescript
import { createAirspaceClient, NMB2BError } from '@dgac/nmb2b-client';

try {
  const Airspace = await createAirspaceClient({ security });

  const res = await Airspace.queryCompleteAIXMDatasets();
} catch (err) {
  if (err instanceof NMB2BError) {
    if (err.status === 'OBJECT_NOT_FOUND') {
      // ...
    }
  }

  // ...
}
```

## B2B Security

Every request to the NM B2B web services must be authenticated using a client certificate. This library needs to be initialized with a `security` object, containing the certificate, key and passphrase associated.

### With P12 certificate

```javascript
import fs from 'fs';

const security = {
  pfx: fs.readFileSync('/path/to/cert.p12'),
  passphrase: 'your-passphrase',
};

createB2BClient({ security }).then((client) => {
  client.Airspace.queryCompleteAIXMDatasets().then(() => {});
});
```

### With PEM certificate

```javascript
import fs from 'fs';

const security = {
  pem: fs.readFileSync('/path/to/cert.pem'),
  key: fs.readFileSync('/path/to/cert.key'),
  passphrase: 'your-passphrase',
};

createB2BClient({ security }).then((client) => {
  client.Airspace.queryCompleteAIXMDatasets().then(() => {});
});
```
