import { AssertionError } from 'node:assert';
import type { ExpectStatic } from 'vitest';
import type { B2BClient } from '../../src/index.js';
import { FixtureArtifacts, type FixtureLocation } from './artifacts.js';

type B2BService = keyof B2BClient;
type B2BServiceMethod<TService extends B2BService> = keyof B2BClient[TService] &
  string;

export type B2BMethodResult<
  TService extends B2BService,
  TMethod extends B2BServiceMethod<TService>,
> = B2BClient[TService][TMethod] extends (
  ...args: never[]
) => Promise<infer TResult>
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

export type FixtureSetupFn<TVariables> = (
  client: B2BClient,
) => Promise<TVariables>;
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
  setup<TNewVars>(
    fn: FixtureSetupFn<TNewVars>,
  ): IFixtureDefined<TNewVars, TResult>;
  run(
    fn: FixtureRunFn<TVariables, TResult>,
  ): IFixtureRunnable<TVariables, TResult>;
}

export interface IFixtureDefined<TVariables, TResult> {
  describe(text: string): this;
  run(
    fn: FixtureRunFn<TVariables, TResult>,
  ): IFixtureRunnable<TVariables, TResult>;
}

export interface IFixtureRunnable<TVariables, TResult> {
  test(name: string, fn: FixtureTestFn<TVariables, TResult>): this;
}

/**
 * Public interface for the Runner/Recorder
 */
export interface FixtureDefinition<
  TB2BService extends B2BService,
  TVariables,
  TResult,
> {
  service: TB2BService;
  method: string;
  description: string;
  setupRecording?: FixtureSetupFn<TVariables>;
  executeOperation?: FixtureRunFn<TVariables, TResult>;
  tests: Array<{ name: string; fn: FixtureTestFn<TVariables, TResult> }>;
}

/**
 * The final Fixture object consumed by the runner.
 * It also acts as its own builder via interface casting.
 */
export class Fixture<
  TB2BService extends B2BService = B2BService,
  TVariables = unknown,
  TResult = unknown,
>
  implements
    IFixtureInitial<TVariables, TResult>,
    IFixtureDefined<TVariables, TResult>,
    IFixtureRunnable<TVariables, TResult>,
    FixtureDefinition<TB2BService, TVariables, TResult>
{
  /**
   * Used by the recorder to access the correct internal SOAP client.
   */
  public readonly service: TB2BService;
  /**
   * Used by the recorder to identify the method being tested.
   */
  public readonly method: B2BServiceMethod<TB2BService>;

  public description: string;

  public setupRecording?: FixtureSetupFn<TVariables>;
  public executeOperation?: FixtureRunFn<TVariables, TResult>;

  public readonly tests: Array<{
    name: string;
    fn: FixtureTestFn<TVariables, TResult>;
  }>;

  constructor(info: {
    service: TB2BService;
    method: B2BServiceMethod<TB2BService>;
  }) {
    this.service = info.service;
    this.method = info.method;
    this.description = `${info.service}.${info.method}`;
    this.tests = [];
  }

  describe(text: string): this {
    this.description = text;
    return this;
  }

  setup<TNewVars>(
    fn: FixtureSetupFn<TNewVars>,
  ): IFixtureDefined<TNewVars, TResult> {
    (
      this as unknown as Fixture<TB2BService, TNewVars, TResult>
    ).setupRecording = fn;
    return this as unknown as Fixture<TB2BService, TNewVars, TResult>;
  }

  run(
    fn: FixtureRunFn<TVariables, TResult>,
  ): IFixtureRunnable<TVariables, TResult> {
    this.executeOperation = fn;
    return this as unknown as IFixtureRunnable<TVariables, TResult>;
  }

  test(name: string, fn: FixtureTestFn<TVariables, TResult>): this {
    this.tests.push({ name, fn });
    return this;
  }
}

/**
 *
 * Assert something is a valid Fixture.
 *
 * @remarks
 *
 * `assert(fixture instanceof Fixture)` will refine `fixture` to `Fixture<any, any, any>`
 * This will refine `fixture` to `Fixture`, which defaults to `Fixture<B2BService, unknown, unknown>`.
 */
export function assertIsFixture(
  fixture: unknown,
  message: string = 'Not a Fixture instance',
): asserts fixture is Fixture {
  if (!(fixture instanceof Fixture)) {
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
): IFixtureInitial<never, B2BMethodResult<TService, TMethod>> {
  return new Fixture<TService, never, B2BMethodResult<TService, TMethod>>(info);
}

export function expectSnapshot<TVariables, TResult>(): FixtureTestFn<
  TVariables,
  TResult
> {
  return async ({ expect, fixtureLocation, result }) => {
    const artifacts = new FixtureArtifacts(fixtureLocation);
    await expect(result).toMatchFileSnapshot(artifacts.snapshotPath);
  };
}
