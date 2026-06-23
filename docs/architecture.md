# Architecture

This document explains how `@dgac/nmb2b-client` is built internally: the module
layout, the end-to-end lifecycle of a SOAP query, and the responsibilities of
each subsystem. It is aimed at maintainers and anyone who wants to understand or
extend the library.

For how to *use* the library, see the [API & Usage Guide](./api-reference.md).
For repo workflows, see [Getting Started](./getting-started.md).

---

## 1. High-level picture

The library is a thin, strongly-typed orchestration layer on top of the
[`soap`](https://www.npmjs.com/package/soap) package. Its value is concentrated
in four concerns that the raw `soap` client does not handle well for the NM API:

1. **Bootstrapping** — fetching and caching the WSDL/XSD that the SOAP client
   needs to exist at all.
2. **Serialization** — turning idiomatic JS input (Dates, numbers, unordered
   keys) into the exact XML shape NM expects.
3. **Deserialization** — turning NM's stringly-typed XML back into JS values.
4. **Cross-cutting concerns** — typed errors, hooks (logging/metrics), debug
   tracing, and `sendTime` injection.

```
createB2BClient(options)
        │
        ├─ prepareConfig ............... merge defaults + validate (config.ts, security.ts)
        │
        ├─ downloadWSDLIfNeeded ........ fetch + cache WSDL tarball (utils/xsd/*)
        │
        └─ Promise.all([
             getAirspaceClient,         ┐
             getFlightClient,           │ one soap client per domain
             getFlowClient,             │ (utils/soap-query-definition.ts)
             getGeneralInformationClient┘
           ])
                 │
                 └─ per query: serialize → soap call → assertOk → deserialize
                                (wrapped by hooks)
```

---

## 2. Module / directory layout

```
src/
├── index.ts                  # Public entry point (re-exports the factories + NMB2BError + createHook)
├── createB2BClient.ts        # Top-level factories: createB2BClient + per-domain factories
├── config.ts                 # Config type, validation, endpoint/URL builders, obfuscation
├── security.ts               # Security types (PFX / PEM / API-gateway), validation, env loaders
├── constants.ts              # B2B_VERSION ('27.0.0'), B2BFlavours ('OPS' | 'PREOPS')
├── soap.ts                   # SoapOptions (per-call timeout)
├── types.ts                  # Barrel re-export of all domain types (the `/types` export)
│
├── Common/
│   ├── types.ts              # Shared NM primitives: Reply, B2BRequest, ReplyStatus, NMSet, dates…
│   └── ServiceInterface.ts   # BaseServiceInterface marker (__soapClient + config)
│
├── Airspace/ | Flight/ | Flow/ | GeneralInformation/
│   ├── index.ts              # getXxxClient(config) + XxxService type; lists the query definitions
│   ├── <operation>.ts        # One file per SOAP operation (the query definition)
│   ├── types.ts              # Request/Reply interfaces matching the XSD for this domain
│   ├── <operation>.e2e.test.ts  # Integration test against a real B2B connection
│   └── __fixtures__/         # Recorded request/response artifacts for deterministic unit tests
│
└── utils/
    ├── soap-query-definition.ts  # ★ Core: createSoapService / createSoapQueryDefinition / query builder
    ├── internals.ts          # injectSendTime, assertOkReply, WithInjectedSendTime
    ├── NMB2BError.ts         # Typed error thrown on non-OK replies
    ├── assert.ts             # assert() helper (node:assert based)
    ├── debug.ts              # createDebugLogger — namespaced under @dgac/nmb2b-client
    ├── extractReferenceLocation.ts
    ├── timeFormats.ts        # date-fns format strings for NM date/time types
    ├── fs.ts                 # dirExists / createDir helpers
    ├── hooks/
    │   ├── hooks.ts          # SoapQueryHook type + createHook()
    │   ├── index.ts          # applyHooks() — wraps a query function with start/success/error hooks
    │   └── withLog.ts        # logHook — the always-on debug logging hook
    ├── transformers/
    │   ├── types.ts          # ★ XSD type ⇄ JS value table (input = serialize, output = deserialize)
    │   ├── serializer.ts     # reorderKeys + prepareSerializer (request side)
    │   └── index.ts          # deserializer map (response side, fed to the soap client)
    └── xsd/
        ├── index.ts          # download() + WSDLExists() — cache check + lockfile
        ├── getWSDLDownloadURL.ts  # asks NM for the tarball URL via a raw SOAP POST
        ├── downloadAndExtractWSDL.ts  # streams the tarball, validates content-type, untars
        ├── createAxiosConfig.ts   # builds axios httpsAgent from the security cert
        └── paths.ts          # cache directory + per-service WSDL file path (version/endpoint stamped)
```

Two files marked **★** carry most of the cleverness:
[`utils/soap-query-definition.ts`](../src/utils/soap-query-definition.ts) (the
service/query factory) and
[`utils/transformers/`](../src/utils/transformers/) (the (de)serialization).

---

## 3. The request lifecycle, end to end

### 3.1 Client creation

[`createB2BClient(options)`](../src/createB2BClient.ts) (and the per-domain
variants `createAirspaceClient`, etc.) all follow the same three steps:

1. **`prepareConfig(options)`** — merges the user options over
   `CONFIG_DEFAULTS` (`flavour: 'OPS'`, `XSD_PATH: '/tmp/b2b-xsd'`, `hooks: []`),
   then runs `assertValidConfig` which in turn calls `assertValidSecurity`.
   Invalid config throws synchronously.
2. **`downloadWSDLIfNeeded(config)`** — ensures the WSDL/XSD cache is populated
   (see §4).
3. **Build the services** — `getAirspaceClient`, `getFlightClient`,
   `getFlowClient`, `getGeneralInformationClient` run in parallel via
   `Promise.all`. Each returns a `SoapService`.

The per-domain factory (e.g.
[`getAirspaceClient`](../src/Airspace/index.ts)) calls `createSoapService` with:

- a `serviceName` (e.g. `'AirspaceServices'`) used to resolve the WSDL file path,
- the shared `config`,
- a `queryDefinitions` object mapping operation name → query definition.

### 3.2 Building a SOAP service

[`createSoapService`](../src/utils/soap-query-definition.ts):

1. Resolves the WSDL path via `getServiceWSDLFilePath` (version + flavour stamped).
2. Builds the `soap` security object via `prepareSecurity(config)`.
3. `createClientAsync(WSDL, { customDeserializer })` — note the **custom
   deserializer** is injected here so every response is post-processed.
4. `client.setSecurity(...)`; if `config.endpoint` is set, `client.setEndpoint(...)`.
5. Delegates to `createSoapServiceFromSoapClient`, which turns each query
   definition into a callable function (see §3.3) and returns:
   ```ts
   { __soapClient: client, config, ...queryFunctions }
   ```

### 3.3 Building a single query function

For each entry in `queryDefinitions`,
`buildQueryFunctionFromSoapDefinition` does the following **once, at build time**:

1. `queryDefinition.getSchema(client)` — pulls the input schema for this
   operation out of `client.describe()`. This is the WSDL-derived shape used to
   drive serialization. Example from
   [`retrieveAUP.ts`](../src/Airspace/retrieveAUP.ts):
   ```ts
   getSchema: (client) =>
     client.describe().AirspaceAvailabilityService
       .AirspaceAvailabilityPort.retrieveAUP.input
   ```
2. `prepareSerializer(schema)` — builds a fast, schema-specific serializer.
3. Resolves the actual SOAP call: `queryDefinition.executeQuery?.(client)` or, by
   default, `client[`${query}Async`]` (the promisified method `soap` generates).
4. Wraps everything with `applyHooks(...)`.

The returned function, **at call time**, does:

```
input
 → injectSendTime(input)        # adds a fresh sendTime: Date if absent
 → serializer(...)              # reorder keys + convert JS values → XSD strings
 → queryFn(...)  ──► soap ──► NM B2B over HTTPS
 → [result]                     # soap returns a tuple; we take [0]
 → assertOkReply(result)        # throw NMB2BError if status !== 'OK'
 → return result
```

Any thrown error that is **not** an `AssertionError` or `NMB2BError` is wrapped
in a descriptive `Error` (with the original attached as `cause`) tagged with the
`service.query` name.

### 3.4 `sendTime` injection

Every NM request carries a mandatory `sendTime`. The public input type for each
operation uses `WithInjectedSendTime<T>` (from
[`internals.ts`](../src/utils/internals.ts)), which makes `sendTime` optional —
[`injectSendTime`](../src/utils/internals.ts) fills it with `new Date()` at call
time unless the caller supplied one. This is why you never pass `sendTime`
yourself.

---

## 4. WSDL/XSD bootstrapping & caching

Lives in [`utils/xsd/`](../src/utils/xsd/). The SOAP client cannot be created
without local WSDL files, so this runs before any service is built.

### 4.1 Cache layout

[`paths.ts`](../src/utils/xsd/paths.ts) computes a **version-stamped** cache
directory under `config.XSD_PATH` (default `/tmp/b2b-xsd`):

- Default NM endpoint: `<XSD_PATH>/27.0.0-network-manager`
- Custom `xsdEndpoint`: `<XSD_PATH>/27.0.0-<sha256(endpoint)[:8]>`

Each service WSDL is then `<dir>/<Service>_<FLAVOUR>_<VERSION>.wsdl`, e.g.
`AirspaceServices_OPS_27.0.0.wsdl`.

### 4.2 Download flow ([`index.ts → download`](../src/utils/xsd/index.ts))

1. Ensure the cache directory exists.
2. **Acquire a file lock** on the directory with
   [`proper-lockfile`](https://www.npmjs.com/package/proper-lockfile) (5 retries).
   This makes concurrent processes / parallel domain factories safe — only one
   downloads, the rest wait then find the cache populated.
3. If `WSDLExists` (directory non-empty) and not `ignoreWSDLCache` → return early.
4. Otherwise `getWSDLDownloadURL(config)` then `downloadAndExtractWSDL(url, …)`.
5. Release the lock in a `finally`.

### 4.3 Resolving the tarball URL ([`getWSDLDownloadURL.ts`](../src/utils/xsd/getWSDLDownloadURL.ts))

- If `xsdEndpoint` is provided, it is returned directly (used for API-gateway
  auth and for mocking in tests).
- Otherwise the library sends a **raw, hand-written SOAP envelope** (a
  `NMB2BWSDLsRequest`) via `axios` POST to the SOAP gateway, then extracts the
  `<id>…</id>` of the tarball from the text response and turns it into an
  absolute file URL with `getFileUrl`.
- Note: API-gateway (`apiKeyId`) auth cannot use this discovery path, which is
  why `assertValidConfig` requires both `endpoint` and `xsdEndpoint` when an
  `apiKeyId` is used.

### 4.4 Download & extract ([`downloadAndExtractWSDL.ts`](../src/utils/xsd/downloadAndExtractWSDL.ts))

- Streams the URL with `axios` (`responseType: 'stream'`, 15 s timeout), using an
  `httpsAgent` built from the client certificate (`createAxiosConfig`).
- Guards against HTML/error pages by checking the `content-type` is a binary
  format (`gzip` / `octet-stream` / `x-tar`).
- Pipes the stream through `tar.extract({ cwd: outputDir, strip: 1 })`.

---

## 5. The transformers (serializer & deserializer)

The heart of the "natural types" feature. The mapping table lives in
[`transformers/types.ts`](../src/utils/transformers/types.ts): each XSD type name
maps to an `{ input, output }` pair.

- **`input`** is the **serialize** function (JS → XSD string), used on requests.
- **`output`** is the **deserialize** function (XSD string → JS), used on replies.

Examples:

| XSD type           | `input` (request)             | `output` (reply)               |
| ------------------ | ----------------------------- | ------------------------------ |
| `DateYearMonthDay` | `Date` → `"YYYY-MM-DD"`       | string → `Date` (UTC)          |
| `DateTimeMinute`   | `Date` → `"YYYY-MM-DD hh:mm"` | string → `Date` (UTC)          |
| `DurationHourMinute` | seconds → `"HHMM"`          | `"HHMM"` → seconds             |
| `DurationMinute`   | seconds → minutes             | minutes → seconds              |
| `FlightLevel_DataType`, `DistanceNM`, `Bearing`, … | (none) | string → integer |

All dates are treated as **UTC** (via `@date-fns/utc`).

### 5.1 Serializer (request side) — [`serializer.ts`](../src/utils/transformers/serializer.ts)

`prepareSerializer(schema)` returns a pipeline:

1. **`reorderKeys(schema)`** — SOAP is order-sensitive. This recursively rebuilds
   the input object so its keys follow the WSDL schema order, descending into
   nested objects and arrays (keys suffixed `[]` in the schema indicate arrays).
   Keys not present in the input are skipped; namespace metadata
   (`targetNSAlias`, `targetNamespace`) is ignored.
2. **`evolve(transformer)`** ([remeda](https://remedajs.com/)) — applies the per-field
   `input` converters built by `prepareTransformer`, which walks the same schema
   and, for each leaf whose XSD type has an `input` function, registers it
   (mapping over arrays where needed).

This is why the README's "wrong key order still works" and "pass a JS `Date`"
examples hold.

### 5.2 Deserializer (response side) — [`transformers/index.ts`](../src/utils/transformers/index.ts)

`deserializer` is simply the `{ typeName: output }` map derived from the same
table. It is passed to `createClientAsync` as `customDeserializer`, so the `soap`
package applies these conversions automatically while parsing the XML reply —
durations become seconds, dates become `Date`, numeric strings become integers.

---

## 6. Hooks

A hook is a `SoapQueryHook` ([`hooks/hooks.ts`](../src/utils/hooks/hooks.ts)):
a function called with `{ service, query, input }` when a query starts. It may
return `{ onRequestSuccess?, onRequestError? }` callbacks for completion.

[`applyHooks`](../src/utils/hooks/index.ts) wraps each query function:

- On start, it runs every hook (sequentially, awaited), collecting the
  success/error continuations. Continuations are `unshift`-ed, so they run in
  **reverse registration order** (LIFO) — like middleware unwinding.
- On success it runs all `onRequestSuccess({ service, query, response })`.
- On error it runs all `onRequestError({ service, query, error })`, then rethrows.

The built-in [`logHook`](../src/utils/hooks/withLog.ts) is always prepended to
the user's hooks, providing `debug`-namespaced tracing for every call. User
hooks come from `config.hooks`.

---

## 7. Configuration & endpoints

[`config.ts`](../src/config.ts) owns config validation and URL construction:

- **`assertValidConfig`** — requires a valid `security`, a valid `flavour`, and
  (for API-gateway auth) both `endpoint` and `xsdEndpoint`.
- **`getSoapEndpoint(config)`** — builds the gateway URL:
  `<root>/<B2B_OPS|B2B_PREOPS>/gateway/spec/27.0.0`, where root is the public
  OPS/PREOPS host unless `endpoint` overrides it.
- **`getFileUrl(path, config)`** — builds the file-download URL
  (`FILE_OPS`/`FILE_PREOPS`); not supported when `endpoint` is overridden.
- **`obfuscate(config)`** — masks every `security` value for safe debug logging.

`OPS` vs `PREOPS` (the **flavour**) selects production vs. pre-operations NM
environments; it is reflected in both the host and the URL context segment.

---

## 8. Security / authentication

[`security.ts`](../src/security.ts) supports three mutually-exclusive shapes,
validated by `assertValidSecurity` and converted to a `soap` `ISecurity` by
`prepareSecurity`:

| Shape          | Fields                          | `soap` mechanism            |
| -------------- | ------------------------------- | --------------------------- |
| `PfxSecurity`  | `pfx: Buffer`, `passphrase`     | `ClientSSLSecurityPFX`      |
| `PemSecurity`  | `cert: Buffer`, `key: Buffer`, `passphrase?` | `ClientSSLSecurity`        |
| `ApiGwSecurity`| `apiKeyId`, `apiSecretKey`      | `BasicAuthSecurity`         |

It also provides env-based loaders: `fromEnv()` (cached) and `fromValues(env)`
read `B2B_CERT`, `B2B_CERT_KEY`, `B2B_CERT_PASSPHRASE`, `B2B_CERT_FORMAT`
(`pfx`/`pem`), or `B2B_API_KEY_ID` / `B2B_API_SECRET_KEY`. `clearCache()` resets
the `fromEnv` cache.

---

## 9. Error handling

- A SOAP reply always has a `status` ([`ReplyStatus`](../src/Common/types.ts)).
- [`assertOkReply`](../src/utils/internals.ts) throws an
  [`NMB2BError`](../src/utils/NMB2BError.ts) when `status !== 'OK'`.
- `NMB2BError` exposes the NM `status`, plus `requestId`, `requestReceptionTime`,
  `sendTime`, `inputValidationErrors`, `warnings`, `slaError`, and `reason`. Its
  `message` is `status` (optionally `status: reason`).
- Lower-level/transport failures surface as a wrapped `Error` with a
  `[Query Service.query] …` prefix and the original error as `cause`.

---

## 10. Type system notes

- Domain request/reply interfaces live in each `src/<Domain>/types.ts` and are
  re-exported through [`src/types.ts`](../src/types.ts) (the `/types` subpath).
- [`Common/types.ts`](../src/Common/types.ts) holds NM primitives: `Reply`,
  `B2BRequest`, `NMSet<A>`/`NMList<A>`/`NMMap<K,V>`, date aliases, `Dataset`,
  `ReplyStatus`, `B2B_Error`, etc.
- The `SoapService<TDefinitions>` mapped type derives the callable signature of
  each operation from its query definition, so `client.Flow.retrieveOTMVPlan` is
  typed directly from the `retrieveOTMVPlan` definition — input typos are
  compile errors.

---

## 11. Build & module format

- **ESM-only** (`"type": "module"`), Node `>=22`.
- Built with [`tsdown`](https://tsdown.dev) ([`tsdown.config.ts`](../tsdown.config.ts)):
  multiple entry points (`index`, `utils/index`, `types`, `security`, `config`),
  `target: node22`, `dts: true`, `sourcemap: true`, `unbundle: true` (preserves
  the module structure rather than bundling into one file).
- Subpath exports map to the built `.mjs` / `.d.mts` files (see `exports` in
  [`package.json`](../package.json)): `.`, `./security`, `./config`, `./types`,
  `./utils`.

See [Getting Started](./getting-started.md) for the full build/test/release flow.
