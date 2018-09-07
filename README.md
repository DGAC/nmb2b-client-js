# Network Manager B2B Client
[![CircleCI](https://circleci.com/gh/DGAC/nmb2b-client-js/tree/master.svg?style=svg)](https://circleci.com/gh/DGAC/nmb2b-client-js/tree/master)
[![codecov](https://codecov.io/gh/DGAC/nmb2b-client-js/branch/master/graph/badge.svg)](https://codecov.io/gh/DGAC/nmb2b-client-js) [![Greenkeeper badge](https://badges.greenkeeper.io/DGAC/nmb2b-client-js.svg)](https://greenkeeper.io/)

Exposes a general purpose Javascript library to interact with NM B2B

NM target version: 22.0.0

# Exposed services

## Main service
```javascript
import makeB2BClient from '4me.libb2b';

// See below for more information about the security argument
makeB2BClient({ security }).then(client => {
  client.Airspace.queryCompleteAIXMDatasets()
    .then(() => {});
});
```
## Per domain service
```javascript
import { makeAirspaceService } from '4me.libb2b';

// See below for more information about the security argument
makeAirspaceService({ security }).then(Airspace => {
  Airspace.queryCompleteAIXMDatasets()
    .then(() => {});
});
```

## B2B Security

### With P12 certificate
```javascript
import fs from 'fs';

const security = {
  pfx: fs.readFileSync('cert.p12'),
  passphrase: 'fme',
};

makeB2BClient({ security }).then(client => {
  client.Airspace.queryCompleteAIXMDatasets()
    .then(() => {});
});
```

### With PEM certificate
```javascript
import fs from 'fs';

const security = {
  pem: fs.readFileSync('cert.pem'),
  key: fs.readFileSync('cert.key'),
  passphrase: 'fme',
};

makeB2BClient({ security }).then(client => {
  client.Airspace.queryCompleteAIXMDatasets()
    .then(() => {});
});
```
