type Primitive = null | undefined | string | number | boolean | symbol | bigint;

export type SoapDeserializer<TInput> = TInput extends Primitive | Date
  ? TInput
  : TInput extends Array<infer T>
    ? Array<Exclude<SoapDeserializer<T>, null | undefined>> | null | undefined
    : EmptyObjectToNullish<{
        [TKey in keyof TInput]: SoapDeserializer<TInput[TKey]>;
      }>;

export type EmptyObjectToNullish<T extends object> =
  Exclude<keyof T, NullishKeysOf<T>> extends never ? T | null | undefined : T;

type NullishKeysOf<T extends object> = UndefinedKeysOf<T> | NullKeysOf<T> | OptionalKeysOf<T>;

type UndefinedKeysOf<T extends object> = keyof {
  [TKey in keyof T as undefined extends T[TKey] ? TKey : never]: T[TKey];
};

type NullKeysOf<T extends object> = keyof {
  [TKey in keyof T as null extends T[TKey] ? TKey : never]: T[TKey];
};

/**
 * NOTE: Pulled from `type-fest`
 */
type OptionalKeysOf<Type extends object> = Type extends unknown // For distributing `Type`
  ? keyof {
      [Key in keyof Type as IsOptionalKeyOf<Type, Key> extends false ? never : Key]: never;
    } &
      keyof Type // Intersect with `keyof Type` to ensure result of `OptionalKeysOf<Type>` is always assignable to `keyof Type`
  : never; // Should never happen

type IsOptionalKeyOf<Type extends object, Key extends keyof Type> =
  IsAny<Type | Key> extends true
    ? never
    : Key extends keyof Type
      ? Type extends Record<Key, Type[Key]>
        ? false
        : true
      : false;

type IsAny<T> = 0 extends 1 & NoInfer<T> ? true : false;

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

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
