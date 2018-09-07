# Network Manager B2B Client
[![build status](https://gitlab.asap.dsna.fr/4ME/nm-n2b-client/badges/master/build.svg)](https://gitlab.asap.dsna.fr/4ME/nm-n2b-client/commits/master) [![coverage report](https://gitlab.asap.dsna.fr/4ME/nm-n2b-client/badges/master/coverage.svg)](https://gitlab.asap.dsna.fr/4ME/nm-n2b-client/commits/master)

Exposes a general purpose Javascript library to interact with NM B2B

NM target version: 21.0.0

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
