/* @flow */
import { makeB2BClient } from '..';
import b2bOptions from '../tests/options';
import { inspect } from 'util';

async function main() {
  // $FlowFixMe
  const clients = await makeB2BClient(b2bOptions);

  console.log(
    // Object.keys(
    clients.Flow.__soapClient.wsdl.definitions.services.MeasuresService,
    // ),
  );

  console.log(
    inspect(
      Object.getOwnPropertyNames(
        clients.Flow.__soapClient.describe().MeasuresService.MeasuresPort
          .queryRegulations.output.data.regulations['item[]'].location,
      ),
      { depth: null },
    ),
  );
}

main();
