import { makePublishSubscribeClient } from '..';
import b2bOptions from '../../tests/options';
import { test, expect } from 'vitest';

test('should create PublishSubscribeClient', async () => {
  await expect(makePublishSubscribeClient(b2bOptions)).resolves.toBeDefined();
});
