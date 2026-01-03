import type { B2BClient } from '../../src/index.js';
import type { ExpectStatic } from 'vitest';

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

export class Fixture<TVariables = any, TResult = any> {
  public _description?: string;
  public _setup?: FixtureSetupFn<TVariables>;
  public _run?: FixtureRunFn<TVariables, TResult>;
  public _tests: Array<{ name: string; fn: FixtureTestFn<TResult> }> = [];

  constructor(public readonly serviceMethod: string) {}

  description(text: string): this {
    this._description = text;
    return this;
  }

  setup(fn: FixtureSetupFn<TVariables>): this {
    this._setup = fn;
    return this;
  }

  run(fn: FixtureRunFn<TVariables, TResult>): this {
    this._run = fn;
    return this;
  }

  test(name: string, fn: FixtureTestFn<TResult>): this {
    this._tests.push({ name, fn });
    return this;
  }
}

export function defineFixture<TVariables = any, TResult = any>(
  serviceMethod: string,
) {
  return new Fixture<TVariables, TResult>(serviceMethod);
}
