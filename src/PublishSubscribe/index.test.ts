import { makePublishSubscribeClient } from '..';
import b2bOptions from '../../tests/options';
jest.setTimeout(20000);

test('should create PublishSubscribeClient', async () => {
  await expect(makePublishSubscribeClient(b2bOptions)).resolves.toBeDefined();
});
