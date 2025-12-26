import { UTCDateMini } from '@date-fns/utc';
import axios from 'axios';
import { format } from 'date-fns';
import { getEndpoint, getFileUrl } from '../../config.js';
import type { B2BFlavour } from '../../constants.js';
import { B2B_VERSION } from '../../constants.js';
import type { Security } from '../../security.js';
import { timeFormatWithSeconds } from '../timeFormats.js';
import { createAxiosConfig } from './createAxiosConfig.js';

const makeQuery = ({ version }: { version: string }) => `
<soap:Envelope
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:generalinformation="eurocontrol/cfmu/b2b/GeneralinformationServices"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
>
  <soap:Header />
  <soap:Body>
    <generalinformation:NMB2BWSDLsRequest>
      <sendTime>${format(new UTCDateMini(), timeFormatWithSeconds)}</sendTime>
      <version>${version}</version>
    </generalinformation:NMB2BWSDLsRequest>
  </soap:Body>
</soap:Envelope>
`;

export async function getWSDLDownloadURL({
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

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!!security && 'apiKeyId' in security) {
    throw new Error(
      'Should never happen, config.xsdEndpoint should be defined',
    );
  }

  const res = await axios<string>({
    url: getEndpoint({ flavour }),
    method: 'POST',
    data: makeQuery({ version: B2B_VERSION }),
    responseType: 'text',
    ...createAxiosConfig({ security }),
  });

  const matches = /<id>(.+)<\/id>/.exec(res.data);

  if (!matches?.[1]) {
    throw new Error(`Could not extract WSDL tarball file from B2B response`);
  }

  return getFileUrl(matches[1], { flavour });
}
