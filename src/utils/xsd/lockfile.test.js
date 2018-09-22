/**
 * @flow
 * @jest-environment node
 */
import path from 'path';
import nock from 'nock';
import fs from 'fs';
import uuid from 'uuid';
import rimrafCb from 'rimraf';
import { promisify } from 'util';
import { createDir as mkdirp } from '../fs';
import { getFileUrl, getEndpoint } from '../../config';
import { B2B_VERSION, type B2BFlavour } from '../../constants';
import { download } from './index';
import lockfile from 'proper-lockfile';

const rimraf = promisify(rimrafCb);
const TEST_FILE = path.join(__dirname, '../../../tests/test.tar.gz');
const OUTPUT_DIR = path.join('/tmp', `b2b-client-test-${uuid.v4()}`);
const delay = d => new Promise(resolve => setTimeout(resolve, d));

beforeEach(async () => {
  await mkdirp(OUTPUT_DIR);
});

afterEach(async () => {
  await rimraf(OUTPUT_DIR);
  nock.cleanAll();
});

test('should prevent concurrent downloads', async () => {
  const flavour = 'PREOPS';
  const filePath = 'test.tar.gz';
  const scope = nock(getFileUrl(filePath, { flavour }))
    .get(/.tar.gz/)
    .once()
    .reply(200, fs.readFileSync(TEST_FILE));

  await Promise.all([
    download({
      // $FlowFixMe
      security: undefined,
      flavour,
      XSD_PATH: OUTPUT_DIR,
    }),
    // We add a 10 ms delay to prevent exact concurrency
    delay(10).then(() =>
      download({
        // $FlowFixMe
        security: undefined,
        flavour,
        XSD_PATH: OUTPUT_DIR,
      }),
    ),
  ]);
});
