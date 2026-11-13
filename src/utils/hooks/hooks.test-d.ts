import { describe, expectTypeOf, test } from 'vitest';

import type { AirspaceService } from '../../Airspace/index.ts';
import type { B2BRequest, Reply } from '../../Common/types.ts';
import type { FlightService } from '../../Flight/index.ts';
import type { FlightPlanListReply, FlightPlanListRequest } from '../../Flight/types.ts';
import type { FlowService } from '../../Flow/index.ts';
import type { GeneralInformationService } from '../../GeneralInformation/index.ts';
import type { WithInjectedSendTime } from '../internals.ts';
import type { ExtractQueryDefinitions } from '../soap-query-definition.ts';
import {
  createHook,
  type OnRequestErrorParameters,
  type OnRequestStartParameters,
  type OnRequestSuccessParameters,
  type SoapQueryHook,
} from './hooks.ts';

describe('createHook', () => {
  test('should accept a hook typed with `string` and `unknown`', () => {
    expectTypeOf<
      (hookParameters: { service: string; query: string; input: unknown }) => {
        onRequestSuccess: (hookParameters: {
          service: string;
          query: string;
          response: unknown;
        }) => void;
      }
    >().toExtend<SoapQueryHook>();
  });

  describe('onRequestStart', () => {
    test('should type `input` as the request of the narrowed query, before sendTime injection', () => {
      createHook(({ service, query, input }) => {
        if (service === 'Flight' && query === 'queryFlightPlans') {
          expectTypeOf(input).toEqualTypeOf<WithInjectedSendTime<FlightPlanListRequest>>();
        }

        return undefined;
      });
    });

    test('should type `input` as a request without narrowing', () => {
      createHook(({ input }) => {
        expectTypeOf(input).toExtend<WithInjectedSendTime<B2BRequest>>();

        return undefined;
      });
    });
  });

  describe('onRequestSuccess', () => {
    test('should type `response` as the OK reply of the narrowed query', () => {
      createHook(() => ({
        onRequestSuccess: ({ service, query, response }) => {
          if (service === 'Flight' && query === 'queryFlightPlans') {
            expectTypeOf(response).toEqualTypeOf<FlightPlanListReply & { status: 'OK' }>();
          }
        },
      }));
    });

    test('should type `response` as a reply without narrowing', () => {
      createHook(() => ({
        onRequestSuccess: ({ response }) => {
          expectTypeOf(response).toExtend<Reply>();
        },
      }));
    });
  });

  describe('onRequestError', () => {
    test('should narrow on `service` and `query`', () => {
      createHook(() => ({
        onRequestError: (parameters) => {
          if (parameters.service === 'Flight' && parameters.query === 'queryFlightPlans') {
            expectTypeOf(parameters).toEqualTypeOf<{
              service: 'Flight';
              query: 'queryFlightPlans';
              error: Error;
            }>();
          }
        },
      }));
    });
  });
});

describe('hook parameters', () => {
  test('should reject a query that the service does not have', () => {
    expectTypeOf<{
      service: 'Flight';
      query: 'queryRegulations';
      input: WithInjectedSendTime<B2BRequest>;
    }>().not.toExtend<OnRequestStartParameters>();
  });

  test('should reject an unknown service', () => {
    expectTypeOf<{
      service: 'Unknown';
      query: 'queryFlightPlans';
      response: Reply & { status: 'OK' };
    }>().not.toExtend<OnRequestSuccessParameters>();
  });

  test('should cover every Airspace query', () => {
    expectTypeOf<
      Extract<OnRequestStartParameters, { service: 'Airspace' }>['query']
    >().toEqualTypeOf<keyof ExtractQueryDefinitions<AirspaceService>>();
  });

  test('should cover every Flight query', () => {
    expectTypeOf<
      Extract<OnRequestSuccessParameters, { service: 'Flight' }>['query']
    >().toEqualTypeOf<keyof ExtractQueryDefinitions<FlightService>>();
  });

  test('should cover every Flow query', () => {
    expectTypeOf<Extract<OnRequestErrorParameters, { service: 'Flow' }>['query']>().toEqualTypeOf<
      keyof ExtractQueryDefinitions<FlowService>
    >();
  });

  test('should cover every GeneralInformation query', () => {
    expectTypeOf<
      Extract<OnRequestStartParameters, { service: 'GeneralInformation' }>['query']
    >().toEqualTypeOf<keyof ExtractQueryDefinitions<GeneralInformationService>>();
  });
});
