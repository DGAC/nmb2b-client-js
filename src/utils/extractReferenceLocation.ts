import type {
  ReferenceLocation,
  WithReferenceLocationOnPrefixOptional,
  WithReferenceLocationOnPrefix,
} from '../Airspace/types';

const keys = [
  'ReferenceLocationAirspace',
  'ReferenceLocationAerodrome',
  'ReferenceLocationAerodromeSet',
  'ReferenceLocationDbePoint',
  'ReferenceLocationPublishedPoint',
] as const;

/**
 * Extract a reference location with a given key-prefix from a reply object.
 * @param prefix Prefix of the keys of the reference location
 * @param input NMB2B object
 *
 *
 * @example
 * ```typescript
 * const input = {
 *   'protectedLocation-ReferenceLocationAirspace': { type: 'AIRSPACE', id: 'LFEEKR' },
 *   regulationId: 'FOOBAR',
 * };
 *
 * const location = extractReferenceLocation('protectedLocation', input);
 * // { type: 'AIRSPACE', id: 'LFEEKR' }
 * ```
 */
export function extractReferenceLocation<
  const TPrefix extends string,
  TInput extends WithReferenceLocationOnPrefix<TPrefix>,
>(prefix: TPrefix, input: TInput): ReferenceLocation;

/**
 * Extract a reference location with a given key-prefix from a reply object.
 * @param prefix Prefix of the keys of the reference location
 * @param input NMB2B object
 *
 *
 * @example
 * ```typescript
 * const input = {
 *   'protectedLocation-ReferenceLocationAirspace': { type: 'AIRSPACE', id: 'LFEEKR' },
 *   regulationId: 'FOOBAR',
 * };
 *
 * const location = extractReferenceLocation('protectedLocation', input);
 * // { type: 'AIRSPACE', id: 'LFEEKR' }
 * ```
 */
export function extractReferenceLocation<
  const TPrefix extends string,
  TInput extends undefined | WithReferenceLocationOnPrefixOptional<TPrefix>,
>(prefix: TPrefix, input: TInput): undefined | ReferenceLocation;

export function extractReferenceLocation<
  const TPrefix extends string,
  TInput extends
    | undefined
    | WithReferenceLocationOnPrefixOptional<TPrefix>
    | WithReferenceLocationOnPrefix<TPrefix>,
>(prefix: TPrefix, input: TInput): ReferenceLocation | undefined {
  if (!input) {
    return;
  }

  for (const k of keys) {
    const key = `${prefix}-${k}` as const;

    if (key in input) {
      return input[key as keyof TInput];
    }
  }
}
