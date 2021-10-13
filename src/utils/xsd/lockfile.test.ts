/**
 * @jest-environment node
 */
import path from 'path';
import nock from 'nock';
import fs from 'fs';
import * as uuid from 'uuid';
import rimrafCb from 'rimraf';
import { promisify } from 'util';
import { createDir as mkdirp } from '../fs';
import { getFileUrl, getEndpoint } from '../../config';
import { B2B_VERSION, B2BFlavour } from '../../constants';
import { download } from './index';
import lockfile from 'proper-lockfile';

const rimraf = promisify(rimrafCb);
const TEST_FILE = path.join(__dirname, '../../../tests/test.tar.gz');
const OUTPUT_DIR = path.join('/tmp', `b2b-client-test-${uuid.v4()}`);
const delay = (d: number) => new Promise((resolve) => setTimeout(resolve, d));

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
    .get(/.*/)
    .once()
    .delayBody(2000)
    .reply(200, fs.readFileSync(TEST_FILE));

  const soap = nock(getFileUrl(filePath, { flavour }))
    .post(/.+/)
    .once()
    .reply(
      200,
      `
  <?xml version='1.0' encoding='utf-8'?>
  <S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/">
  <S:Body>
    <gi:NMB2BWSDLsReply xmlns:gi="eurocontrol/cfmu/b2b/GeneralinformationServices" xmlns:cm="eurocontrol/cfmu/b2b/CommonServices">
      <requestReceptionTime>2019-05-01 14:46:46</requestReceptionTime>
      <requestId>B2B_CUR:451971</requestId>
      <sendTime>2019-05-01 14:46:47</sendTime>
      <status>OK</status>
      <data>
        <file>
          <id>b2b_publications/${B2B_VERSION}/B2B_WSDL_XSD.22.5.0.3.74.tar.gz</id>
          <type>Publication</type>
          <releaseTime>2019-04-30 19:25:35</releaseTime>
          <fileLength>303725</fileLength>
          <hasAddendaErrata>false</hasAddendaErrata>
        </file>
      </data>
    </gi:NMB2BWSDLsReply>
  </S:Body>
  </S:Envelope>
`,
    );

  await Promise.all([
    download({
      security: undefined as any,
      flavour,
      XSD_PATH: OUTPUT_DIR,
    }),
    // We add a delay to prevent exact concurrency
    delay(50).then(() =>
      download({
        security: undefined as any,
        flavour,
        XSD_PATH: OUTPUT_DIR,
      }),
    ),
  ]);
});
