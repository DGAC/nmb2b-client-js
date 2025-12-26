import { fromPartial } from '@total-typescript/shoehorn';
import nock from 'nock';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, assert, beforeEach, describe, expect, test } from 'vitest';
import { getFileUrl } from '../../config.js';
import { B2B_VERSION } from '../../constants.js';
import { createDir as mkdirp } from '../fs.js';
import { downloadFile } from './downloadFile.js';

const TEST_FILE = path.join(__dirname, '../../../tests/test.tar.gz');
const OUTPUT_DIR = path.join('/tmp', `b2b-client-test-${randomUUID()}`);

beforeEach(async () => {
  await mkdirp(OUTPUT_DIR);
  return async () => {
    await rm(OUTPUT_DIR, { force: true, recursive: true });
  };
});

afterEach(() => {
  nock.cleanAll();
});

describe(downloadFile, () => {
  describe('when the remote server responds with a gzipped tar archive', () => {
    test('should download and extract the content of the archive', async () => {
      const flavour = 'PREOPS';
      const filePath = 'test.tar.gz';
      const scope = nock(getFileUrl(filePath, { flavour }))
        .get(/test.tar.gz/)
        .reply(200, fs.readFileSync(TEST_FILE));

      await downloadFile(
        filePath,
        fromPartial({
          flavour,
          XSD_PATH: OUTPUT_DIR,
        }),
      );

      expect(scope.isDone()).toBe(true);

      const outputFile = path.join(OUTPUT_DIR, `${B2B_VERSION}/foo.json`);
      const obj = JSON.parse(fs.readFileSync(outputFile, { encoding: 'utf8' }));
      expect(obj.foo).toEqual('bar');
    });
  });

  describe('when the remote server responds with an http error', () => {
    test('should throw an error', async () => {
      const flavour = 'PREOPS';
      const filePath = 'test.tar.gz';
      nock(getFileUrl(filePath, { flavour }))
        .get(/test.tar.gz/)
        .reply(503);

      try {
        await downloadFile(
          filePath,
          fromPartial({
            flavour,
            XSD_PATH: OUTPUT_DIR,
          }),
        );
        expect.unreachable('downloadFile() should have thrown an error');
      } catch (err) {
        assert.instanceOf(err, Error);
        expect(err.message).toMatch(/Unable.*WSDL.*/);
      }
    });
  });

  describe('when the remote server responds with an invalid content-type', () => {
    test('should throw a clear error (e.g. HTML proxy error)', async () => {
      const flavour = 'PREOPS';
      const filePath = 'test.tar.gz';

      nock(getFileUrl(filePath, { flavour }))
        .get(/test.tar.gz/)
        .reply(200, '<html><body>Bad Gateway</body></html>', {
          'content-type': 'text/html; charset=utf-8',
        });

      try {
        await downloadFile(
          filePath,
          fromPartial({
            flavour,
            XSD_PATH: OUTPUT_DIR,
          }),
        );
        expect.unreachable('downloadFile() should have thrown an error');
      } catch (err) {
        assert.instanceOf(err, Error);
        expect(err.message).toMatch(/Invalid Content-Type/);
      }
    });
  });
});
