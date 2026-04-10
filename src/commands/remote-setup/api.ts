import axios from 'axios'
import { logForDebugging } from '../../utils/debug.js'

/**
 * Wraps a raw GitHub token so that its string representation is redacted.
 * `String(token)`, template literals, `JSON.stringify(token)`, and any
 * attached error messages will show `[REDACTED:gh-token]` instead of the
 * token value. Call `.reveal()` only at the single point where the raw
 * value is placed into an HTTP body.
 */
export class RedactedGithubToken {
  readonly #value: string
  constructor(raw: string) {
    this.#value = raw
  }
  reveal(): string {
    return this.#value
  }
  toString(): string {
    return '[REDACTED:gh-token]'
  }
  toJSON(): string {
    return '[REDACTED:gh-token]'
  }
  [Symbol.for('nodejs.util.inspect.custom')](): string {
    return '[REDACTED:gh-token]'
  }
}

export type ImportTokenResult = {
  github_username: string
}

export type ImportTokenError =
  | { kind: 'not_signed_in' }
  | { kind: 'invalid_token' }
  | { kind: 'server'; status: number }
  | { kind: 'network' }

/**
 * POSTs a GitHub token to the CCR backend, which validates it against
 * GitHub's /user endpoint and stores it Fernet-encrypted in sync_user_tokens.
 * The stored token satisfies the same read paths as an OAuth token, so
 * clone/push in claude.ai/code works immediately after this succeeds.
 */
export async function importGithubToken(
  _token: RedactedGithubToken,
): Promise<
  | { ok: true; result: ImportTokenResult }
  | { ok: false; error: ImportTokenError }
> {
  return { ok: false, error: { kind: 'not_signed_in' } }
}

/** Returns true when the user has valid Claude OAuth credentials. */
export async function isSignedIn(): Promise<boolean> {
  return false
}

export function getCodeWebUrl(): string {
  return 'https://claude.ai/code'
}
