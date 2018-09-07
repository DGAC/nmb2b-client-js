/* @flow */

type Input = {
  [key: any]: Promise<any>,
};

export default (async function promiseMap<M: Input>(
  promiseMap: M,
): Promise<$ObjMap<M, <T>(propValue: Promise<T> | T) => T>> {
  try {
    const promises = await Promise.all(Object.values(promiseMap));
    let objMapped = {};

    Object.keys(promiseMap).forEach((key, i) => {
      objMapped[key] = promises[i];
    });

    return objMapped;
  } catch (err) {
    return Promise.reject(err);
  }
});
