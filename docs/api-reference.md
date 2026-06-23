# API & Usage Guide

How to consume `@dgac/nmb2b-client` from your application: installing,
authenticating, creating clients, calling each service operation, handling
errors, and using hooks.

For how the library works internally, see [Architecture](./architecture.md).

---

## Installation

```bash
pnpm add @dgac/nmb2b-client
# or: npm i @dgac/nmb2b-client / yarn add @dgac/nmb2b-client
```

Requirements:

- **Node `>=22`**.
- **ESM only** — use `import`, not `require`.
- Network access to the NM B2B gateway at startup (to download the WSDL/XSD),
  and write access to a cache directory (default `/tmp/b2b-xsd`).

A runnable example project: <https://github.com/DGAC/nmb2b-client-js-example>.

---

## Package exports

| Import path                   | Contents                                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------ |
| `@dgac/nmb2b-client`          | `createB2BClient`, the four per-domain factories, `NMB2BError`, `createHook`, and the main types |
| `@dgac/nmb2b-client/security` | `Security` type and helpers (`fromEnv`, `fromValues`, `clearCache`, `assertValidSecurity`)       |
| `@dgac/nmb2b-client/config`   | `Config` type, `assertValidConfig`, `getSoapEndpoint`, `getFileUrl`, `obfuscate`                 |
| `@dgac/nmb2b-client/types`    | All domain request/reply types + `SafeB2BDeserializedResponse`                                   |
| `@dgac/nmb2b-client/utils`    | `NMB2BError`, `extractReferenceLocation`                                                         |

---

## Authentication (`security`)

Every NM B2B request must be authenticated. Provide **one** of three shapes.

### PFX / PKCS#12 certificate

```typescript
import fs from 'node:fs';

const security = {
  pfx: fs.readFileSync('/path/to/cert.p12'),
  passphrase: 'your-passphrase',
};
```

### PEM certificate + key

```typescript
import fs from 'node:fs';

const security = {
  cert: fs.readFileSync('/path/to/cert.pem'),
  key: fs.readFileSync('/path/to/cert.key'),
  passphrase: 'your-passphrase', // optional if the key is not encrypted
};
```

### API-gateway credentials

```typescript
const security = {
  apiKeyId: process.env.B2B_API_KEY_ID!,
  apiSecretKey: process.env.B2B_API_SECRET_KEY!,
};
```

> When using `apiKeyId`, you **must** also set `endpoint` and `xsdEndpoint` in
> the config — the automatic WSDL-discovery SOAP call is not available on the
> API-gateway path.

### Loading security from the environment

```typescript
import { fromEnv } from '@dgac/nmb2b-client/security';

const security = fromEnv(); // cached after first call; clearCache() to reset
```

Recognised variables:

| Variable              | Meaning                                             |
| --------------------- | --------------------------------------------------- |
| `B2B_CERT`            | Path to a PFX or PEM certificate file               |
| `B2B_CERT_FORMAT`     | `pfx` (default) or `pem`                            |
| `B2B_CERT_KEY`        | Path to the PEM key (required when format is `pem`) |
| `B2B_CERT_PASSPHRASE` | Passphrase for the cert/key                         |
| `B2B_API_KEY_ID`      | API-gateway key id                                  |
| `B2B_API_SECRET_KEY`  | API-gateway secret (required with `B2B_API_KEY_ID`) |

---

## Creating a client

### Full client (all domains)

```typescript
import { createB2BClient } from '@dgac/nmb2b-client';

const client = await createB2BClient({ security });

await client.Airspace.queryCompleteAIXMDatasets();
await client.Flight.retrieveFlight(/* … */);
await client.Flow.queryRegulations(/* … */);
await client.GeneralInformation.retrieveUserInformation(/* … */);
```

`client` is `{ Airspace, Flight, Flow, GeneralInformation }`.

### Per-domain client

Create just the domain you need (lighter; only that WSDL is loaded):

```typescript
import {
  createAirspaceClient,
  createFlightClient,
  createFlowClient,
  createGeneralInformationClient,
} from '@dgac/nmb2b-client';

const Flow = await createFlowClient({ security });
await Flow.retrieveOTMVPlan(/* … */);
```

All factories are `async` because they may download the WSDL and always build
the SOAP client(s) asynchronously.

---

## Configuration options (`CreateB2BClientOptions`)

Passed to every factory. Only `security` is required.

| Option            | Type                | Default          | Description                                                                |
| ----------------- | ------------------- | ---------------- | -------------------------------------------------------------------------- |
| `security`        | `Security`          | — (required)     | Authentication; see above.                                                 |
| `flavour`         | `'OPS' \| 'PREOPS'` | `'OPS'`          | Target NM environment (production vs pre-ops).                             |
| `XSD_PATH`        | `string`            | `'/tmp/b2b-xsd'` | Directory where the WSDL/XSD cache is stored.                              |
| `hooks`           | `SoapQueryHook[]`   | `[]`             | Callbacks run around every query (logging, metrics…).                      |
| `endpoint`        | `string`            | public NM host   | Override the SOAP gateway base URL.                                        |
| `xsdEndpoint`     | `string`            | —                | Override where the WSDL tarball is fetched from. Required with `apiKeyId`. |
| `ignoreWSDLCache` | `boolean`           | `false`          | Force re-download of the WSDL even if cached.                              |

Per-call options (second argument to any operation) are `SoapOptions`:

| Option    | Type     | Description                           |
| --------- | -------- | ------------------------------------- |
| `timeout` | `number` | Max request duration in milliseconds. |

```typescript
await client.Flight.retrieveFlight(input, { timeout: 30_000 });
```

> **`sendTime` is injected automatically.** The mandatory NM `sendTime` field is
> filled with the current time on every call — you never pass it yourself
> (though you may override it if needed).

---

## Service domains & operations

The library targets **NM version 27.0.0**. Each operation is fully typed; the
request/reply shapes come from `@dgac/nmb2b-client/types` and the per-domain
`types.ts` files.

### `Airspace` — `AirspaceServices`

| Operation                   | Purpose                            |
| --------------------------- | ---------------------------------- |
| `queryCompleteAIXMDatasets` | List/query complete AIXM datasets. |
| `retrieveAUP`               | Retrieve an Airspace Use Plan.     |
| `retrieveAUPChain`          | Retrieve the chain of AUPs.        |
| `retrieveEAUPChain`         | Retrieve the European AUP chain.   |

### `Flight` — `FlightServices`

| Operation                        | Purpose                           |
| -------------------------------- | --------------------------------- |
| `queryFlightPlans`               | Query flight plans.               |
| `queryFlightsByAerodrome`        | Flights for a single aerodrome.   |
| `queryFlightsByAerodromeSet`     | Flights for a set of aerodromes.  |
| `queryFlightsByAircraftOperator` | Flights for an aircraft operator. |
| `queryFlightsByAirspace`         | Flights crossing an airspace.     |
| `queryFlightsByMeasure`          | Flights impacted by a measure.    |
| `queryFlightsByTrafficVolume`    | Flights through a traffic volume. |
| `retrieveFlight`                 | Retrieve a single flight by id.   |

### `Flow` — `FlowServices`

| Operation                           | Purpose                               |
| ----------------------------------- | ------------------------------------- |
| `queryHotspots`                     | Query hotspots.                       |
| `queryRegulations`                  | Query regulations.                    |
| `queryTrafficCountsByAirspace`      | Traffic counts for an airspace.       |
| `queryTrafficCountsByTrafficVolume` | Traffic counts for a traffic volume.  |
| `retrieveCapacityPlan`              | Retrieve a capacity plan.             |
| `retrieveOTMVPlan`                  | Retrieve an OTMV plan.                |
| `retrieveRunwayConfigurationPlan`   | Retrieve a runway configuration plan. |
| `retrieveSectorConfigurationPlan`   | Retrieve a sector configuration plan. |
| `updateCapacityPlan`                | **Write** — update a capacity plan.   |
| `updateOTMVPlan`                    | **Write** — update an OTMV plan.      |

### `GeneralInformation` — `GeneralinformationServices`

| Operation                 | Purpose                                  |
| ------------------------- | ---------------------------------------- |
| `queryNMB2BWSDLs`         | Discover the available WSDL bundles.     |
| `retrieveUserInformation` | Retrieve the calling user's information. |

---

## Natural (de)serialization

The library converts between idiomatic JS values and NM's XSD string types, so
you work with `Date`s and numbers, not formatted strings.

```typescript
// You pass a JS Date; the library formats it as a DateYearMonthDay ("YYYY-MM-DD")
const res = await Flow.retrieveOTMVPlan({
  dataset: { type: 'OPERATIONAL' },
  day: new Date(),
  otmvsWithDuration: { item: [{ trafficVolume: 'LFERMS' }] },
});
```

Conversions applied (see [Architecture §5](./architecture.md#5-the-transformers-serializer--deserializer)):

- **Dates** — JS `Date` ⇄ `DateYearMonthDay` / `DateTimeMinute` / `DateTimeSecond`
  (always UTC).
- **Durations** — seconds ⇄ NM duration strings (`DurationHourMinute`,
  `DurationHourMinuteSecond`, `DurationMinute`).
- **Numerics** — `FlightLevel_DataType`, `DistanceNM`, `DistanceM`, `Bearing`,
  `CountsValue`, `OTMVThreshold` parsed to integers on the way back.

### Request key order is handled for you

SOAP is order-sensitive, but the library reorders request keys to match the
schema, so this works regardless of the order you write the keys:

```typescript
// Both are accepted — keys are reordered to match the WSDL
await Flow.retrieveOTMVPlan({
  day: new Date(),
  dataset: { type: 'OPERATIONAL' },
  otmvsWithDuration: { item: [{ trafficVolume: 'LFERMS' }] },
});
```

---

## Response shape

Every operation returns a `Reply` envelope. On success, `status` is `'OK'` and
the operation-specific payload lives under `data`. You never get a non-`OK`
reply back as a return value — those throw as `NMB2BError` (see
[Error handling](#error-handling)).

### The `Reply` envelope

All return types extend `Reply` ([`Common/types.ts`](../src/Common/types.ts)):

| Field                  | Type             | Description                                         |
| ---------------------- | ---------------- | --------------------------------------------------- |
| `status`               | `ReplyStatus`    | Always `'OK'` on a successful return.               |
| `requestId`            | `string`         | NM request id (unique with `requestReceptionTime`). |
| `requestReceptionTime` | `DateTimeSecond` | UTC time NM received the request.                   |
| `sendTime`             | `DateTimeSecond` | UTC time NM sent the reply.                         |
| `warnings`             | `B2B_Error[]`    | Non-fatal warnings, if any.                         |
| `reason`               | `string`         | Human-readable note, when provided.                 |

### `res.data` holds the payload

Operations that return data use `ReplyWithData<T> = Reply & { data: T }`. The
`data` field is the typed, deserialized payload — the part you actually want.

```typescript
// Flow.retrieveOTMVPlan → OTMVPlanRetrievalReply = ReplyWithData<{ plans: OTMVPlans }>
const res = await Flow.retrieveOTMVPlan({
  dataset: { type: 'OPERATIONAL' },
  day: new Date(),
  otmvsWithDuration: { item: [{ trafficVolume: 'LFERMS' }] },
});

res.status; // 'OK'
res.requestId; // NM request id
res.data.plans; // the OTMV plans (the payload)
```

```typescript
// Airspace.queryCompleteAIXMDatasets → ReplyWithData<{ datasetSummaries: CompleteDatasetSummary[] }>
const ds = await client.Airspace.queryCompleteAIXMDatasets();
ds.data.datasetSummaries; // CompleteDatasetSummary[]
```

The exact shape of `data` per operation is defined in the domain's `types.ts`
(re-exported from `@dgac/nmb2b-client/types`). Inspect the `…Reply` type for the
operation you're calling to see its `data` structure.

### `SafeB2BDeserializedResponse<T>`

Exported from `@dgac/nmb2b-client/types`. It is a helper alias for
`SoapDeserializer<T>` — the type produced by the custom deserializer for a given
response part. Reach for it when you manipulate a slice of a reply's `data` and
want to keep it typed against the XSD-derived shape (e.g. when pulling a nested
field out into a variable or a helper function).

```typescript
import type { SafeB2BDeserializedResponse } from '@dgac/nmb2b-client/types';
import type { OTMVPlans } from '@dgac/nmb2b-client/types';

const plans: SafeB2BDeserializedResponse<OTMVPlans> = res.data.plans;
```

---

## Error handling

A non-`OK` reply is thrown as an `NMB2BError`:

```typescript
import { createAirspaceClient, NMB2BError } from '@dgac/nmb2b-client';

try {
  const Airspace = await createAirspaceClient({ security });
  const res = await Airspace.queryCompleteAIXMDatasets();
} catch (err) {
  if (err instanceof NMB2BError) {
    if (err.status === 'OBJECT_NOT_FOUND') {
      // handle the specific NM status
    }
    console.error(err.status, err.reason, err.inputValidationErrors);
  } else {
    // transport / unexpected error (message prefixed with [Query Service.query])
    throw err;
  }
}
```

`NMB2BError` fields:

| Field                    | Description                                                |
| ------------------------ | ---------------------------------------------------------- |
| `status`                 | NM status code (e.g. `OBJECT_NOT_FOUND`, `INVALID_INPUT`). |
| `reason`                 | Human-readable reason, when provided.                      |
| `requestId`              | NM request id (unique with `requestReceptionTime`).        |
| `requestReceptionTime`   | UTC time NM received the request.                          |
| `sendTime`               | UTC time NM sent the reply.                                |
| `inputValidationErrors`  | Array of `B2B_Error` when `status` is `INVALID_INPUT`.     |
| `outputValidationErrors` | Array of `B2B_Error` when `status` is `INVALID_OUTPUT`.    |
| `warnings`               | Non-fatal warnings, if any.                                |
| `slaError`               | Set when an SLA was violated.                              |

Possible `status` values include: `OK`, `INVALID_INPUT`, `INVALID_OUTPUT`,
`INTERNAL_ERROR`, `SERVICE_UNAVAILABLE`, `RESOURCE_OVERLOAD`,
`REQUEST_COUNT_QUOTA_EXCEEDED`, `PARALLEL_REQUEST_COUNT_QUOTA_EXCEEDED`,
`REQUEST_OVERBOOKING_REJECTED`, `BANDWIDTH_QUOTAS_EXCEEDED`, `NOT_AUTHORISED`,
`OBJECT_NOT_FOUND`, `TOO_MANY_RESULTS`, `OBJECT_EXISTS`, `OBJECT_OUTDATED`,
`CONFLICTING_UPDATE`, `INVALID_DATASET`.

---

## Hooks

Hooks are callbacks run around every SOAP query — ideal for logging, metrics, or
tracing. Register them via `config.hooks`.

```typescript
const client = await createB2BClient({
  security,
  hooks: [
    function onRequestStart({ service, query, input }) {
      console.log(`${service}.${query} called`, input);
    },
  ],
});
```

A hook may return success/error continuations:

```typescript
hooks: [
  function onRequestStart({ service, query, input }) {
    const start = Date.now();
    return {
      onRequestSuccess: ({ response }) =>
        console.log(`${service}.${query} ok in ${Date.now() - start}ms`),
      onRequestError: ({ error }) =>
        console.error(`${service}.${query} failed: ${error.message}`),
    };
  },
],
```

Hooks can be `async`. For type-safe hooks, use the `createHook` helper:

```typescript
import { createHook } from '@dgac/nmb2b-client';

const withMetrics = createHook(({ service, query }) => {
  counter.inc({ service, query, status: 'started' });
  return {
    onRequestSuccess: () =>
      counter.inc({ service, query, status: 'completed' }),
    onRequestError: () => counter.inc({ service, query, status: 'failed' }),
  };
});

const client = await createB2BClient({ security, hooks: [withMetrics] });
```

Notes:

- A built-in debug-logging hook always runs first (see Debug output below).
- Completion callbacks run in **reverse registration order** (LIFO).

---

## Debug output

Tracing uses the [`debug`](https://www.npmjs.com/package/debug) package under the
`@dgac/nmb2b-client` namespace. Enable it with an environment variable:

```bash
DEBUG='@dgac/nmb2b-client*' node your-app.js
```

You'll see config (with secrets masked), WSDL download steps, and per-query
`Called with input … / Succeeded / Failed` lines.

---

## OPS vs PREOPS

Set `flavour` to choose the environment:

```typescript
await createB2BClient({ security, flavour: 'PREOPS' }); // pre-operations
await createB2BClient({ security, flavour: 'OPS' }); // production (default)
```

This selects both the host and the URL context, and is stamped into the WSDL
cache path so OPS and PREOPS schemas don't collide.
