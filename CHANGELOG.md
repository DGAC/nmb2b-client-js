# @dgac/nmb2b-client

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
