# Design Document: Auto-Discovery Fixture Framework

## 1. Overview

We are implementing a robust, auto-discovery based testing framework for the B2B SOAP Client. The goal is to separate the "Recording" phase (against real B2B API) from the "Testing" phase (deterministic, offline), while providing a zero-boilerplate developer experience.

## 2. Core Architecture

### 2.1. Concepts

- **Fixture**: A self-contained scenario defining how to fetch data (setup), how to execute the request (run), and how to validate the result (assertions).
- **Auto-Discovery**: Domain-specific test runners scan for fixture definition files and register them automatically with Vitest.
- **Sidecar Artifacts**: Recorded data (context, network mocks, snapshots) are stored in a dedicated folder next to the fixture definition.
- **Network Isolation**: Uses `msw` (Mock Service Worker) to intercept SOAP requests at the `http` module level.

### 2.2. Technology Stack

- **Test Runner**: Vitest (configured with `unit` and `e2e` projects).
- **Network Mocking**: `msw` (configured in `tests/utils/msw.ts`).
- **Snapshotting**: Vitest File Snapshots (`toMatchFileSnapshot`).
- **Execution**: `tsx` for recording scripts.

## 3. Fixture Definition API

We use a fluent "Builder" pattern to define fixtures in `src/<Domain>/__fixtures__/*.ts`.

### 3.1. Example

```typescript
import { defineFixture } from '../../tests/utils/fixtures.js';

export const nominal = defineFixture<MyVariables>('Flight.retrieveFlight')
  .description('Retrieve a flight by IFPL ID')
  .setup(async (client) => {
    // Phase 1: RECORDING ONLY
    const flight = await findLiveFlight(client);
    return { flightId: flight.id };
  })
  .run(async (client, variables) => {
    // Phase 2: RECORDING & TESTING
    return client.Flight.retrieveFlight({
      flightId: variables.flightId,
    });
  })
  .test('matches snapshot', async ({ expectSnapshot, result }) => {
    // Phase 3: TESTING ONLY
    await expectSnapshot(result);
  });
```

## 4. File Structure

Artifacts are grouped in a folder named after the source file.

```text
src/Flight/__fixtures__/
├── retrieveFlight.ts                 # Source Definition
└── retrieveFlight/                   # Artifacts Directory
    ├── nominal.context.json          # Input Variables + Meta (Time)
    ├── nominal.mock.xml              # SOAP Response (MSW)
    └── nominal.result.json           # Output Snapshot
```

## 5. Implementation Strategy

### 5.1. The Fixture Builder (`tests/utils/fixtures.ts`)

The `Fixture` class stores steps (`setup`, `run`, `tests`) and provides a typed fluent API. It's used to export fixture definitions that the runner can understand.

### 5.2. The Recorder Script (`scripts/update-fixtures.ts`)

Executed via `pnpm tsx scripts/update-fixtures.ts`:

1.  **Discovery**: Scans `src/**/__fixtures__/*.ts`.
2.  **Execution Loop**:
    - Initialize real `B2BClient` using `TEST_B2B_OPTIONS`.
    - Run `.setup(realClient)` -> Capture `variables`.
    - Save `.context.json` with `meta.mockDate`.
    - Run `.run(realClient, variables)`.
    - Capture the raw SOAP response and save to `.mock.xml`.

### 5.3. The Test Runner (`tests/utils/runner.ts`)

A helper `registerAutoTests(modules)` that iterates over fixtures and for each:

- Reads `.context.json` and calls `vi.setSystemTime()`.
- Reads `.mock.xml` and registers an `msw` handler for `SOAP_ENDPOINT`.
- Executes `.run()` with the mock client and stored variables.
- Runs all `.test()` assertions.

### 5.4. Domain Test Entry Point (`src/Flight/retrieveFlight.test.ts`)

```typescript
import { registerAutoTests } from '../../tests/utils/runner.js';

const fixtures = import.meta.glob('./__fixtures__/*.ts', { eager: true });

describe('Flight Fixtures', () => {
  registerAutoTests(fixtures);
});
```

## 6. MSW Configuration

The project is already configured to use MSW for unit tests.

### 6.1. Setup (`tests/setupMsw.ts`)

```typescript
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './utils/msw.js';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 6.2. Server Utility (`tests/utils/msw.ts`)

```typescript
import { setupServer } from 'msw/node';
import { getSoapEndpoint } from '../../src/config.js';
import { MOCK_B2B_ENDPOINT } from '../constants.js';

export const server = setupServer();
export const SOAP_ENDPOINT = getSoapEndpoint({
  endpoint: MOCK_B2B_ENDPOINT,
});
```
