import { AssertionError } from 'node:assert';
import type { RequestHandler } from 'msw';
import type { ExpectStatic } from 'vitest';
import type { B2BClient } from '../../src/index.ts';
import { FixtureArtifacts, type FixtureLocation } from './artifacts.ts';

type B2BService = keyof B2BClient;
type B2BServiceMethod<TService extends B2BService> = keyof B2BClient[TService] & string;

declare const recordedBrand: unique symbol;

/**
 * A SOAP request exactly as sent during fixture recording. Only produced by the fixture harness.
 */
export interface RecordedRequest {
  readonly [recordedBrand]: 'request';
  /**
   * The SOAP envelope, byte for byte.
   */
  readonly body: string;
}

/**
 * A B2B reply, as received during fixture recording. Only produced by the fixture harness.
 */
export interface RecordedReply {
  readonly [recordedBrand]: 'reply';
  /**
   * The raw reply, served as is to the deserializer on replay.
   */
  readonly body: string;
}

/**
 * Identifies a recorded exchange within a fixture scenario; part of its fixture artifact file names.
 */
export type RecordedExchangeId = string;

/**
 * The format of a `RecordedExchangeId`, checked by fixture recording.
 */
export const RECORDED_EXCHANGE_ID = /^[a-z][a-zA-Z0-9]*$/;

/**
 * A recorded exchange: a SOAP request sent during fixture recording and the B2B reply.
 */
export interface RecordedExchange {
  readonly request: RecordedRequest;
  readonly reply: RecordedReply;
}

/**
 * A recorded exchange during fixture replay, with the MSW handler that serves its reply.
 */
export interface ReplayedExchange extends RecordedExchange {
  /**
   * Serves the recorded reply once, to a request byte-identical to the recorded request.
   */
  readonly handler: RequestHandler;
}

/**
 * What `.run()` returns: its result, and the recorded exchanges returned by its `recordExchange()` calls.
 */
export interface FixtureRunOutcome<TResult> {
  result: TResult;
  exchanges: Record<RecordedExchangeId, RecordedExchange>;
}

/**
 * What `.run()` receives from fixture recording and fixture replay, each with its own `recordExchange`.
 */
export interface FixtureRunContext {
  /**
   * Records the single SOAP call made by `call` as the recorded exchange `id`.
   */
  recordExchange: <Id extends RecordedExchangeId, T>(
    id: Id,
    call: () => Promise<T>,
  ) => Promise<{ result: T; exchanges: Record<Id, RecordedExchange> }>;
}

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
  /**
   * The recorded exchanges returned by `.run()`, as replayed; empty when it returns none.
   */
  exchanges: Record<RecordedExchangeId, ReplayedExchange>;
  fixtureLocation: FixtureLocation;
  variables: TVariables;
}

export type FixtureSetupFn<TVariables> = (client: B2BClient) => Promise<TVariables>;
export type FixtureRunFn<TVariables, TResult> = (
  client: B2BClient,
  variables: TVariables,
  context: FixtureRunContext,
) => Promise<FixtureRunOutcome<TResult>>;
export type FixtureTestFn<TVariables, TResult> = (
  ctx: FixtureTestContext<TVariables, TResult>,
) => Promise<void> | void;

/**
 * Builder interfaces to enforce call order and mandatory run().
 */
export interface IFixtureInitial<TVariables> {
  describe(text: string): this;
  setup<TNewVars>(fn: FixtureSetupFn<TNewVars>): IFixtureDefined<TNewVars>;
  run<TResult>(fn: FixtureRunFn<TVariables, TResult>): IFixtureRunnable<TVariables, TResult>;
}

export interface IFixtureDefined<TVariables> {
  describe(text: string): this;
  run<TResult>(fn: FixtureRunFn<TVariables, TResult>): IFixtureRunnable<TVariables, TResult>;
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
export class Fixture<TB2BService extends B2BService = B2BService, TVariables = unknown>
  implements IFixtureInitial<TVariables>, IFixtureDefined<TVariables>
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

  setup<TNewVars>(fn: FixtureSetupFn<TNewVars>): IFixtureDefined<TNewVars> {
    (this as unknown as Fixture<TB2BService, TNewVars>).setupRecording = fn;
    return this as unknown as Fixture<TB2BService, TNewVars>;
  }

  run<TResult>(fn: FixtureRunFn<TVariables, TResult>): IFixtureRunnable<TVariables, TResult> {
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
>(info: FixtureServiceMethod<TService, TMethod>): IFixtureInitial<undefined> {
  // Without `.setup()`, the scenario's variables are `undefined`.
  return new Fixture<TService, undefined>(info, () => Promise.resolve(undefined));
}

export function expectSnapshot<TVariables, TResult>(): FixtureTestFn<TVariables, TResult> {
  return async ({ expect, fixtureLocation, result }) => {
    const artifacts = new FixtureArtifacts(fixtureLocation);
    await expect(result).toMatchFileSnapshot(artifacts.snapshotPath);
  };
}

/**
 * Asserts that the replay sent exactly the recorded requests: the recorded exchanges
 * returned by `.run()` are those on disk, and each of them was requested. Each replays once at most:
 * a second identical request fails the replay.
 */
export function expectRecordedRequests<TVariables, TResult>(): FixtureTestFn<TVariables, TResult> {
  return async ({ expect, fixtureLocation, exchanges }) => {
    const recorded = await new FixtureArtifacts(fixtureLocation).exchangeIds();

    expect(recorded, 'recorded exchanges on disk').not.toHaveLength(0);
    expect(Object.keys(exchanges).toSorted(), 'recorded exchanges returned by .run()').toEqual(
      recorded,
    );
    for (const [id, { handler }] of Object.entries(exchanges)) {
      expect(handler.isUsed, `recorded exchange "${id}" never requested`).toBe(true);
    }
  };
}

/**
 * What fixture recording and fixture replay hand back: the variables, the scenario result
 * and its recorded exchanges.
 */
export interface FixtureOutcome<TVariables, TResult> {
  variables: TVariables;
  result: TResult;
  exchanges: Record<RecordedExchangeId, RecordedExchange>;
}
