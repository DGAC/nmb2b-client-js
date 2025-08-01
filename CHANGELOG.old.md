# v1.0.0-beta.5 (2024-06-07)

- NMB2B v27.0.0
- Attach the current configuration to the service definition : `xxxxService.config`.
- Remove moment.js, move to `date-fns`
- Update dependencies
- Fix missing pkg/config export
- Implement `Flight.queryFlightsByAircraftOperator`
- Update dependencies
- Drop Node 16 support

# v1.0.0-beta.4 (2023-08-16)

- Fix types (#114), export util called `extractReferenceLocation`
- Implement `Flight.queryFlightsByAerodrome` and `Flight.queryFlightsByAerodromeSet`

# v1.0.0-beta.3 (2023-07-21)

- Fix CI publish step

# v1.0.0-beta.0

- **BREAKING** Move to ESM+CJS hybrid compilation with tsup, remove babel, rework module exports
- Switch from yarn to pnpm
- **BREAKING** Implement `NMB2BError`, which is thrown when the B2B responds with an error
- Update multiple dependencies
- Implement `Airspace.retrieveEAUP` service
- Replace `jest` by `vitest`
- Fix `RunwayConfiguration` typing (#106)

# v0.6.1 (2023-06-01)

- Fix type declaration generation

# v0.6.0 (2023-01-01)

- NM 26.0.0 support (#103)
- Update dependencies (#102)
- Drop node 12 support (#100)
- Add node 18 support (#100)
- Add updateCapacityPlan
- Add updateOTMVPlan

# v0.5.4 (2022-10-17)

- Fix NMList TypeScript type (#97)

# v0.5.3 (2022-06-02)

- Implement Flow.retrieveRunwayConfigurationPlan

# v0.5.2 (2022-02-08)

- Fix multiple serialization/deserialization issues

# v0.5.1 (2022-02-08)

- Fix typo in typings (OTMVSustained)

# v0.5.0 (2022-02-08)

# v0.5.0-rc.0 (2022-02-08)

- NM B2B v25.0.0
- Jest v27
- soap v0.42.0
- Replace `request` by `axios`

# v0.4.5 (2020-12-09)

- soap v0.35.0
- Fix TS error with TS >v4.0

# v0.4.4 (2020-04-06)

- Fix Counts typing

# v0.4.3 (2020-04-06)

- Fix OTMVThreshold deserializer

# v0.4.2 (2020-04-06)

- Fix OTMVPlans typing

# v0.4.1 (2020-03-19)

- NM B2B 23.5.0
- Update deps

# v0.3.6 (2020-02-05)

- Revert soap to 0.26.0
- Implement Flow.retrieveCapacityPlan

# v0.3.5 (2019-06-07)

- Fix typo in InputOptions type

# v0.3.4 (2019-06-07)

- Fix input options type declaration
- Fix `@types/*` dependencies

# v0.3.3 (2019-06-07)

- Works with a B2B proxy
- Update dependencies
- NM B2B 23.0.0 (#32)

# v0.3.2 (2019-05-01)

- Fix failing tests

# v0.3.1 (2019-05-01) **UNRELEASED**

- Pull WSDL file URL from B2B instead of having it hardcoded
- Restore compatibility with node 8

# v0.3.0 (2019-04-09)

- Drop compatibility with node 8 (>= 10)
- Fix compatibility with typescript 3.4

# v0.2.4 (2019-03-16)

- Fix typescript errors in test files

# v0.2.3 (2019-03-16) **UNRELEASED**

- Jest v24
- Soap v0.26.0
- Add plenty of Flow types (MDCM stuff)
- Fix ICAOPoint type
- Fix Flight.retrieveFlight reply type

# v0.2.2 (2018-12-23)

- Put all debug calls under the same namespace
- Output config in logs

# v0.2.1 (2018-12-22)

- Implement proper logging via `debug` library (scope `@dgac/nmb2b-client`)

# v0.2.0 (2018-12-21)

- Full rewrite in TypeScript

# v0.1.4 (2018-11-14)

- Fix NMB2B TLS evolution

# v0.1.3 (2018-09-22)

- Implement lockfile to handle multiple concurrent WSDL downloads

# v0.1.2 (2018-09-13)

- Fix broken WSDL download

# v0.1.1 (2018-09-10)

- Export flow types to make it easier to use with Flow

# v0.1.0 (2018-09-10)

- First usable release

# v0.0.1 (2018-09-08)

- initial import
