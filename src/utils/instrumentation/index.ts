import type { SoapOptions } from '../../soap.js';
import { withLog } from './withLog.js';
import { pipe } from 'remeda';

type SoapQuery<Input, Output> = (
  input: Input,
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
    pipe(fn, withLog<Input, Output>(`${service}:${query}`));
}
