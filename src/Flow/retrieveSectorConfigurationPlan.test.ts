import { inspect } from 'util';
import { assert, describe, expect, test } from 'vitest';
import { NMB2BError, makeFlowClient } from '../index.js';
import b2bOptions from '../../tests/options.js';
import { shouldUseRealB2BConnection } from '../../tests/utils.js';
import { knownConfigurationsToMap } from './retrieveSectorConfigurationPlan.js';

describe('retrieveSectorConfigurationPlan', async () => {
  const Flow = await makeFlowClient(b2bOptions);

  test.runIf(shouldUseRealB2BConnection)('LFEERMS', async () => {
    try {
      const res = await Flow.retrieveSectorConfigurationPlan({
        dataset: { type: 'OPERATIONAL' },
        day: new Date(),
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
      assert(knownConfigurations.item);

      for (const conf of knownConfigurations.item) {
        expect(conf).toMatchObject({
          key: expect.any(String),
          value: {
            item: expect.anything(),
          },
        });
      }

      // Test that we can generate a valid map
      const map = knownConfigurationsToMap(knownConfigurations);

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

      assert(nmSchedule.item);
      for (const conf of nmSchedule.item) {
        testSchedule(conf);
      }

      assert(clientSchedule.item);
      for (const conf of clientSchedule.item) {
        testSchedule(conf);
      }
    } catch (err) {
      if (err instanceof NMB2BError) {
        console.log(inspect(err, { depth: 4 }));
      }

      throw err;
    }
  });
});
