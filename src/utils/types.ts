export type SoapDeserializer<TInput> = TInput extends Primitive | Date
  ? TInput
  : TInput extends Array<infer T>
    ? Array<Exclude<SoapDeserializer<T>, null | undefined>> | null | undefined
    : EmptyObjectToNullish<{
        [TKey in keyof TInput]: SoapDeserializer<TInput[TKey]>;
      }>;

export type EmptyObjectToNullish<T extends object> =
  Exclude<keyof T, NullishKeysOf<T>> extends never
    ? T | null | undefined
    : T;

type NullishKeysOf<T extends object> =
  | UndefinedKeysOf<T>
  | NullKeysOf<T>
  | OptionalKeysOf<T>;

type UndefinedKeysOf<T extends object> = keyof {
  [TKey in keyof T as undefined extends T[TKey] ? TKey : never]: T[TKey];
};

type NullKeysOf<T extends object> = keyof {
  [TKey in keyof T as null extends T[TKey] ? TKey : never]: T[TKey];
};

// type UndefinedKeysToOptionals<T extends object> =
/**
 * Type helper to recursively make potentially empty objects nullable.
 *
 * {@see https://github.com/DGAC/nmb2b-client-js/issues/149}
 */
// export type SoapDeserializerOld<TInput> =
//   /**
//    * If TInput is a Date, Set, Map, string or number, do nothing
//    */
//   NonNullable<TInput> extends Date | string | number | boolean
//     ? TInput
//     : NonNullable<TInput> extends NMSet<infer T>
//       ? NMSet<SoapDeserializer<T>> | null
//       : NonNullable<TInput> extends NMMap<infer TKey, infer TValue>
//         ? NMMap<SoapDeserializer<TKey>, SoapDeserializer<TValue>> | null
//         : NonNullable<TInput> extends NMList<infer T>
//           ? NMList<SoapDeserializer<T>> | null
//           : NonNullable<TInput> extends Array<infer T>
//             ? Array<SoapDeserializer<T>> | undefined | null
//             : /**
//                * If an empty object is assignable to TInput, then make it nullable.
//                * Recursively map over TInput properties
//                */
//               TInput extends object
//               ? HasRequiredKeys<TInput> extends true
//                 ? {
//                     [TKey in keyof TInput]: SoapDeserializer<TInput[TKey]>;
//                   }
//                 :
//                     | {
//                         [TKey in keyof TInput]: SoapDeserializer<TInput[TKey]>;
//                       }
//                     | null
//                     | undefined
//               : never;

import type { OptionalKeysOf, Primitive } from 'type-fest';
