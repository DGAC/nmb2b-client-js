import { fromPartial } from '@total-typescript/shoehorn';
import { delay, http, HttpResponse } from 'msw';
import { randomUUID } from 'node:crypto';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import { beforeEach, test } from 'vitest';
import { createMockArchive } from '../../../tests/utils.js';
import { server } from '../../../tests/utils/msw.js';
import { getFileUrl } from '../../config.js';
import { B2B_VERSION } from '../../constants.js';
import { createDir as mkdirp } from '../fs.js';
import { download } from './index.js';

const OUTPUT_DIR = path.join('/tmp', `b2b-client-test-${randomUUID()}`);

beforeEach(async () => {
  await mkdirp(OUTPUT_DIR);
  return async () => {
    await rm(OUTPUT_DIR, { force: true, recursive: true });
  };
});

test('should prevent concurrent downloads', async () => {
  const flavour = 'PREOPS';
  const filePath = 'test.tar.gz';

  const root = new URL(getFileUrl(filePath, { flavour }));

  const archive = await createMockArchive({
    [`${B2B_VERSION}/foo.json`]: JSON.stringify({ foo: 'bar' }),
  });

  server.use(
    http.get(root.origin + '/*', async () => {
      await delay(500);
      return new HttpResponse(archive, {
        headers: {
          'Content-Type': 'application/gzip',
        },
      });
    }),
    http.post(
      `${root.origin}/B2B_${flavour}/gateway/spec/${B2B_VERSION}`,
      () => {
        return HttpResponse.xml(`
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
`);
      },
    ),
  );

  await Promise.all([
    download(
      fromPartial({
        flavour,
        XSD_PATH: OUTPUT_DIR,
      }),
    ),

    download(
      fromPartial({
        flavour,
        XSD_PATH: OUTPUT_DIR,
      }),
    ),
  ]);
});
