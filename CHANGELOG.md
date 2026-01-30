# @dgac/nmb2b-client

## 2.2.4

### Patch Changes

- [#253](https://github.com/DGAC/nmb2b-client-js/pull/253) [`799a4e1`](https://github.com/DGAC/nmb2b-client-js/commit/799a4e14e72311250579a7a0d908e294591f4598) Thanks [@kouak](https://github.com/kouak)! - Update and clean up github workflows

## 2.2.3

### Patch Changes

- [#251](https://github.com/DGAC/nmb2b-client-js/pull/251) [`0ab9490`](https://github.com/DGAC/nmb2b-client-js/commit/0ab94904b54ac0f013514108c0817e1680a0a015) Thanks [@kouak](https://github.com/kouak)! - chore: update dependencies
  - axios: 1.13.2 -> 1.13.4
  - remeda: 2.32.0 -> 2.33.4
  - soap: 1.6.1 -> 1.6.4
  - tar: 7.5.6 -> 7.5.7
  - type-fest: 5.3.1 -> 5.4.2

## 2.2.2

### Patch Changes

- [#244](https://github.com/DGAC/nmb2b-client-js/pull/244) [`46d0827`](https://github.com/DGAC/nmb2b-client-js/commit/46d0827472c55df59626d2c295317433a8b0982a) Thanks [@kouak](https://github.com/kouak)! - node-tar v7.5.6 (fix CVE)

## 2.2.1

### Patch Changes

- [#242](https://github.com/DGAC/nmb2b-client-js/pull/242) [`db2d67f`](https://github.com/DGAC/nmb2b-client-js/commit/db2d67fb3ba316aa84fbf59bf08dbb5bb46f6dc3) Thanks [@kouak](https://github.com/kouak)! - node-tar 7.5.3 (fix CVE)

## 2.2.0

### Minor Changes

- [#231](https://github.com/DGAC/nmb2b-client-js/pull/231) [`a0d26bd`](https://github.com/DGAC/nmb2b-client-js/commit/a0d26bd7a866e8c4c27ee74e43fb220bfb0756c6) Thanks [@kouak](https://github.com/kouak)! - Corrected typos and type errors across multiple domain definitions to strictly align with Eurocontrol NM B2B v27.0.0 Business Documentation and XSD schemas.

  Modified types:
  - AlternativeRouteInfo
  - AUPSummary
  - CapacityPlanRetrievalRequest
  - CapacityPlans
  - CompleteAIXMDatasetRequest
  - Flight
  - FlightField
  - FlightListByAirspaceRequest
  - FlightRetrievalReplyData
  - HotspotPlans
  - IRegulationOrMCDMOnly
  - OTMVPlanRetrievalRequest
  - OTMVPlans
  - Regulation
  - ReroutingOpportunities
  - SignedDistanceNM
  - SignedDurationHourMinute

- [#235](https://github.com/DGAC/nmb2b-client-js/pull/235) [`340091b`](https://github.com/DGAC/nmb2b-client-js/commit/340091b72db65047745b5d5380cbf292ded39a70) Thanks [@kouak](https://github.com/kouak)! - - Refactor configuration validation using assertion functions.
  - Rename `getEndpoint` to `getSoapEndpoint`.
  - Deprecate `isConfigValid`, `isValidSecurity`, and `getEndpoint`.
  - Enforce strict `xsdEndpoint` requirement when using custom endpoints.
  - Add TSDoc to public API.

### Patch Changes

- [#240](https://github.com/DGAC/nmb2b-client-js/pull/240) [`2109151`](https://github.com/DGAC/nmb2b-client-js/commit/21091513f5fe7e7a91e12b3f98e31911153ac5e4) Thanks [@kouak](https://github.com/kouak)! - Added internal testing utilities for fixture-based SOAP testing.

  Fixtures capture real SOAP interactions and store them as reproducible test artifacts (XML requests/responses with context variables). These artifacts enable deterministic unit testing without requiring a live B2B connection.

- [#229](https://github.com/DGAC/nmb2b-client-js/pull/229) [`72bc9e2`](https://github.com/DGAC/nmb2b-client-js/commit/72bc9e2d32611574cacc2a7aa3c3ae20976e42d7) Thanks [@kouak](https://github.com/kouak)! - Implement isolated WSDL caching for custom `xsdEndpoint` configurations.
  - **Feature**: When `xsdEndpoint` is configured, WSDL files are now stored in a unique cache directory derived from the endpoint URL. This prevents cache corruption when switching between different sources (e.g. official NM B2B vs internal proxy).
  - **Migration**: The default cache directory (used when no `xsdEndpoint` is provided) has been renamed from `{version}` to `{version}-network-manager` to ensure isolation from legacy caches. **This will trigger a one-time automatic re-download of WSDL files.**

- [#228](https://github.com/DGAC/nmb2b-client-js/pull/228) [`d4ebb33`](https://github.com/DGAC/nmb2b-client-js/commit/d4ebb33761cecc3a4250d37238429553c9d5943b) Thanks [@kouak](https://github.com/kouak)! - Ensure valid http response headers for WSDL download

- [#226](https://github.com/DGAC/nmb2b-client-js/pull/226) [`5b18de0`](https://github.com/DGAC/nmb2b-client-js/commit/5b18de0bc7fb8daaf83d2d24578e8112bdc42623) Thanks [@kouak](https://github.com/kouak)! - Improved error handling for SOAP queries: unexpected errors thrown during SOAP query execution are now wrapped in a standard `Error` object. This new error includes a descriptive message identifying the failing service and query (e.g., `[Query service.query] Error thrown during query execution...`) and preserves the original error as the `cause`.

## 2.1.3

### Patch Changes

- [#222](https://github.com/DGAC/nmb2b-client-js/pull/222) [`10b5b56`](https://github.com/DGAC/nmb2b-client-js/commit/10b5b56cc1e4f335e6989714fa67b6d3ff4e8140) Thanks [@kouak](https://github.com/kouak)! - Fix typescript types to allow passing node-soap options to NM B2B query functions

## 2.1.2

### Patch Changes

- [#220](https://github.com/DGAC/nmb2b-client-js/pull/220) [`74901a2`](https://github.com/DGAC/nmb2b-client-js/commit/74901a2ddf297cae5639b9da85cb7f2a2c4b30b3) Thanks [@kouak](https://github.com/kouak)! - Fix broken v2.1.1 build due to tsdown change.

## 2.1.1

### Patch Changes

- [#214](https://github.com/DGAC/nmb2b-client-js/pull/214) [`0305896`](https://github.com/DGAC/nmb2b-client-js/commit/03058961648202ff5d86635be6076c71c29c0587) Thanks [@kouak](https://github.com/kouak)! - Update dependencies :
  - axios v1.13.2
  - soap v1.6.0
  - type-fest v5.2.0

## 2.1.0

### Minor Changes

- [#210](https://github.com/DGAC/nmb2b-client-js/pull/210) [`4f898e5`](https://github.com/DGAC/nmb2b-client-js/commit/4f898e5f7efa50fc7ba99cd9aba267d5223958ee) Thanks [@kouak](https://github.com/kouak)! - Rework B2B input types to accept `Request` parameters (`endUserId`, `onBehalfOfUnit`)

- [#207](https://github.com/DGAC/nmb2b-client-js/pull/207) [`39d7fe5`](https://github.com/DGAC/nmb2b-client-js/commit/39d7fe5c9a1f7cbfc83693b416520616adbf78d8) Thanks [@kouak](https://github.com/kouak)! - Implement query hooks.

  Hooks are user provided callbacks which will be executed during the SOAP query process.

  Basic example :

  ```typescript
  const client = await createB2BClient({
    // ... other options,
    hooks: [
      function onRequestStart({ service, query, input }) {
        console.log(
          `Query ${query} of service ${service} was invoked with input`,
          input,
        );
      },
    ],
  });
  ```

  A hook can return an optional object containing success / error hooks :

  ```typescript
  const client = await createB2BClient({
    // ... other options,
    hooks: [
      function onRequestStart({ service, query, input }) {
        const startTime = new Date();

        console.log(
          `Query ${query} of service ${service} was invoked with input:`,
          input,
        );

        return {
          onRequestSuccess: ({ response }) => {
            const durationMs = new Date().valueOf() - startTime;
            console.log(`Query took ${durationMs}ms`);
            console.log(`Query responded with`, response);
          },
          onRequestError: ({ error }) => {
            const durationMs = new Date().valueOf() - startTime;
            console.log(`Query took ${durationMs}ms`);
            console.log(`Query failed with error ${error.message}`);
          },
        };
      },
    ],
  });
  ```

  Hooks can also be async :

  ```typescript
  const client = await createB2BClient({
    // ... other options,
    hooks: [
      async function onRequestStart({ service, query, input }) {
        await sendLog(`Query ${query} of service ${service} was invoked`);
      },
    ],
  });
  ```

  To get proper typescript support when creating custom hooks, a `createHook()` function helper is now exported :

  ```typescript
  import { createHook } from '@dgac/nmb2b-client';

  const withPrometheusMetrics = createHook(({ service, query }) => {
    prometheusCounter.inc({ service, query, status: 'started' });

    return {
      onRequestSuccess: () =>
        prometheusCounter.inc({ service, query, status: 'completed' }),
      onRequestError: () =>
        prometheusCounter.inc({ service, query, status: 'completed' }),
    };
  });

  // ... in another file

  const b2bClient = await createB2BClient({
    // ... other options
    hooks: [withPrometheusMetrics],
  });
  ```

### Patch Changes

- [#212](https://github.com/DGAC/nmb2b-client-js/pull/212) [`39f162f`](https://github.com/DGAC/nmb2b-client-js/commit/39f162f53132a87265e3c16936c1dac111256501) Thanks [@kouak](https://github.com/kouak)! - Document createClient() options and Config properties.

- [#211](https://github.com/DGAC/nmb2b-client-js/pull/211) [`f3ead5a`](https://github.com/DGAC/nmb2b-client-js/commit/f3ead5a94625bac25af79028885249093f8f9ad6) Thanks [@kouak](https://github.com/kouak)! - Refactor internals with a declarative API which makes it easier to implement new Request/Reply queries

- [#208](https://github.com/DGAC/nmb2b-client-js/pull/208) [`6b8cd4c`](https://github.com/DGAC/nmb2b-client-js/commit/6b8cd4c2c5a756ee922e7dc21bf5240cc178efd2) Thanks [@kouak](https://github.com/kouak)! - Fix incorrect optionnal arguments on some B2B queries

- [#205](https://github.com/DGAC/nmb2b-client-js/pull/205) [`6f53edb`](https://github.com/DGAC/nmb2b-client-js/commit/6f53edb68e9afa0db1b992ef33903ef28cd72efd) Thanks [@kouak](https://github.com/kouak)! - Update dependencies

## 2.0.0

### Major Changes

- [#194](https://github.com/DGAC/nmb2b-client-js/pull/194) [`98b4031`](https://github.com/DGAC/nmb2b-client-js/commit/98b40313643210978902c0167c855ffbf89c0ac9) Thanks [@kouak](https://github.com/kouak)! - - Rename `make*Client` to `create*Client`
  - Change export paths:
    - `@dgac/nmb2b-client` exports B2B client builders
    - `@dgac/nmb2b-client/config` exports utilities to check the B2B client builder configuration
    - `@dgac/nmb2b-client/security` exports utilities to create the `security` object required by a B2B client builder
      `@dgac/nmb2b-client/types` exports typescript types representing the XSD types defined in the B2B XSD
  - Drop node v18 support, test against node 24
  - Publish as ESM only package (with correct `module-sync` resolution for usage in commonjs context)
  - Migrate build to `tsdown`

## 1.5.1

### Patch Changes

- [#200](https://github.com/DGAC/nmb2b-client-js/pull/200) [`8ded29b`](https://github.com/DGAC/nmb2b-client-js/commit/8ded29bed84da78ba8390efafd295d642b44e203) Thanks [@kouak](https://github.com/kouak)! - Remove `invariant` dependency

- [#202](https://github.com/DGAC/nmb2b-client-js/pull/202) [`168d357`](https://github.com/DGAC/nmb2b-client-js/commit/168d357f44162419fac6ede2371aac8cc2dfa940) Thanks [@kouak](https://github.com/kouak)! - Update `soap` and `axios`

## 1.5.0

### Minor Changes

- [#195](https://github.com/DGAC/nmb2b-client-js/pull/195) [`98c6e30`](https://github.com/DGAC/nmb2b-client-js/commit/98c6e307d88e8c4bcc43489359dd78bb45155932) Thanks [@kouak](https://github.com/kouak)! - Implement compatibility with typescript moduleResolution: nodenext

### Patch Changes

- [#192](https://github.com/DGAC/nmb2b-client-js/pull/192) [`1d7233a`](https://github.com/DGAC/nmb2b-client-js/commit/1d7233a4277f04fd9d216aa05b6dcb4fbeb75ffa) Thanks [@kouak](https://github.com/kouak)! - Update vitest to fix CVE

- [#189](https://github.com/DGAC/nmb2b-client-js/pull/189) [`c3e50e4`](https://github.com/DGAC/nmb2b-client-js/commit/c3e50e48f06da4a89f85446fb6aca863f574abd8) Thanks [@kouak](https://github.com/kouak)! - Nock v14

- [#190](https://github.com/DGAC/nmb2b-client-js/pull/190) [`6ba2813`](https://github.com/DGAC/nmb2b-client-js/commit/6ba2813bee2694526aeb13fd9960a42fd5adb2eb) Thanks [@kouak](https://github.com/kouak)! - Update eslint + typescript + tsup

- [#187](https://github.com/DGAC/nmb2b-client-js/pull/187) [`deadbed`](https://github.com/DGAC/nmb2b-client-js/commit/deadbede4d0b2a977ab07a450348f401bfe0e3cb) Thanks [@kouak](https://github.com/kouak)! - Vitest v3.0.4

- [#191](https://github.com/DGAC/nmb2b-client-js/pull/191) [`a6a2a07`](https://github.com/DGAC/nmb2b-client-js/commit/a6a2a07d096b3543f35ad682b710e65e48755882) Thanks [@kouak](https://github.com/kouak)! - Update various dependencies

- [#193](https://github.com/DGAC/nmb2b-client-js/pull/193) [`269128f`](https://github.com/DGAC/nmb2b-client-js/commit/269128fe88a3a408c372661c5405f74e4a7e316e) Thanks [@kouak](https://github.com/kouak)! - Update dependencies

## 1.4.0

### Minor Changes

- [#163](https://github.com/DGAC/nmb2b-client-js/pull/163) [`28b3764`](https://github.com/DGAC/nmb2b-client-js/commit/28b3764f4d7a22416e787f53fbd8d754fdf876a6) Thanks [@kouak](https://github.com/kouak)! - Removed extraneous exports for old `PublishSubscribe` API from `package.json`.
  Fix invalid export for `utils` in CommonJS environment.
  Fix `package.json#repository` property.

### Patch Changes

- [#173](https://github.com/DGAC/nmb2b-client-js/pull/173) [`d2f3253`](https://github.com/DGAC/nmb2b-client-js/commit/d2f3253c8065735bc74238d7c6ace030bb57372c) Thanks [@kouak](https://github.com/kouak)! - Changesets v2.27.10

- [#169](https://github.com/DGAC/nmb2b-client-js/pull/169) [`5c35994`](https://github.com/DGAC/nmb2b-client-js/commit/5c35994156fba6bb2e25d5afae54692832864844) Thanks [@kouak](https://github.com/kouak)! - Axios v1.7.7

- [#172](https://github.com/DGAC/nmb2b-client-js/pull/172) [`d59b4c9`](https://github.com/DGAC/nmb2b-client-js/commit/d59b4c9fd100e2b3ea4ea7f6fe7bca3c7fe96621) Thanks [@kouak](https://github.com/kouak)! - Update micromatch v4.0.8 to fix CVE

- [#179](https://github.com/DGAC/nmb2b-client-js/pull/179) [`8d81e8d`](https://github.com/DGAC/nmb2b-client-js/commit/8d81e8d0643a2c103d092fff706edb40cf9ccaaa) Thanks [@kouak](https://github.com/kouak)! - vitest v2.1.8

- [#170](https://github.com/DGAC/nmb2b-client-js/pull/170) [`dab435c`](https://github.com/DGAC/nmb2b-client-js/commit/dab435cc0fb6e9808b249f9bd5f9cb6ce0fd024c) Thanks [@kouak](https://github.com/kouak)! - eslint v9.15.0, typescript 5.6.3

- [#176](https://github.com/DGAC/nmb2b-client-js/pull/176) [`efe05c5`](https://github.com/DGAC/nmb2b-client-js/commit/efe05c5b7dea4aa379c785a89a4e27590ee1088c) Thanks [@kouak](https://github.com/kouak)! - date-fns v4

- [#171](https://github.com/DGAC/nmb2b-client-js/pull/171) [`112eebd`](https://github.com/DGAC/nmb2b-client-js/commit/112eebd2e7a8abdb22faa86ed3accf8496f79010) Thanks [@kouak](https://github.com/kouak)! - Vitest v2.1.5, tsx v4.19.2, tsup v8.3.5

- [#182](https://github.com/DGAC/nmb2b-client-js/pull/182) [`61bf748`](https://github.com/DGAC/nmb2b-client-js/commit/61bf748c2d50e968d429209f38d7a079a2f75175) Thanks [@kouak](https://github.com/kouak)! - Run main tests in node 22

- [#177](https://github.com/DGAC/nmb2b-client-js/pull/177) [`de35e91`](https://github.com/DGAC/nmb2b-client-js/commit/de35e91e4028ff1320e338bf2e0968795145a45d) Thanks [@kouak](https://github.com/kouak)! - TypeScript v5.7

- [#180](https://github.com/DGAC/nmb2b-client-js/pull/180) [`e03d09b`](https://github.com/DGAC/nmb2b-client-js/commit/e03d09bba81afe0c6ebf173f2f1a9cb5edd5e7ab) Thanks [@kouak](https://github.com/kouak)! - Update dev dependencies

- [#175](https://github.com/DGAC/nmb2b-client-js/pull/175) [`a19ebe8`](https://github.com/DGAC/nmb2b-client-js/commit/a19ebe8d52f3b1341e6b8d7b894b52060ba4fad6) Thanks [@kouak](https://github.com/kouak)! - remeda v2.17.3, type-fest v4.27.0

- [#184](https://github.com/DGAC/nmb2b-client-js/pull/184) [`087edb5`](https://github.com/DGAC/nmb2b-client-js/commit/087edb5a5cdd960e08fa8370547ee66595a86959) Thanks [@kouak](https://github.com/kouak)! - Update remeda / type-fest

- [#181](https://github.com/DGAC/nmb2b-client-js/pull/181) [`210bfc4`](https://github.com/DGAC/nmb2b-client-js/commit/210bfc4bca80b813e97d5a0a29b8aaf5a93c30b8) Thanks [@kouak](https://github.com/kouak)! - soap v1.1.7, axios v1.7.9

## 1.3.1

### Patch Changes

- [#160](https://github.com/DGAC/nmb2b-client-js/pull/160) [`f872768`](https://github.com/DGAC/nmb2b-client-js/commit/f872768eab6cf100f2fd6a06af885ecea73506db) Thanks [@kouak](https://github.com/kouak)! - Remove unused dotenv/config import from config.ts

- [#161](https://github.com/DGAC/nmb2b-client-js/pull/161) [`fb8297d`](https://github.com/DGAC/nmb2b-client-js/commit/fb8297dcdfed25288f8a2322879871a673900fef) Thanks [@kouak](https://github.com/kouak)! - Fix tests failing when a flight returned by `queryFlightsBy*` has a non ICAO aerodrome of departure or destination

## 1.3.0

### Minor Changes

- [#158](https://github.com/DGAC/nmb2b-client-js/pull/158) [`e6a5a62`](https://github.com/DGAC/nmb2b-client-js/commit/e6a5a62ba7735497dde76ac985e20c9965d13ef3) Thanks [@kouak](https://github.com/kouak)! - soap v1.1.0

## 1.2.1

### Patch Changes

- [#156](https://github.com/DGAC/nmb2b-client-js/pull/156) [`222fb69`](https://github.com/DGAC/nmb2b-client-js/commit/222fb693705980e2e262a9026b205eb770609d7d) Thanks [@kouak](https://github.com/kouak)! - All B2B types are now exported.

  Fix `AUPSummary.notes` typing.

## 1.2.0

### Minor Changes

- [#152](https://github.com/DGAC/nmb2b-client-js/pull/152) [`efc9f0a`](https://github.com/DGAC/nmb2b-client-js/commit/efc9f0a60cd9826ab9f8ba81184e15bc707604f7) Thanks [@kouak](https://github.com/kouak)! - Safer B2B response types.

  Typings will now contain `null | undefined` when there's a risk a partial deserialization.

  A type helper `SafeB2BDeserializedResponse` is now exported, and will apply a safe type transformation to any typed exported from `@dgac/nmb2b-client/*/types`.

  See https://github.com/DGAC/nmb2b-client-js/issues/149 for more information.

## 1.1.0

### Minor Changes

- [#150](https://github.com/DGAC/nmb2b-client-js/pull/150) [`4c4ee7c`](https://github.com/DGAC/nmb2b-client-js/commit/4c4ee7c2c9fce42169d23b164260180de7e8ba3c) Thanks [@kouak](https://github.com/kouak)! - Improve type safety of B2B replies when objects are potentially empty.

  See https://github.com/DGAC/nmb2b-client-js/issues/149

## 1.0.2

### Patch Changes

- [#148](https://github.com/DGAC/nmb2b-client-js/pull/148) [`fe6925e`](https://github.com/DGAC/nmb2b-client-js/commit/fe6925ed2c4ea90f1f22cc48377094b856e064b9) Thanks [@kouak](https://github.com/kouak)! - remeda 2.5.0

- [#142](https://github.com/DGAC/nmb2b-client-js/pull/142) [`88d709b`](https://github.com/DGAC/nmb2b-client-js/commit/88d709b83f0142c1fc9cc49860aa5c1416e2ceaa) Thanks [@kouak](https://github.com/kouak)! - Fix FlightPlan mandatory properties which were actually optional

- [#147](https://github.com/DGAC/nmb2b-client-js/pull/147) [`79101c2`](https://github.com/DGAC/nmb2b-client-js/commit/79101c20a3a87d138cb4978c75fd12a334e51480) Thanks [@kouak](https://github.com/kouak)! - Add node 22 to CI runs

- [#146](https://github.com/DGAC/nmb2b-client-js/pull/146) [`df77006`](https://github.com/DGAC/nmb2b-client-js/commit/df7700655cedbe236d5bde3d86b983477011b5dd) Thanks [@kouak](https://github.com/kouak)! - tar v7.4.0

- [#145](https://github.com/DGAC/nmb2b-client-js/pull/145) [`70fce3e`](https://github.com/DGAC/nmb2b-client-js/commit/70fce3e327d0d973cdc69b5b815be75b026e34a4) Thanks [@kouak](https://github.com/kouak)! - soap v1.0.4

- [#144](https://github.com/DGAC/nmb2b-client-js/pull/144) [`82ca968`](https://github.com/DGAC/nmb2b-client-js/commit/82ca96883a2e1f37b44317dc1668b8b0b50e7660) Thanks [@kouak](https://github.com/kouak)! - Update multiple dev dependencies:
  - pnpm v9.5.0
  - changesets v2.27.7
  - prettier v3.3.2
  - eslint v9.6.0
  - tsx v4.16.2
  - typescript v5.5.3
  - rimraf v5.0.9
  - @types/node v18.19.39
  - vitest v2.0.2

## 1.0.1

### Patch Changes

- [#140](https://github.com/DGAC/nmb2b-client-js/pull/140) [`8b4c7a3`](https://github.com/DGAC/nmb2b-client-js/commit/8b4c7a3bdce6c291c98082190b48fb85e2f4139b) Thanks [@kouak](https://github.com/kouak)! - Fix Flight.slotSwapCounter typings

## 1.0.0

### Minor Changes

- [#139](https://github.com/DGAC/nmb2b-client-js/pull/139) [`1067b17`](https://github.com/DGAC/nmb2b-client-js/commit/1067b17f7d0188dfc1fc9af1c0dd4a7c5115ac54) Thanks [@kouak](https://github.com/kouak)! - Implement publish package.json script

- [#136](https://github.com/DGAC/nmb2b-client-js/pull/136) [`aa307b4`](https://github.com/DGAC/nmb2b-client-js/commit/aa307b48443e5ea5b6bec569c84c3cb0153ca012) Thanks [@kouak](https://github.com/kouak)! - Implement changesets
