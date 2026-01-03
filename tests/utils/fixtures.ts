import type { B2BClient } from '../../src/index.js';
import type { ExpectStatic } from 'vitest';

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
  expectSnapshot: (data: unknown) => Promise<void>;
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
 * The final Fixture object consumed by the runner.
 */
export class Fixture<TVariables = unknown, TResult = unknown> {
  public _description: string;
  public _setup?: FixtureSetupFn<TVariables>;
  public _run?: FixtureRunFn<TVariables, TResult>;
  public _tests: Array<{ name: string; fn: FixtureTestFn<TResult> }> = [];

  constructor(public readonly info: { service: B2BService; method: string }) {
    this._description = `${info.service}.${info.method}`;
  }
}

/**
 * Builder interfaces to enforce call order and mandatory run().
 */
export interface IFixtureInitial<TVariables, TResult> {
  description(text: string): this;
  setup<TNewVars>(
    fn: FixtureSetupFn<TNewVars>,
  ): IFixtureDefined<TNewVars, TResult>;
  run(fn: FixtureRunFn<TVariables, TResult>): IFixtureRunnable<TResult>;
}

export interface IFixtureDefined<TVariables, TResult> {
  description(text: string): this;
  run(fn: FixtureRunFn<TVariables, TResult>): IFixtureRunnable<TResult>;
}

export interface IFixtureRunnable<TResult> {
  test(name: string, fn: FixtureTestFn<TResult>): this;
}

class FixtureBuilder<TVariables = never, TResult = unknown>
  implements
    IFixtureInitial<TVariables, TResult>,
    IFixtureDefined<TVariables, TResult>,
    IFixtureRunnable<TResult>
{
  private readonly fixture: Fixture;

  constructor(info: { service: B2BService; method: string }) {
    this.fixture = new Fixture(info);
  }

  description(text: string): this {
    this.fixture._description = text;
    return this;
  }

  setup<TNewVars>(
    fn: FixtureSetupFn<TNewVars>,
  ): IFixtureDefined<TNewVars, TResult> {
    this.fixture._setup = fn;
    return this as unknown as IFixtureDefined<TNewVars, TResult>;
  }

  run(fn: FixtureRunFn<TVariables, TResult>): IFixtureRunnable<TResult> {
    this.fixture._run = fn as FixtureRunFn<unknown, unknown>;
    return this as unknown as IFixtureRunnable<TResult>;
  }

  test(name: string, fn: FixtureTestFn<TResult>): this {
    this.fixture._tests.push({ name, fn: fn as FixtureTestFn<unknown> });
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
  return new FixtureBuilder<never, B2BMethodResult<TService, TMethod>>(info);
}
