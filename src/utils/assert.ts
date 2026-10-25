import { AssertionError } from 'node:assert';

export function assert(condition: unknown, message?: string | (() => string)): asserts condition {
  if (!condition) {
    const errorMessage =
      message !== undefined
        ? `Assertion failed: ${typeof message === 'string' ? message : message()}`
        : `Assertion failed.`;
    throw new AssertionError({
      message: errorMessage,
      stackStartFn: assert,
    });
  }
}
