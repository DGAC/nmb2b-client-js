/* oxlint-disable typescript/no-explicit-any */
/* oxlint-disable typescript/no-unsafe-return */
/* oxlint-disable typescript/no-unsafe-argument */
/* oxlint-disable typescript/no-unsafe-assignment */
/* oxlint-disable typescript/no-unsafe-member-access */
import { evolve, map } from 'remeda';
import { assert } from '../assert.ts';
import { types } from './types.ts';

export function prepareSerializer<T extends Record<string, unknown>>(
  schema: unknown,
): (input: T) => T {
  assertIsValidSchema(schema);

  const fixKeyOrder = createKeyOrderTransformer<T>(schema);
  const transformer = prepareTransformer(schema);

  return function serialize(input: T): T {
    const withCorrectKeyOrder = fixKeyOrder(input);

    if (!transformer) {
      return withCorrectKeyOrder;
    }

    return evolve(withCorrectKeyOrder, transformer as any) as T;
  };
}

function reduceXSDType(str: string): string {
  return str.split('|')[0] ?? str;
}

export interface Schema {
  [k: string]: string | Schema;
}

interface Transformer {
  // oxlint-disable-next-line typescript/no-redundant-type-constituents
  [k: string]: (input: any) => any | Transformer;
}

function prepareTransformer(schema: Schema): null | Transformer {
  return Object.keys(schema).reduce((prev: null | Transformer, curr) => {
    let key = curr;
    let isArray = false;

    /**
     * If the current key marks an array, we need to map over the values instead of just trying
     * to transform the value.
     *
     * We also need to assign the correct key to the transformer.
     */
    if (curr.endsWith('[]')) {
      key = curr.slice(0, -2);
      isArray = true;
    }

    if (typeof schema[curr] === 'string') {
      const type = reduceXSDType(schema[curr]);

      if ((types as any)[type]?.input) {
        const transformer = (types as any)[type].input;
        return { ...prev, [key]: isArray ? map(transformer) : transformer };
      }
    } else if (typeof schema[curr] === 'object') {
      const subItem = prepareTransformer(schema[curr]);
      if (subItem) {
        return {
          ...prev,
          [key]: isArray ? map(evolve(subItem)) : subItem,
        };
      }
    }

    return prev;
  }, null);
}

export function createKeyOrderTransformer<O extends Record<string, unknown>>(schema: Schema) {
  return function reorderSchemas(obj: O): O {
    // Loop through schema, pull property from Object
    return Object.keys(schema).reduce<any>((prev, curr) => {
      const lookupKey = curr.replace(/\[\]$/, '');
      const isArrayExpected = curr.endsWith('[]');

      if (typeof obj !== 'object' || !(lookupKey in obj)) {
        return prev;
      }

      const currSchema = schema[curr];

      if (typeof currSchema === 'string') {
        prev[lookupKey] = obj[lookupKey];
        return prev;
      }

      if (typeof currSchema === 'object') {
        const candidatesKey = Object.keys(currSchema).filter(
          (k) => k !== 'targetNSAlias' && k !== 'targetNamespace',
        );

        /**
         * This branch should never happen.
         * It means that the schema is of this form :
         * ```typescript
         * const schema = {
         *   targetNSAlias: 'xxx',
         *   targetNamespace: 'yyy',
         *   // No other key
         * }
         * ```
         *
         * `node-soap` should collapse this type of schema into a string.
         */
        if (candidatesKey.length === 0) {
          prev[lookupKey] = obj[lookupKey];
          return prev;
        }

        /**
         * If the value to transform is either null or undefined,
         * do nothing.
         */
        if (obj[lookupKey] === null || obj[lookupKey] === undefined) {
          prev[lookupKey] = obj[lookupKey];
          return prev;
        }

        const transformer = createKeyOrderTransformer(currSchema);

        /**
         * If the value to transform is an array, apply
         * the transformation to each item.
         */
        if (isArrayExpected && Array.isArray(obj[lookupKey])) {
          prev[lookupKey] = obj[lookupKey].map(transformer);
          return prev;
        }

        /**
         * At this point, the value to transform is an object, and we
         * need to apply a level a recursion.
         */
        prev[lookupKey] = transformer(obj[lookupKey] as Record<string, unknown>);
        return prev;
      }

      return prev;
    }, {});
  };
}

export function assertIsValidSchema(input: unknown): asserts input is Schema {
  assert(typeof input === 'object' && input !== null && !Array.isArray(input));

  for (const value of Object.values(input)) {
    if (typeof value === 'string') {
      continue;
    }

    assertIsValidSchema(value);
  }
}
