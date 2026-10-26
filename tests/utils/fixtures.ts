import { AssertionError } from 'node:assert';
import type { ExpectStatic } from 'vitest';
import type { B2BClient } from '../../src/index.ts';
import { FixtureArtifacts, type FixtureLocation } from './artifacts.ts';

type B2BService = keyof B2BClient;
type B2BServiceMethod<TService extends B2BService> = keyof B2BClient[TService] & string;

export type B2BMethodResult<
  TService extends B2BService,
  TMethod extends B2BServiceMethod<TService>,
> = B2BClient[TService][TMethod] extends (...args: never[]) => Promise<infer TResult>
  ? TResult
  : unknown;

/**
 * A strictly typed object identifying a service and its method.
 */
export interface FixtureServiceMethod<
  TService extends B2BService = B2BService,
  TMethod extends B2BServiceMethod<TService> = B2BServiceMethod<TService>,
> {
  service: TService;
  method: TMethod;
}

/**
 * Context provided to fixture tests.
 */
export interface FixtureTestContext<TVariables, TResult> {
  expect: ExpectStatic;
  result: TResult;
  fixtureLocation: FixtureLocation;
  variables: TVariables;
}

export type FixtureSetupFn<TVariables> = (client: B2BClient) => Promise<TVariables>;
export type FixtureRunFn<TVariables, TResult> = (
  client: B2BClient,
  variables: TVariables,
) => Promise<TResult>;
export type FixtureTestFn<TVariables, TResult> = (
  ctx: FixtureTestContext<TVariables, TResult>,
) => Promise<void> | void;

/**
 * Builder interfaces to enforce call order and mandatory run().
 */
export interface IFixtureInitial<TVariables, TResult> {
  describe(text: string): this;
  setup<TNewVars>(fn: FixtureSetupFn<TNewVars>): IFixtureDefined<TNewVars, TResult>;
  run(fn: FixtureRunFn<TVariables, TResult>): IFixtureRunnable<TVariables, TResult>;
}

export interface IFixtureDefined<TVariables, TResult> {
  describe(text: string): this;
  run(fn: FixtureRunFn<TVariables, TResult>): IFixtureRunnable<TVariables, TResult>;
}

/**
 * A fixture scenario with its `.run()` declared: everything the fixture harness needs to run it.
 */
export interface IFixtureRunnable<TVariables, TResult> {
  readonly service: B2BService;
  readonly description: string;
  readonly setupRecording: FixtureSetupFn<TVariables>;
  readonly executeOperation: FixtureRunFn<TVariables, TResult>;
  readonly tests: ReadonlyArray<{ name: string; fn: FixtureTestFn<TVariables, TResult> }>;
  test(name: string, fn: FixtureTestFn<TVariables, TResult>): this;
}

/**
 * Builder of a fixture scenario, up to `.run()`.
 * It changes its own type parameters via interface casting.
 */
export class Fixture<
  TB2BService extends B2BService = B2BService,
  TVariables = unknown,
  TResult = unknown,
>
  implements IFixtureInitial<TVariables, TResult>, IFixtureDefined<TVariables, TResult>
{
  /**
   * Passed on to the fixture scenario: the recorder reads this service's SOAP client.
   */
  public readonly service: TB2BService;
  /**
   * Only used for the default description.
   */
  public readonly method: B2BServiceMethod<TB2BService>;

  public description: string;

  public setupRecording: FixtureSetupFn<TVariables>;

  constructor(
    info: { service: TB2BService; method: B2BServiceMethod<TB2BService> },
    setupRecording: FixtureSetupFn<TVariables>,
  ) {
    this.service = info.service;
    this.method = info.method;
    this.description = `${info.service}.${info.method}`;
    this.setupRecording = setupRecording;
  }

  describe(text: string): this {
    this.description = text;
    return this;
  }

  setup<TNewVars>(fn: FixtureSetupFn<TNewVars>): IFixtureDefined<TNewVars, TResult> {
    (this as unknown as Fixture<TB2BService, TNewVars, TResult>).setupRecording = fn;
    return this as unknown as Fixture<TB2BService, TNewVars, TResult>;
  }

  run(fn: FixtureRunFn<TVariables, TResult>): IFixtureRunnable<TVariables, TResult> {
    return new FixtureScenario(this.service, this.description, this.setupRecording, fn);
  }
}

/**
 * A fixture scenario, as returned by `.run()`: complete by construction.
 */
class FixtureScenario<TVariables, TResult> implements IFixtureRunnable<TVariables, TResult> {
  public readonly service: B2BService;
  public readonly description: string;
  public readonly setupRecording: FixtureSetupFn<TVariables>;
  public readonly executeOperation: FixtureRunFn<TVariables, TResult>;
  public readonly tests: Array<{ name: string; fn: FixtureTestFn<TVariables, TResult> }> = [];

  constructor(
    service: B2BService,
    description: string,
    setupRecording: FixtureSetupFn<TVariables>,
    executeOperation: FixtureRunFn<TVariables, TResult>,
  ) {
    this.service = service;
    this.description = description;
    this.setupRecording = setupRecording;
    this.executeOperation = executeOperation;
  }

  test(name: string, fn: FixtureTestFn<TVariables, TResult>): this {
    this.tests.push({ name, fn });
    return this;
  }
}

/**
 * Assert something is a fixture scenario built by `defineFixture(...).run(...)`.
 *
 * @remarks
 *
 * Refines `fixture` to `IFixtureRunnable<unknown, unknown>`: a module loaded at runtime
 * carries no type parameters.
 */
export function assertIsFixture(
  fixture: unknown,
  message = 'Not a fixture scenario',
): asserts fixture is IFixtureRunnable<unknown, unknown> {
  if (!(fixture instanceof FixtureScenario)) {
    throw new AssertionError({
      message,
      stackStartFn: assertIsFixture,
    });
  }
}

/**
 * Entry point for defining a new fixture.
 */
export function defineFixture<
  TService extends B2BService,
  TMethod extends B2BServiceMethod<TService>,
>(
  info: FixtureServiceMethod<TService, TMethod>,
): IFixtureInitial<undefined, B2BMethodResult<TService, TMethod>> {
  // Without `.setup()`, the scenario's variables are `undefined`.
  return new Fixture<TService, undefined, B2BMethodResult<TService, TMethod>>(info, () =>
    Promise.resolve(undefined),
  );
}

export function expectSnapshot<TVariables, TResult>(): FixtureTestFn<TVariables, TResult> {
  return async ({ expect, fixtureLocation, result }) => {
    const artifacts = new FixtureArtifacts(fixtureLocation);
    await expect(result).toMatchFileSnapshot(artifacts.snapshotPath);
  };
}

/**
 * What fixture recording and fixture replay hand back: the variables and the scenario result.
 */
export interface FixtureOutcome<TVariables, TResult> {
  variables: TVariables;
  result: TResult;
}
