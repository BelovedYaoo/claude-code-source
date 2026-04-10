import type { ContentBlockParam } from '@anthropic-ai/sdk/resources/messages.js'
import { fetchUltrareviewQuota } from '../../services/api/ultrareviewQuota.js'
import { fetchUtilization } from '../../services/api/usage.js'
import type { ToolUseContext } from '../../Tool.js'

let sessionOverageConfirmed = false

export function confirmOverage(): void {
  sessionOverageConfirmed = true
}

export type OverageGate =
  | { kind: 'proceed'; billingNote: string }
  | { kind: 'not-enabled' }
  | { kind: 'low-balance'; available: number }
  | { kind: 'needs-confirm' }

export async function checkOverageGate(): Promise<OverageGate> {
  const [quota, utilization] = await Promise.all([
    fetchUltrareviewQuota(),
    fetchUtilization().catch(() => null),
  ])

  if (!quota) {
    return { kind: 'proceed', billingNote: '' }
  }

  if (quota.reviews_remaining > 0) {
    return {
      kind: 'proceed',
      billingNote: ` This is free ultrareview ${quota.reviews_used + 1} of ${quota.reviews_limit}.`,
    }
  }

  if (!utilization) {
    return { kind: 'proceed', billingNote: '' }
  }

  const extraUsage = utilization.extra_usage
  if (!extraUsage?.is_enabled) {
    return { kind: 'not-enabled' }
  }

  const monthlyLimit = extraUsage.monthly_limit
  const usedCredits = extraUsage.used_credits ?? 0
  const available =
    monthlyLimit === null || monthlyLimit === undefined
      ? Infinity
      : monthlyLimit - usedCredits

  if (available < 10) {
    return { kind: 'low-balance', available }
  }

  if (!sessionOverageConfirmed) {
    return { kind: 'needs-confirm' }
  }

  return {
    kind: 'proceed',
    billingNote: ' This review bills as Extra Usage.',
  }
}

export async function launchRemoteReview(
  _args: string,
  _context: ToolUseContext,
  _billingNote?: string,
): Promise<ContentBlockParam[] | null> {
  return [
    {
      type: 'text',
      text: 'Remote review is unavailable in API-only mode.',
    },
  ]
}
