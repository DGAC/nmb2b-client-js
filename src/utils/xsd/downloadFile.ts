import { getFileUrl } from '../../config';
import { B2BFlavour } from '../../constants';
import { Security } from '../../security';
import request from 'request';
import tar from 'tar';
import d from '../debug';
const debug = d('wsdl-downloader');

export async function downloadFile(
  filePath: string,
  {
    flavour,
    security,
    outputDir,
  }: {
    flavour: B2BFlavour;
    security: Security;
    outputDir: string;
  },
): Promise<void> {
  return new Promise((resolve, reject) => {
    const r = request
      .get({
        agentOptions: security,
        timeout: 15 * 1000,
        url: getFileUrl(filePath, { flavour }),
      })
      .on('response', (response: any) => {
        debug(`downloading to ${outputDir}`);
        debug(`B2B reponse status code is ${response.statusCode}`);
        if (response.statusCode && response.statusCode !== 200) {
          debug('Rejecting due to wrong status code (%d)', response.statusCode);
          reject(
            new Error(
              `Unable to download B2B WSDL files, statusCode is ${
                response.statusCode
              }`,
            ),
          );
          r.abort();
        }
      })
      .on('error', (err: any) => {
        debug('Rejecting due to error event', err);
        reject(err);
      });

    r.pipe(tar.x({ cwd: outputDir }))
      .on('error', reject)
      .on('close', () => {
        debug('Downloaded and extracted WSDL files');
        resolve();
      });
  });
}
