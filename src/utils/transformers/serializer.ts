import { types } from './types';
import { compose, identity, evolve } from 'ramda';

export function prepareSerializer(schema: any) {
  const transformer = prepareTransformer(schema);
  return compose(
    transformer ? evolve(transformer) : identity,
    reorderKeys(schema),
  );
}

function reduceXSDType(string: string): string {
  return string.split('|')[0];
}

type Schema = {
  [k: string]: string | Schema;
};

type Transformer = {
  [k: string]: (input: any) => any | Transformer;
};

function prepareTransformer(schema: Schema): null | Transformer {
  return Object.keys(schema).reduce((prev: null | Transformer, curr) => {
    if (typeof schema[curr] === 'string') {
      const type = reduceXSDType(schema[curr] as string);
      if ((types as any)[type] && (types as any)[type].input) {
        return Object.assign({}, prev, { [curr]: (types as any)[type].input });
      }
    } else if (typeof schema[curr] === 'object') {
      const subItem = prepareTransformer(schema[curr] as Schema);
      if (subItem) {
        return Object.assign({}, prev, {
          [curr]: subItem,
        });
      }
    }

    return prev;
  }, null);
}

export function reorderKeys<T extends Schema, O extends { [key: string]: any }>(
  schema: T,
): (obj: O) => O {
  return (obj: O) => {
    // console.log(JSON.stringify(schema, null, 2));
    // console.log(JSON.stringify(obj, null, 2));

    // Loop through schema, pull property from Object
    return Object.keys(schema).reduce(
      (prev, curr) => {
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
              k => k !== 'targetNSAlias' && k !== 'targetNamespace',
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
      },
      {} as any,
    );
  };
}
