import { SoapOptions } from '../../soap';
import { withLog } from './withLog';
import { piped } from 'remeda';

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
    piped(withLog<Input, Output>(`${service}:${query}`))(fn);
}
