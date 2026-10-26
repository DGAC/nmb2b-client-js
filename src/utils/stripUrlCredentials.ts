/**
 * Returns `url` without credentials: any `user:password@` is removed.
 * `'INVALID_URL'` when it is not a valid HTTP(S) URL, which could not be
 * cleaned.
 */
export function stripUrlCredentials(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return 'INVALID_URL';
  }

  // `user:secret@host` parses as a URL with the `user:` protocol.
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return 'INVALID_URL';
  }

  parsed.username = '';
  parsed.password = '';
  return parsed.toString();
}
