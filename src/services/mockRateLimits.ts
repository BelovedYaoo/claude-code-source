// Mock rate limits for testing [ANT-ONLY]
// This allows testing various rate limit scenarios without hitting actual limits
//
// ⚠️  WARNING: This is for internal testing/demo purposes only!
// The mock headers may not exactly match the API specification or real-world behavior.
// Always validate against actual API responses before relying on this for production features.

import type { SubscriptionType } from '../services/oauth/types.js'
import { setMockBillingAccessOverride } from '../utils/billing.js'
import type { OverageDisabledReason } from './claudeAiLimits.js'

type MockHeaders = {
  'anthropic-ratelimit-unified-status'?:
    | 'allowed'
    | 'allowed_warning'
    | 'rejected'
  'anthropic-ratelimit-unified-reset'?: string
  'anthropic-ratelimit-unified-representative-claim'?:
    | 'five_hour'
    | 'seven_day'
    | 'seven_day_opus'
    | 'seven_day_sonnet'
  'anthropic-ratelimit-unified-overage-status'?:
    | 'allowed'
    | 'allowed_warning'
    | 'rejected'
  'anthropic-ratelimit-unified-overage-reset'?: string
  'anthropic-ratelimit-unified-overage-disabled-reason'?: OverageDisabledReason
  'anthropic-ratelimit-unified-fallback'?: 'available'
  'anthropic-ratelimit-unified-fallback-percentage'?: string
  'retry-after'?: string
  // Early warning utilization headers
  'anthropic-ratelimit-unified-5h-utilization'?: string
  'anthropic-ratelimit-unified-5h-reset'?: string
  'anthropic-ratelimit-unified-5h-surpassed-threshold'?: string
  'anthropic-ratelimit-unified-7d-utilization'?: string
  'anthropic-ratelimit-unified-7d-reset'?: string
  'anthropic-ratelimit-unified-7d-surpassed-threshold'?: string
  'anthropic-ratelimit-unified-overage-utilization'?: string
  'anthropic-ratelimit-unified-overage-surpassed-threshold'?: string
}

let mockHeaders: MockHeaders = {}
let mockEnabled = false
let mockHeaderless429Message: string | null = null
let mockSubscriptionType: SubscriptionType | null = null
let mockFastModeRateLimitDurationMs: number | null = null
let mockFastModeRateLimitExpiresAt: number | null = null
// Default subscription type for mock testing
const DEFAULT_MOCK_SUBSCRIPTION: SubscriptionType = 'max'

// Track individual exceeded limits with their reset times
type ExceededLimit = {
  type: 'five_hour' | 'seven_day' | 'seven_day_opus' | 'seven_day_sonnet'
  resetsAt: number // Unix timestamp
}

let exceededLimits: ExceededLimit[] = []

// New approach: Toggle individual headers

// Helper to update retry-after based on current state
function updateRetryAfter(): void {
  const status = mockHeaders['anthropic-ratelimit-unified-status']
  const overageStatus =
    mockHeaders['anthropic-ratelimit-unified-overage-status']
  const reset = mockHeaders['anthropic-ratelimit-unified-reset']

  if (
    status === 'rejected' &&
    (!overageStatus || overageStatus === 'rejected') &&
    reset
  ) {
    // Calculate seconds until reset
    const resetTimestamp = Number(reset)
    const secondsUntilReset = Math.max(
      0,
      resetTimestamp - Math.floor(Date.now() / 1000),
    )
    mockHeaders['retry-after'] = String(secondsUntilReset)
  } else {
    delete mockHeaders['retry-after']
  }
}

// Update the representative claim based on exceeded limits
function updateRepresentativeClaim(): void {
  if (exceededLimits.length === 0) {
    delete mockHeaders['anthropic-ratelimit-unified-representative-claim']
    delete mockHeaders['anthropic-ratelimit-unified-reset']
    delete mockHeaders['retry-after']
    return
  }

  // Find the limit with the furthest reset time
  const furthest = exceededLimits.reduce((prev, curr) =>
    curr.resetsAt > prev.resetsAt ? curr : prev,
  )

  // Set the representative claim (appears for both warning and rejected)
  mockHeaders['anthropic-ratelimit-unified-representative-claim'] =
    furthest.type
  mockHeaders['anthropic-ratelimit-unified-reset'] = String(furthest.resetsAt)

  // Add retry-after if rejected and no overage available
  if (mockHeaders['anthropic-ratelimit-unified-status'] === 'rejected') {
    const overageStatus =
      mockHeaders['anthropic-ratelimit-unified-overage-status']
    if (!overageStatus || overageStatus === 'rejected') {
      // Calculate seconds until reset
      const secondsUntilReset = Math.max(
        0,
        furthest.resetsAt - Math.floor(Date.now() / 1000),
      )
      mockHeaders['retry-after'] = String(secondsUntilReset)
    } else {
      // Overage is available, no retry-after
      delete mockHeaders['retry-after']
    }
  } else {
    delete mockHeaders['retry-after']
  }
}

// Add function to add exceeded limit with custom reset time

// Set mock early warning utilization for time-relative thresholds
// claimAbbrev: '5h' or '7d'
// utilization: 0-1 (e.g., 0.92 for 92% used)
// hoursFromNow: hours until reset (default: 4 for 5h, 120 for 7d)

// Clear mock early warning headers

export function getMockHeaderless429Message(): string | null {
  if (process.env.USER_TYPE !== 'ant') {
    return null
  }
  // Env var path for -p / SDK testing where slash commands aren't available
  if (process.env.CLAUDE_MOCK_HEADERLESS_429) {
    return process.env.CLAUDE_MOCK_HEADERLESS_429
  }
  if (!mockEnabled) {
    return null
  }
  return mockHeaderless429Message
}

export function getMockHeaders(): MockHeaders | null {
  if (
    !mockEnabled ||
    process.env.USER_TYPE !== 'ant' ||
    Object.keys(mockHeaders).length === 0
  ) {
    return null
  }
  return mockHeaders
}

export function clearMockHeaders(): void {
  mockHeaders = {}
  exceededLimits = []
  mockSubscriptionType = null
  mockFastModeRateLimitDurationMs = null
  mockFastModeRateLimitExpiresAt = null
  mockHeaderless429Message = null
  setMockBillingAccessOverride(null)
  mockEnabled = false
}

export function applyMockHeaders(
  headers: globalThis.Headers,
): globalThis.Headers {
  const mock = getMockHeaders()
  if (!mock) {
    return headers
  }

  // Create a new Headers object with original headers
  // eslint-disable-next-line eslint-plugin-n/no-unsupported-features/node-builtins
  const newHeaders = new globalThis.Headers(headers)

  // Apply mock headers (overwriting originals)
  Object.entries(mock).forEach(([key, value]) => {
    if (value !== undefined) {
      newHeaders.set(key, value)
    }
  })

  return newHeaders
}

// Check if we should process rate limits even without subscription
// This is for Ant employees testing with mocks
export function shouldProcessMockLimits(): boolean {
  if (process.env.USER_TYPE !== 'ant') {
    return false
  }
  return mockEnabled || Boolean(process.env.CLAUDE_MOCK_HEADERLESS_429)
}

// Mock subscription type management

// Export a function that checks if we should use mock subscription

// Mock billing access (admin vs non-admin)

// Mock fast mode rate limit handling
export function isMockFastModeRateLimitScenario(): boolean {
  return mockFastModeRateLimitDurationMs !== null
}

export function checkMockFastModeRateLimit(
  isFastModeActive?: boolean,
): MockHeaders | null {
  if (mockFastModeRateLimitDurationMs === null) {
    return null
  }

  // Only throw when fast mode is active
  if (!isFastModeActive) {
    return null
  }

  // Check if the rate limit has expired
  if (
    mockFastModeRateLimitExpiresAt !== null &&
    Date.now() >= mockFastModeRateLimitExpiresAt
  ) {
    clearMockHeaders()
    return null
  }

  // Set expiry on first error (not when scenario is configured)
  if (mockFastModeRateLimitExpiresAt === null) {
    mockFastModeRateLimitExpiresAt =
      Date.now() + mockFastModeRateLimitDurationMs
  }

  // Compute dynamic retry-after based on remaining time
  const remainingMs = mockFastModeRateLimitExpiresAt - Date.now()
  const headersToSend = { ...mockHeaders }
  headersToSend['retry-after'] = String(
    Math.max(1, Math.ceil(remainingMs / 1000)),
  )

  return headersToSend
}
