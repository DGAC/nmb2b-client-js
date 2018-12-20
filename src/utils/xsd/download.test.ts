/**
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
import { B2B_VERSION, B2BFlavour } from '../../constants';
import { downloadFile } from './downloadFile';

const rimraf = promisify(rimrafCb);
const TEST_FILE = path.join(__dirname, '../../../tests/test.tar.gz');
const OUTPUT_DIR = path.join('/tmp', `b2b-client-test-${uuid.v4()}`);

beforeEach(async () => {
  await mkdirp(OUTPUT_DIR);
});

afterEach(async () => {
  await rimraf(OUTPUT_DIR);
  nock.cleanAll();
});

describe('downloadFile', () => {
  test('should download', async () => {
    const flavour = 'PREOPS';
    const filePath = 'test.tar.gz';
    const scope = nock(getFileUrl(filePath, { flavour }))
      .get(/test.tar.gz/)
      .reply(200, fs.readFileSync(TEST_FILE));

    await downloadFile(filePath, {
      security: undefined as any,
      flavour,
      outputDir: OUTPUT_DIR,
    });

    // Expect that a B2B has been made
    expect(scope.isDone()).toBe(true);

    const outputFile = path.join(OUTPUT_DIR, '22.0.0/foo.json');
    const obj = JSON.parse(fs.readFileSync(outputFile, { encoding: 'utf8' }));
    expect(obj.foo).toEqual('bar');
  });

  test('with an http error', async () => {
    const flavour = 'PREOPS';
    const filePath = 'test.tar.gz';
    const scope = nock(getFileUrl(filePath, { flavour }))
      .get(/test.tar.gz/)
      .reply(503);

    expect.assertions(1);
    try {
      await downloadFile(filePath, {
        security: undefined as any,
        flavour,
        outputDir: OUTPUT_DIR,
      });
    } catch (err) {
      expect(err.message).toMatch(/Unable.*WSDL.*/);
    }
  });
});