import { inspect } from 'util';
import { makeFlowClient } from '..';
import moment from 'moment';
import b2bOptions from '../../tests/options';
import { knownConfigurationsToMap } from './retrieveSectorConfigurationPlan';
import { FlowService } from '.';
import { JestAssertionError } from 'expect';
jest.setTimeout(20000);

const conditionalTest = (global as any).__DISABLE_B2B_CONNECTIONS__
  ? test.skip
  : test;
const xconditionalTest = xtest;

let Flow: FlowService;
beforeAll(async () => {
  Flow = await makeFlowClient(b2bOptions);
});

describe('retrieveSectorConfigurationPlan', () => {
  conditionalTest('LFEERMS', async () => {
    try {
      const res = await Flow.retrieveSectorConfigurationPlan({
        dataset: { type: 'OPERATIONAL' },
        day: moment.utc().toDate(),
        airspace: 'LFEECTAN',
      });

      expect(res.data.plan.knownConfigurations).toBeDefined();
      expect(res.data.plan.nmSchedule).toBeDefined();
      expect(res.data.plan.clientSchedule).toBeDefined();
      const { knownConfigurations, nmSchedule, clientSchedule } = res.data.plan;

      if (!knownConfigurations || !nmSchedule || !clientSchedule) {
        // Should never happen
        return;
      }

      expect(Array.isArray(nmSchedule.item)).toBe(true);
      expect(Array.isArray(clientSchedule.item)).toBe(true);
      expect(Array.isArray(knownConfigurations.item)).toBe(true);

      for (const conf of knownConfigurations.item) {
        expect(conf).toMatchObject({
          key: expect.any(String),
          value: {
            item: expect.anything(),
          },
        });
      }

      // Test that we can generate a valid map
      const map = knownConfigurationsToMap(res.data.plan.knownConfigurations);

      const keys = Array.from(map.keys());
      expect(keys.length).toBeGreaterThan(0);
      for (const k of keys) {
        expect(k).toEqual(expect.any(String));
      }

      const values = Array.from(map.values());
      expect(values.length).toBeGreaterThan(0);
      for (const v of values) {
        expect(Array.isArray(v)).toBe(true);
      }

      const testSchedule = (conf: any) => {
        expect(conf).toMatchObject({
          applicabilityPeriod: {
            wef: expect.any(Date),
            unt: expect.any(Date),
          },
          dataSource: expect.any(String),
          // sectorConfigurationId: expect.any(String),
        });

        if (conf.sectorConfigurationId) {
          expect(keys).toContain(conf.sectorConfigurationId);
        }
      };

      for (const conf of nmSchedule.item) {
        testSchedule(conf);
      }

      for (const conf of clientSchedule.item) {
        testSchedule(conf);
      }
    } catch (err) {
      if (err instanceof JestAssertionError) {
        throw err;
      }

      console.log(inspect(err, { depth: 4 }));
      throw err;
    }
  });
});
