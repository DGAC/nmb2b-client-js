# Network Manager B2B Client

[![CircleCI](https://circleci.com/gh/DGAC/nmb2b-client-js/tree/master.svg?style=svg)](https://circleci.com/gh/DGAC/nmb2b-client-js/tree/master)
[![codecov](https://codecov.io/gh/DGAC/nmb2b-client-js/branch/master/graph/badge.svg)](https://codecov.io/gh/DGAC/nmb2b-client-js) [![Greenkeeper badge](https://badges.greenkeeper.io/DGAC/nmb2b-client-js.svg)](https://greenkeeper.io/)

Exposes a general purpose Javascript library to interact with NM B2B web services.

NM target version: **22.0.0**

## Simple usage example

https://github.com/DGAC/nmb2b-client-js-example

# Usage

## Main service

```javascript
import makeB2BClient from "@dgac/nmb2b-client";

// See below for more information about the security argument
makeB2BClient({ security }).then(client => {
  client.Airspace.queryCompleteAIXMDatasets().then(() => {});
});
```

## Per domain service

```javascript
import { makeAirspaceService } from "@dgac/nmb2b-client";

// See below for more information about the security argument
makeAirspaceService({ security }).then(Airspace => {
  Airspace.queryCompleteAIXMDatasets().then(() => {});
});
```

## B2B Security

Every request to the NM B2B web services must be authenticated using a client certificate. This library needs to be initialized with a `security` object, containing the certificate, key and passphrase associated.

### With P12 certificate

```javascript
import fs from "fs";

const security = {
  pfx: fs.readFileSync("/path/to/cert.p12"),
  passphrase: "your-passphrase"
};

makeB2BClient({ security }).then(client => {
  client.Airspace.queryCompleteAIXMDatasets().then(() => {});
});
```

### With PEM certificate

```javascript
import fs from "fs";

const security = {
  pem: fs.readFileSync("/path/to/cert.pem"),
  key: fs.readFileSync("/path/to/cert.key"),
  passphrase: "your-passphrase"
};

makeB2BClient({ security }).then(client => {
  client.Airspace.queryCompleteAIXMDatasets().then(() => {});
});
```
