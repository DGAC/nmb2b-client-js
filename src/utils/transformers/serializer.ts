import { types } from './types';
import { compose, identity, evolve, map } from 'ramda';

export function prepareSerializer<T>(schema: any): (input: T) => T {
  const transformer = prepareTransformer(schema);
  return compose(
    // (obj) => {
    //   console.log(JSON.stringify(obj, null, 2));
    //   return obj;
    // },
    transformer ? evolve(transformer) : identity,
    reorderKeys(schema),
  ) as any as (input: T) => T;
}

function reduceXSDType(str: string): string {
  return str.split('|')[0];
}

interface Schema {
  [k: string]: string | Schema;
}

interface Transformer {
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
      const type = reduceXSDType(schema[curr] as string);

      if ((types as any)[type] && (types as any)[type].input) {
        const transformer = (types as any)[type].input;
        return { ...prev, [key]: isArray ? map(transformer) : transformer };
      }
    } else if (typeof schema[curr] === 'object') {
      const subItem = prepareTransformer(schema[curr] as Schema);
      if (subItem) {
        return { ...prev, [key]: isArray ? map(evolve(subItem)) : subItem };
      }
    }

    return prev;
  }, null);
}

export function reorderKeys<T extends Schema, O extends { [key: string]: any }>(
  schema: T,
): (obj: O) => O {
  return (obj: O): O => {
    // console.log(JSON.stringify(schema, null, 2));
    // console.log(JSON.stringify(obj, null, 2));

    // Loop through schema, pull property from Object
    return Object.keys(schema).reduce((prev, curr) => {
      const lookupKey: string = curr.replace(/\[\]$/, '');
      const isArrayExpected: boolean = curr.slice(-2) === '[]';

      if (!(lookupKey in obj)) {
        return prev;
      }

      const currSchema = schema[curr];

      if (typeof currSchema === 'string') {
        prev[lookupKey] = obj[lookupKey];
        return prev;
      }

      if (typeof currSchema === 'object') {
        if (
          Object.keys(currSchema).filter(
            (k) => k !== 'targetNSAlias' && k !== 'targetNamespace',
          ).length
        ) {
          prev[lookupKey] =
            isArrayExpected && obj[lookupKey] && Array.isArray(obj[lookupKey])
              ? obj[lookupKey].map(reorderKeys(currSchema))
              : reorderKeys(currSchema)(obj[lookupKey]);
          return prev;
        }

        prev[lookupKey] = obj[lookupKey];
        return prev;
      }

      return prev;
    }, {} as any);
  };
}
