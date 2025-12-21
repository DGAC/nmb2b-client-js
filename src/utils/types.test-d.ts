import { describe, test, expectTypeOf } from 'vitest';
import type { SoapDeserializer, EmptyObjectToNullish } from './types.ts';

describe('EmptyObjectToNullish', () => {
  test('should not modify an object with a required key', () => {
    type Input = { foo: string };
    type T = EmptyObjectToNullish<Input>;

    expectTypeOf<T>().toEqualTypeOf<Input>();
  });

  test('should not modify an object with a required key and an optional key', () => {
    type Input = { foo: string; bar?: string };
    type T = EmptyObjectToNullish<Input>;

    expectTypeOf<T>().toEqualTypeOf<Input>();
  });

  test('should modify an object with a key which can be undefined', () => {
    type Input = { foo: string | undefined };
    type T = EmptyObjectToNullish<Input>;

    expectTypeOf<T>().toEqualTypeOf<Input | null | undefined>();
  });

  test('should add undefined to an object with all optional keys', () => {
    type Input = {
      foo?: string;
      bar: undefined | string;
      baz?: { foo: string };
    };
    type T = EmptyObjectToNullish<Input>;

    expectTypeOf<T>().toEqualTypeOf<Input | null | undefined>();
  });
});

describe('SoapDeserializer', () => {
  test('should keep scalars', () => {
    type T = SoapDeserializer<{ foo: string }>;

    expectTypeOf<{ foo: string }>().toEqualTypeOf<T>();
  });

  test('should collapse object with all optional properties to undefined', () => {
    type T = SoapDeserializer<{ foo?: string }>;

    expectTypeOf<undefined | null | { foo?: string }>().toEqualTypeOf<T>();
  });

  test('should preserve Date objects', () => {
    type T = SoapDeserializer<{ foo?: Date; bar: Date }>;

    expectTypeOf<{ foo?: Date; bar: Date }>().toEqualTypeOf<T>();
  });

  test('should collapse multiple level deep', () => {
    type T = SoapDeserializer<{ foo: Array<string> }>;
    // type T = SoapDeserializer<{ foo: { bar: { baz: Array<string> } } }>;

    expectTypeOf<null>().toMatchTypeOf<T>();
  });

  test('should collapse nested objects recursively', () => {
    type T = SoapDeserializer<{
      foo: { bar?: string };
      second?: { first?: string };
    }>;

    expectTypeOf<null>().toMatchTypeOf<T>();
  });

  test('should collapse arrays', () => {
    type T = SoapDeserializer<{
      foo: Array<string>;
    }>;

    expectTypeOf<null>().toMatchTypeOf<T>();
  });

  test('should keep non optional objects in array', () => {
    type T = SoapDeserializer<{
      foo: Array<{ opt?: string; required: string }>;
    }>;

    expectTypeOf<{
      foo: Array<{ required: string }> | null;
    }>().toMatchTypeOf<T>();
  });
});
