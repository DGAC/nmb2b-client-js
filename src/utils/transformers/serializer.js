/* @flow */
import moment from 'moment';
import { types } from './types';
import { compose, identity, evolve } from 'ramda';

export function prepareSerializer(schema: any) {
  const transformer = prepareTransformer(schema);
  return compose(
    transformer ? evolve(transformer) : identity,
    reorderKeys(schema),
  );
}

function reduceXSDType(string): string {
  return string.split('|')[0];
}

type Schema = {
  [k: string]: string | Schema,
};

function prepareTransformer(schema: Schema): ?Object {
  return Object.keys(schema).reduce((prev, curr) => {
    if (typeof schema[curr] === 'string') {
      const type = reduceXSDType(schema[curr]);
      if (types[type] && types[type].input) {
        return Object.assign({}, prev, { [curr]: types[type].input });
      }
    } else if (typeof schema[curr] === 'object') {
      const subItem = prepareTransformer(schema[curr]);
      if (subItem) {
        return Object.assign({}, prev, {
          [curr]: subItem,
        });
      }
    }

    return prev;
  }, null);
}

export function reorderKeys(schema: Schema): Object => Object {
  return (obj: Object) => {
    // console.log(JSON.stringify(schema, null, 2));
    // console.log(JSON.stringify(obj, null, 2));

    // Loop through schema, pull property from Object
    return Object.keys(schema).reduce((prev, curr) => {
      const key: string = curr.replace(/\[\]$/, '');


      if (!(key in obj)) {
        return prev;
      }

      if (typeof schema[curr] === 'string') {
        prev[key] = obj[key];
        return prev;
      }

      if (typeof schema[curr] === 'object') {
        const currSchema = schema[curr];

        if (
          Object.keys(currSchema).filter(
            k => k !== 'targetNSAlias' && k !== 'targetNamespace',
          ).length
        ) {

          prev[key] = reorderKeys(currSchema)(obj[key]);
          return prev;
        }

        prev[key] = obj[key];
        return prev;
      }

      return prev;
    }, {});
  };
}
