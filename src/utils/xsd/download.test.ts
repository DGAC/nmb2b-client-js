import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import nock from 'nock';
import path from 'node:path';
import { rimraf } from 'rimraf';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { getFileUrl } from '../../config.ts';
import { B2B_VERSION } from '../../constants.ts';
import { createDir as mkdirp } from '../fs.ts';
import { downloadFile } from './downloadFile.ts';
import { fromPartial } from '@total-typescript/shoehorn';

const TEST_FILE = path.join(__dirname, '../../../tests/test.tar.gz');
const OUTPUT_DIR = path.join('/tmp', `b2b-client-test-${randomUUID()}`);

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

    await downloadFile(
      filePath,
      fromPartial({
        flavour,
        XSD_PATH: OUTPUT_DIR,
      }),
    );

    // Expect that a B2B has been made
    expect(scope.isDone()).toBe(true);

    const outputFile = path.join(OUTPUT_DIR, `${B2B_VERSION}/foo.json`);
    const obj = JSON.parse(fs.readFileSync(outputFile, { encoding: 'utf8' }));
    expect(obj.foo).toEqual('bar');
  });

  test('with an http error', async () => {
    const flavour = 'PREOPS';
    const filePath = 'test.tar.gz';
    nock(getFileUrl(filePath, { flavour }))
      .get(/test.tar.gz/)
      .reply(503);

    expect.assertions(2);

    try {
      await downloadFile(
        filePath,
        fromPartial({
          flavour,
          XSD_PATH: OUTPUT_DIR,
        }),
      );
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect((err as Error).message).toMatch(/Unable.*WSDL.*/);
    }
  });
});
