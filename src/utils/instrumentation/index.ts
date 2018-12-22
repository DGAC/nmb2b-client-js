// import withLog from './withLog';
import { SoapOptions } from '../../soap';
import { withLog } from './withLog';
import { compose } from 'ramda';

type SoapQuery<Input, Output> = (
  input?: Input,
  options?: SoapOptions,
) => Promise<Output>;

export type Instrumentor<Input, Output> = (
  fn: SoapQuery<Input, Output>,
) => SoapQuery<Input, Output>;

export function instrument<Input, Output>({
  service,
  query,
}: {
  service: string;
  query: string;
}) {
  return (fn: SoapQuery<Input, Output>) =>
    compose(withLog<Input, Output>(`${service}:${query}`))(fn);
}
