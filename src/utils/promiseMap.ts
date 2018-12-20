/* @flow */

type Unpromise<T extends Promise<any>> = T extends Promise<infer U> ? U : never;

async function promiseMap<M extends { [key: string]: Promise<any> }>(
  promiseMap: M,
): Promise<{ [P in keyof M]: Unpromise<M[P]> }> {
  try {
    const promises = await Promise.all(Object.values(promiseMap));
    let objMapped: any = {};

    Object.keys(promiseMap).forEach((key, i) => {
      objMapped[key] = promises[i];
    });

    return objMapped;
  } catch (err) {
    return Promise.reject(err);
  }
}

export default promiseMap;