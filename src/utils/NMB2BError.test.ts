import { expect, test } from 'vitest';

import { NMB2BError } from '../index.ts';

test('is named NMB2BError', () => {
  const error = new NMB2BError({ reply: { status: 'RESOURCE_OVERLOAD' } });

  expect(error.name).toBe('NMB2BError');
});

test('is an Error', () => {
  const error = new NMB2BError({ reply: { status: 'RESOURCE_OVERLOAD' } });

  expect(error).toBeInstanceOf(Error);
});

test.each([
  [{ status: 'RESOURCE_OVERLOAD' }, /^NMB2BError: RESOURCE_OVERLOAD\n/],
  [
    { status: 'INVALID_INPUT', reason: 'Bad flight id' },
    /^NMB2BError: INVALID_INPUT: Bad flight id\n/,
  ],
] as const)('starts its stack trace with its name and message: %o', (reply, expected) => {
  const error = new NMB2BError({ reply });

  expect(error.stack).toMatch(expected);
});

test('keeps the message and reply fields', () => {
  const requestReceptionTime = new Date('2026-01-01T00:00:00Z');
  const error = new NMB2BError({
    reply: {
      status: 'INVALID_INPUT',
      reason: 'Bad flight id',
      requestId: 'REQUEST-1',
      requestReceptionTime,
    },
  });

  expect(error.message).toBe('INVALID_INPUT: Bad flight id');
  expect(error.status).toBe('INVALID_INPUT');
  expect(error.reason).toBe('Bad flight id');
  expect(error.requestId).toBe('REQUEST-1');
  expect(error.requestReceptionTime).toBe(requestReceptionTime);
});
