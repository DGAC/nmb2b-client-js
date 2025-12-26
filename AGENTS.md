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
  - Pattern: `src/<Domain>/<Action>.test.ts`

## 4. Technical Conventions

### TypeScript

- **Strict Typing**: `any` is forbidden.
- **Reusability**: Use existing types exported in `src/types.ts` or define new ones in the appropriate `src/<Domain>/types.ts`.

### Testing

- **Hybrid Mode**: Tests must support running both with mocks (default) and with a real B2B connection (if configured).
- **Implementation Details**:
  - Import `shouldUseRealB2BConnection` from `tests/utils.ts`.
  - Use `test.runIf(shouldUseRealB2BConnection)` to condition integration tests.
  - Use `TEST_B2B_CONFIG` from `tests/options.ts` to initialize clients.
- **Security**:
  - ❌ NEVER hardcode secrets or certificates in test files.
  - ✅ Always rely on `TEST_B2B_CONFIG` which loads from environment variables.

## 5. Verification Commands

Run these commands from the project root to validate your work:

```bash
# 1. Check coding style and potential errors
pnpm lint

# 2. Check TypeScript types
pnpm typecheck

# 3. Run all tests
pnpm test --no-watch

# 4. Run tests for a specific file
pnpm test --no-watch <filename>
```
