# `@dgac/nmb2b-client` — Documentation

A TypeScript client for the **EUROCONTROL Network Manager B2B** web services
(NM target version **27.0.0**). The library wraps the NM SOAP API and removes
most of its pain points: it downloads and caches the WSDL/XSD automatically,
serializes/deserializes awkward XSD types into idiomatic JavaScript values,
reorders request keys to satisfy SOAP ordering rules, and exposes a fully typed,
promise-based API.

> Package: `@dgac/nmb2b-client` · License: MIT · Node `>=22` · ESM-only

---

## How this documentation is organised

These docs are written for three audiences. Start with the one that matches
what you are trying to do.

| If you are…                              | Read this                                    |
| ---------------------------------------- | -------------------------------------------- |
| **Consuming the library** in your app    | [API & Usage Guide](./api-reference.md)      |
| **Contributing / onboarding** to the repo| [Getting Started](./getting-started.md)      |
| **Maintaining internals** / curious how it works | [Architecture](./architecture.md)    |

### Document index

- **[Getting Started](./getting-started.md)** — repository layout, tooling
  (pnpm, tsdown, vitest, oxlint), build/test/release workflows, how to add a new
  SOAP operation, and the fixture-based testing system.
- **[Architecture](./architecture.md)** — the request lifecycle end to end:
  configuration, security, WSDL bootstrapping & caching, the SOAP service
  factory, the serializer/deserializer, hooks, and error handling.
- **[API & Usage Guide](./api-reference.md)** — the public surface: client
  factories, configuration options, authentication, every service domain and its
  operations, the hooks API, and error handling patterns.

---

## 60-second overview

```typescript
import { createB2BClient } from '@dgac/nmb2b-client';
import fs from 'node:fs';

// 1. Authenticate (client certificate or API-gateway credentials)
const client = await createB2BClient({
  security: {
    pfx: fs.readFileSync('/path/to/cert.p12'),
    passphrase: 'your-passphrase',
  },
});

// 2. Call a SOAP operation — fully typed, returns a parsed JS object
const res = await client.Airspace.queryCompleteAIXMDatasets();
```

Under the hood, `createB2BClient`:

1. Validates the config and security object.
2. Downloads the NM WSDL/XSD tarball (once) and caches it on disk under a
   version-stamped directory.
3. Builds one `soap` client per domain, wiring in the serializer, the custom
   deserializer, and the configured hooks.
4. Returns an object with four domain services: `Airspace`, `Flight`, `Flow`,
   and `GeneralInformation`.

### The four service domains

| Domain               | Service WSDL              | What it covers                                   |
| -------------------- | ------------------------- | ------------------------------------------------ |
| `Airspace`           | `AirspaceServices`        | AIXM datasets, AUP / E-AUP airspace use plans    |
| `Flight`             | `FlightServices`          | Flight plans & flight lists/queries              |
| `Flow`               | `FlowServices`            | Regulations, hotspots, traffic counts, capacity / OTMV plans |
| `GeneralInformation` | `GeneralinformationServices` | WSDL discovery, user information              |

See the [API guide](./api-reference.md#service-domains--operations) for the full
operation list per domain.

---

## Key design ideas at a glance

- **No bundled WSDL/XSD.** The schema is fetched from NM at startup and cached,
  so the package stays small and always matches the targeted NM version
  (`27.0.0`, defined in [`src/constants.ts`](../src/constants.ts)).
- **Schema-driven (de)serialization.** Request objects are walked against the
  WSDL schema to reorder keys and convert types (e.g. JS `Date` →
  `DateYearMonthDay` string); responses are converted back (e.g. duration
  strings → seconds). See [Architecture → Transformers](./architecture.md#5-the-transformers-serializer--deserializer).
- **Typed errors.** A non-`OK` SOAP reply is thrown as an
  [`NMB2BError`](../src/utils/NMB2BError.ts) carrying the NM status code and
  validation details.
- **Hooks.** User callbacks run around every query for logging, metrics, tracing.
- **Tree-shakeable subpath exports.** Besides the main entry, the package
  exposes `/security`, `/config`, `/types`, and `/utils`.
