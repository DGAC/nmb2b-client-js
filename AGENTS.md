# Directives for AI Agents

This document provides guidelines for AI (Artificial Intelligence) agents interacting with this repository.

## 1. Context & Initialization

**Before doing anything else, read the `README.md` file.**
It contains essential information about the business context (Eurocontrol NM B2B SOAP Client) that you need to understand to name variables correctly and implement business logic relevantly.

## 2. Environment Rules

- **Package Manager**: `pnpm` ONLY.
  - ❌ `npm install` or `yarn install` are STRICTLY FORBIDDEN.
  - ✅ Always use `pnpm install`.

## 3. Project Architecture

You must respect the existing modular structure:

- **Logic**: Each SOAP operation is a standalone file in its domain folder.
  - Pattern: `src/<Domain>/<Action>.ts`
  - Example: `src/Flow/retrieveOTMVPlan.ts`
- **Types**: Interfaces matching XSD definitions must be defined in the domain's types file.
  - Pattern: `src/<Domain>/types.ts`
  - Example: `src/Flow/types.ts`
- **Tests**: Tests are co-located with the source file.
  - **Unit Tests**: `src/**/*.test.ts` (Must be fully mocked, no real network calls).
  - **E2E Tests**: `src/**/*.e2e.test.ts` (Integration tests with real B2B connection).
  - **Fixtures**: Scenarios for recording and replaying SOAP interactions.
    - Pattern: `src/<Domain>/__fixtures__/<Action>.ts`
    - Sidecar Artifacts: `src/<Domain>/__fixtures__/<Action>/<scenario>.*` (JSON context, XML mock, JSON result snapshot).

## 4. Technical Conventions

### TypeScript

- **Strict Typing**: `any` is forbidden.
- **Reusability**: Use existing types exported in `src/types.ts` or define new ones in the appropriate `src/<Domain>/types.ts`.

### Testing

- **Project Separation**:
  - Use the `unit` project for logic that doesn't require a B2B connection.
  - Use the `e2e` project for integration tests.
- **Implementation Details (E2E only)**:
  - Import `shouldUseRealB2BConnection` from `tests/utils.ts`.
  - Use `test.runIf(shouldUseRealB2BConnection)` to condition tests in `*.e2e.test.ts` files.
  - Use `TEST_B2B_OPTIONS` from `tests/options.ts` to initialize clients.
- **Security**:
  - ❌ NEVER hardcode secrets or certificates in test files.
  - ✅ Always rely on `TEST_B2B_OPTIONS` which loads from environment variables.

## 5. Verification Commands

Run these commands from the project root to validate your work:

```bash
# 1. Check coding style and potential errors
pnpm lint

# 2. Check TypeScript types
pnpm typecheck

# 3. Run all tests
pnpm test --no-watch

# 4. Run unit tests only
pnpm test:unit --no-watch

# 5. Run E2E tests only
pnpm test:e2e --no-watch

# 6. Run tests for a specific file
pnpm test --no-watch <filename>

# 7. Record or update fixtures from real B2B API
pnpm update-fixtures
```

## 6. Unit Testing with Fixtures

We use a custom framework to record real API interactions and replay them deterministically in unit tests.

- **Definition**: Use `defineFixture<TVariables>(serviceMethod)` in `src/<Domain>/__fixtures__/<Action>.ts`.
  - `.describe(text)`: Mandatory. Description of the scenario.
  - `.setup()`: Optional. Only runs during recording. Used to find/prepare live data (e.g., finding a valid flight ID).
  - `.run()`: Mandatory. Logic to execute the SOAP call. Runs during recording (real API) and testing (mocked API).
  - `.test()`: One or more Vitest assertions. Use `expectSnapshot()` helper for standard snapshot validation.
- **Recording**: To capture artifacts from the real B2B API:
  ```bash
  pnpm update-fixtures
  ```
  _Requires valid B2B credentials in `.env`._
- **Registration**: Domain-level tests (`src/<Domain>/<Domain>.test.ts`) must use `registerFixtures`:

  ```typescript
  /// <reference types="vite/client" />
  import { registerFixtures } from '../../tests/utils/runner';
  import { describe } from 'vitest';

  describe('MyDomain Fixtures', async () => {
    // Load all fixtures in the directory (Eager load required)
    const fixtures = import.meta.glob('./__fixtures__/*.ts', {
      eager: true,
    });

    await registerFixtures(fixtures, import.meta.url);
  });
  ```
