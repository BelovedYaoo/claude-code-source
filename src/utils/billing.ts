import { getAnthropicApiKey, getAuthTokenSource } from './auth.js'
import { isEnvTruthy } from './envUtils.js'

export function hasConsoleBillingAccess(): boolean {
  if (isEnvTruthy(process.env.DISABLE_COST_WARNINGS)) {
    return false
  }

  const authSource = getAuthTokenSource()
  const hasApiKey = getAnthropicApiKey() !== null

  return authSource.hasToken || hasApiKey
}

// Mock billing access for /mock-limits testing (set by mockRateLimits.ts)
let mockBillingAccessOverride: boolean | null = null

export function setMockBillingAccessOverride(value: boolean | null): void {
  mockBillingAccessOverride = value
}

