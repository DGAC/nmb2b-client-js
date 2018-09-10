# Network Manager B2B Client

[![CircleCI](https://circleci.com/gh/DGAC/nmb2b-client-js/tree/master.svg?style=svg)](https://circleci.com/gh/DGAC/nmb2b-client-js/tree/master)
[![codecov](https://codecov.io/gh/DGAC/nmb2b-client-js/branch/master/graph/badge.svg)](https://codecov.io/gh/DGAC/nmb2b-client-js) [![Greenkeeper badge](https://badges.greenkeeper.io/DGAC/nmb2b-client-js.svg)](https://greenkeeper.io/)

Exposes a general purpose Javascript library to interact with NM B2B web services. The idea is to abstract pain points while offering an API that maps the NM B2B WS API.

NM target version: **22.0.0**

## Simple usage example

https://github.com/DGAC/nmb2b-client-js-example

# Features

- No WSDL/XSD dependency. The library will download and cache those on start up.
- Natural serialization/deserialization of certain types.

For instance, the Flow.retrieveOTMVPlan query expects a `day` attribute with the XSD type `DateYearMonthDay`. This type is a string, representing a date in the `YYYY-MM-DD` format. This library allows you to pass a traditional JS Date object instead.

```javascript
Flow.retrieveOTMVPlan({
  dataset: { type: 'OPERATIONAL' },
  day: moment.utc().toDate(),
  otmvsWithDuration: { item: [{ trafficVolume: 'LFERMS' }] }
});
```

- Request object key reordering when needed.

In SOAP, key order matters.

```javascript
// OK
Flow.retrieveOTMVPlan({
  dataset: { type: 'OPERATIONAL' },
  day: moment.utc().toDate(),
  otmvsWithDuration: { item: [{ trafficVolume: 'LFERMS' }] }
});

// Would normally fail
Flow.retrieveOTMVPlan({
  day: moment.utc().toDate(),
  dataset: { type: 'OPERATIONAL' },
  otmvsWithDuration: { item: [{ trafficVolume: 'LFERMS' }] }
});
```

The library reorder request object keys to match what's expressed in the XSD/WSDL. Therefore, the second example works fine.

- Flow typing.

The following example will raise a Flow error.

```javascript
// Raises a Flow error
Flow.retrieveOTMVPlan({
  dataset: { type: 'OPERATIONNAL' }, // Notice the typo
  day: moment.utc().toDate(),
  otmvsWithDuration: { item: [{ trafficVolume: 'LFERMS' }] }
});
```

# Usage

## Main service

```javascript
import makeB2BClient from '@dgac/nmb2b-client';

// See below for more information about the security argument
makeB2BClient({ security }).then(client => {
  client.Airspace.queryCompleteAIXMDatasets().then(() => {});
});
```

## Per domain service

```javascript
import { makeAirspaceService } from '@dgac/nmb2b-client';

// See below for more information about the security argument
makeAirspaceService({ security }).then(Airspace => {
  Airspace.queryCompleteAIXMDatasets().then(() => {});
});
```

## B2B Security

Every request to the NM B2B web services must be authenticated using a client certificate. This library needs to be initialized with a `security` object, containing the certificate, key and passphrase associated.

### With P12 certificate

```javascript
import fs from 'fs';

const security = {
  pfx: fs.readFileSync('/path/to/cert.p12'),
  passphrase: 'your-passphrase'
};

makeB2BClient({ security }).then(client => {
  client.Airspace.queryCompleteAIXMDatasets().then(() => {});
});
```

### With PEM certificate

```javascript
import fs from 'fs';

const security = {
  pem: fs.readFileSync('/path/to/cert.pem'),
  key: fs.readFileSync('/path/to/cert.key'),
  passphrase: 'your-passphrase'
};

makeB2BClient({ security }).then(client => {
  client.Airspace.queryCompleteAIXMDatasets().then(() => {});
});
```
