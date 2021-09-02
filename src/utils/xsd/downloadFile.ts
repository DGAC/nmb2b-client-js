import { getFileUrl } from '../../config';
import { B2BFlavour } from '../../constants';
import { Security } from '../../security';
import axios from 'axios';
import tar from 'tar';
import d from '../debug';
const debug = d('wsdl-downloader');
import { createAxiosConfig } from './createAxiosConfig';

export async function downloadFile(
  filePath: string,
  {
    flavour,
    security,
    XSD_PATH: outputDir,
    xsdEndpoint,
  }: {
    flavour: B2BFlavour;
    security: Security;
    XSD_PATH: string;
    xsdEndpoint?: string;
  },
): Promise<void> {
  const options = createAxiosConfig({ security });

  return new Promise(async (resolve, reject) => {
    try {
      const url = xsdEndpoint || getFileUrl(filePath, { flavour });

      debug(`Downloading ${url}`);
      const res = await axios({
        url,
        timeout: 15 * 1000,
        responseType: 'stream',
        ...options,
      });

      res.data
        .pipe(tar.x({ cwd: outputDir }))
        .on('error', reject)
        .on('close', () => {
          debug('Downloaded and extracted WSDL files');
          resolve();
        });
    } catch (err) {
      console.log(err);
      reject(new Error(`Unable to download WSDL: ${err.message}`));
    }

    //   const r = request
    //     .get({
    //       ...options,
    //       timeout: 15 * 1000,
    //       url,
    //     })
    //     .on('response', (response: any) => {
    //       debug(`downloading to ${outputDir}`);
    //       debug(`B2B reponse status code is ${response.statusCode}`);
    //       if (response.statusCode && response.statusCode !== 200) {
    //         debug('Rejecting due to wrong status code (%d)', response.statusCode);
    //         reject(
    //           new Error(
    //             `Unable to download B2B WSDL files, statusCode is ${response.statusCode}`,
    //           ),
    //         );
    //         r.abort();
    //       }
    //     })
    //     .on('error', (err: any) => {
    //       debug('Rejecting due to error event', err);
    //       reject(err);
    //     });

    //   r.pipe(tar.x({ cwd: outputDir }))
    //     .on('error', reject)
    //     .on('close', () => {
    //       debug('Downloaded and extracted WSDL files');
    //       resolve();
    //     });
  });
}
