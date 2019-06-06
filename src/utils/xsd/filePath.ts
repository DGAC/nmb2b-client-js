import request from 'request';
import { fromEnv } from '../../security';
import dotenv from 'dotenv';
import path from 'path';
import moment from 'moment';
import { timeFormatWithSeconds } from '../timeFormats';
import { B2B_VERSION, B2BFlavour } from '../../constants';
import { getEndpoint } from '../../config';
import { Security } from '../../security';
import d from '../debug';
const debug = d('wsdl-downloader');

const makeQuery = ({ version }: { version: string }) => `
<soap:Envelope
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:generalinformation="eurocontrol/cfmu/b2b/GeneralinformationServices"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
>
  <soap:Header />
  <soap:Body>
    <generalinformation:NMB2BWSDLsRequest>
      <sendTime>${moment.utc().format(timeFormatWithSeconds)}</sendTime>
      <version>${version}</version>
    </generalinformation:NMB2BWSDLsRequest>
  </soap:Body>
</soap:Envelope>
`;

export async function requestFilename({
  flavour,
  security,
  xsdEndpoint,
}: {
  flavour: B2BFlavour;
  security: Security;
  xsdEndpoint?: string;
}): Promise<string> {
  if (xsdEndpoint) {
    return xsdEndpoint;
  }

  if (!!security && 'apiKeyId' in security) {
    throw new Error(
      'Should never happen, config.xsdEndpoint should be defined',
    );
  }

  const options = { agentOptions: security };

  return new Promise((resolve, reject) => {
    request.post(
      {
        ...options,
        timeout: 15 * 1000,
        url: getEndpoint({ flavour }),
        body: makeQuery({ version: B2B_VERSION }),
      },
      (e, r, body) => {
        if (e) {
          return reject(e);
        }

        if (r.statusCode !== 200) {
          return reject(r);
        }

        debug(`B2B Reponse body is:\n${body}`);
        const matches = body.match(/<id>(.+)<\/id>/);

        if (!matches || !matches[1]) {
          reject(
            new Error(`Could not extract WSDL tarball file from B2B response`),
          );
          return;
        }

        resolve(matches[1]);
      },
    );
  });
}
