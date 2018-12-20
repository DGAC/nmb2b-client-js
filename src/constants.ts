import path from 'path';
export type B2BFlavour = 'OPS' | 'PREOPS';

export const B2B_VERSION = '22.0.0';
export const B2BFlavours = ['OPS', 'PREOPS'];

export const getWSDLPath = ({
  service,
  flavour,
  XSD_PATH,
}: {
  service: string;
  flavour: B2BFlavour;
  XSD_PATH: string;
}): string =>
  path.join(
    XSD_PATH,
    `${B2B_VERSION}/${service}_${flavour}_${B2B_VERSION}.wsdl`,
  );
