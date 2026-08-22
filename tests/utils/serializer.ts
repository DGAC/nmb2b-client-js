/**
 * Extracted from https://github.com/dominictarr/json-buffer
 *
 * This helper provides custom JSON serialization to preserve `Buffer` and `Date` objects.
 * Standard `JSON.stringify` converts Buffers to generic objects and Dates to strings, losing the original type.
 * This implementation uses a replacer/reviver to encode these types with prefixes (':base64:', ':date:')
 * and restore them as correct instances during parsing.
 *
 * Additionally, to prevent conflicts with the special prefixes, any string that does not match the
 * `Buffer` or `Date` encoding patterns is itself prefixed with a single colon during serialization.
 * During parsing, this single colon prefix is removed, effectively un-escaping the string.
 */

const SERIALIZERS = [
  createSerDe({
    prefix: ':date:',
    isType: (v) => v instanceof Date,
    serialize: (v) => v.toISOString(),
    deserialize: (v) => new Date(v),
  }),
];

export function stringify(o: unknown): string {
  return JSON.stringify(o, function replacer(key, value) {
    /**
     * We use `this[key]` instead of the `value` argument to access the raw object instance.
     * The `value` argument receives the result *after* any `.toJSON()` transformation (e.g., Date objects become strings).
     * By accessing `this[key]`, we can perform type checks on the original instance.
     *
     * Note: `this` will never be undefined or null here.
     * Even if we stringify a primitive (`JSON.stringify('foo')`), `this` will be `{ '': "foo" }`.
     */
    const val = (this as Record<string, unknown>)[key];

    for (const type of SERIALIZERS) {
      const serialized = type.trySerialize(val);
      if (serialized !== undefined) {
        return serialized;
      }
    }

    if (typeof val === 'string') {
      return `:${val}`;
    }

    return value as unknown;
  });
}

// oxlint-disable-next-line typescript/no-unnecessary-type-parameters
export function parse<V = unknown>(jsonString: string): V {
  return JSON.parse(jsonString, function reviver(_key, value: unknown) {
    if (typeof value === 'string') {
      for (const type of SERIALIZERS) {
        const deserialized = type.deserialize(value);

        if (deserialized !== undefined) {
          return deserialized;
        }
      }

      return value.startsWith(':') ? value.substring(1) : value;
    }

    return value;
  }) as V;
}

type SerDeDefinition<TType, TPrefix extends string> = {
  prefix: TPrefix;
  isType: (v: unknown) => v is TType;
  serialize: (v: NoInfer<TType>) => string;
  deserialize: (input: string) => NoInfer<TType>;
};

type SerDe<TType, TPrefix extends string> = {
  prefix: TPrefix;
  trySerialize: (value: unknown) => string | undefined;
  deserialize: (value: string) => TType | undefined;
};

function createSerDe<TType, TPrefix extends string>(
  serDe: SerDeDefinition<TType, TPrefix>,
): SerDe<TType, TPrefix> {
  function serializeWithPrefix(input: unknown) {
    if (!serDe.isType(input)) {
      return;
    }

    const serialized = serDe.serialize(input);

    return `${serDe.prefix}${serialized}`;
  }

  function deserializeFromPrefix(input: string) {
    if (!input.startsWith(serDe.prefix)) {
      return;
    }

    const withoutPrefix = input.substring(serDe.prefix.length);

    return serDe.deserialize(withoutPrefix);
  }

  return {
    prefix: serDe.prefix,
    trySerialize: serializeWithPrefix,
    deserialize: deserializeFromPrefix,
  };
}
