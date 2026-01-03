import type { B2BClient } from '../../src/index.js';
import type { ExpectStatic } from 'vitest';
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
export interface FixtureTestContext<TResult> {
  expect: ExpectStatic;
  result: TResult;
  fixtureLocation: FixtureLocation;
}

export type FixtureSetupFn<TVariables> = (
  client: B2BClient,
) => Promise<TVariables>;
export type FixtureRunFn<TVariables, TResult> = (
  client: B2BClient,
  variables: TVariables,
) => Promise<TResult>;
export type FixtureTestFn<TResult> = (
  ctx: FixtureTestContext<TResult>,
) => Promise<void> | void;

/**
 * Builder interfaces to enforce call order and mandatory run().
 */
export interface IFixtureInitial<TVariables, TResult> {
  describe(text: string): this;
  setup<TNewVars>(
    fn: FixtureSetupFn<TNewVars>,
  ): IFixtureDefined<TNewVars, TResult>;
  run(fn: FixtureRunFn<TVariables, TResult>): IFixtureRunnable<TResult>;
}

export interface IFixtureDefined<TVariables, TResult> {
  describe(text: string): this;
  run(fn: FixtureRunFn<TVariables, TResult>): IFixtureRunnable<TResult>;
}

export interface IFixtureRunnable<TResult> {
  test(name: string, fn: FixtureTestFn<TResult>): this;
}

/**
 * Public interface for the Runner/Recorder
 */
export interface FixtureDefinition<TVariables, TResult> {
  service: B2BService;
  method: string;
  description: string;
  setupRecording?: FixtureSetupFn<TVariables>;
  executeOperation?: FixtureRunFn<TVariables, TResult>;
  tests: Array<{ name: string; fn: FixtureTestFn<TResult> }>;
}

/**
 * The final Fixture object consumed by the runner.
 * It also acts as its own builder via interface casting.
 */
export class Fixture<TVariables = unknown, TResult = unknown>
  implements
    IFixtureInitial<TVariables, TResult>,
    IFixtureDefined<TVariables, TResult>,
    IFixtureRunnable<TResult>,
    FixtureDefinition<TVariables, TResult>
{
  /**
   * Used by the recorder to access the correct internal SOAP client.
   */
  public readonly service: B2BService;
  /**
   * Used by the recorder to identify the method being tested.
   */
  public readonly method: string;

  public description: string;

  public setupRecording?: FixtureSetupFn<TVariables>;
  public executeOperation?: FixtureRunFn<TVariables, TResult>;

  public readonly tests: Array<{ name: string; fn: FixtureTestFn<TResult> }>;

  constructor(info: { service: B2BService; method: string }) {
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
    (this as unknown as Fixture<TNewVars, TResult>).setupRecording = fn;
    return this as unknown as Fixture<TNewVars, TResult>;
  }

  run(fn: FixtureRunFn<TVariables, TResult>): IFixtureRunnable<TResult> {
    this.executeOperation = fn;
    return this as unknown as IFixtureRunnable<TResult>;
  }

  test(name: string, fn: FixtureTestFn<TResult>): this {
    this.tests.push({ name, fn });
    return this;
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
  return new Fixture<never, B2BMethodResult<TService, TMethod>>(info);
}

export function expectSnapshot<TResult>(): FixtureTestFn<TResult> {
  return async ({ expect, fixtureLocation, result }) => {
    const artifacts = new FixtureArtifacts(fixtureLocation);
    await expect(result).toMatchFileSnapshot(artifacts.snapshotPath);
  };
}
