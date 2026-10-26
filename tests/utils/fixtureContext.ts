/**
 * Serialization of a fixture scenario's `context.json`: JSON, plus the `TAGGED_TYPES`, each encoded
 * as `{ "<tag>": "<encoded>" }` (`Date`s as `{ "$date": "<ISO>" }`).
 */

const TAGGED_TYPES: Record<`$${string}`, TaggedTypeCodec> = {
  $date: createTaggedTypeCodec({
    isType: (value) => value instanceof Date,
    serialize: (date) => date.toISOString(),
    deserialize: (iso) => new Date(iso),
  }),
};

export function serializeFixtureContext(context: unknown): string {
  return JSON.stringify(
    context,
    function replacer(key, value: unknown) {
      // `value` comes after `.toJSON()`, which turns a `Date` into a string: `this[key]` is the
      // original instance.
      const currentValue = (this as Record<string, unknown>)[key];

      for (const [tag, codec] of Object.entries(TAGGED_TYPES)) {
        const encoded = codec.trySerialize(currentValue);
        if (encoded !== undefined) {
          return { [tag]: encoded };
        }
      }

      return value;
    },
    2,
  );
}

export function deserializeFixtureContext(text: string): unknown {
  return JSON.parse(text, function reviver(_key, value: unknown) {
    const tagged = readTaggedObject(value);
    return tagged ? tagged.codec.deserialize(tagged.encoded) : value;
  });
}

type TaggedTypeDefinition<TTaggedType> = {
  isType: (value: unknown) => value is TTaggedType;
  serialize: (value: NoInfer<TTaggedType>) => string;
  deserialize: (encoded: string) => NoInfer<TTaggedType>;
};

type TaggedTypeCodec = {
  /**
   * The encoded value for a value of the type, `undefined` for any other.
   */
  trySerialize: (value: unknown) => string | undefined;
  deserialize: (encoded: string) => unknown;
};

function createTaggedTypeCodec<TTaggedType>({
  isType,
  serialize,
  deserialize,
}: TaggedTypeDefinition<TTaggedType>): TaggedTypeCodec {
  return {
    trySerialize: (value) => (isType(value) ? serialize(value) : undefined),
    deserialize,
  };
}

/**
 * Reads `value` as the object serialization writes for a tagged type, e.g. `{ "$date": "<ISO>" }`:
 * an object whose single key is a tag of `TAGGED_TYPES`, holding a string. `undefined` for any
 * other value.
 */
function readTaggedObject(value: unknown): { codec: TaggedTypeCodec; encoded: string } | undefined {
  if (typeof value !== 'object' || value === null) {
    return undefined;
  }

  const [entry, ...otherEntries] = Object.entries(value);
  if (entry === undefined || otherEntries.length > 0) {
    return undefined;
  }

  const [tag, encoded] = entry;
  const codec = Object.hasOwn(TAGGED_TYPES, tag)
    ? TAGGED_TYPES[tag as keyof typeof TAGGED_TYPES]
    : undefined;
  return codec && typeof encoded === 'string' ? { codec, encoded } : undefined;
}
