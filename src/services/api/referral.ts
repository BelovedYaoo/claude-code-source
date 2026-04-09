import type {
  ReferralCampaign,
  ReferralEligibilityResponse,
  ReferralRedemptionsResponse,
  ReferrerRewardInfo,
} from '../oauth/types.js'

export async function fetchReferralEligibility(
  campaign: ReferralCampaign = 'claude_code_guest_pass',
): Promise<ReferralEligibilityResponse> {
  return {
    eligible: false,
    campaign,
  }
}

export async function fetchReferralRedemptions(
  _campaign: string = 'claude_code_guest_pass',
): Promise<ReferralRedemptionsResponse> {
  return {
    redemptions: [],
    total_count: 0,
  }
}

export function checkCachedPassesEligibility(): {
  eligible: boolean
  needsRefresh: boolean
  hasCache: boolean
} {
  return {
    eligible: false,
    needsRefresh: false,
    hasCache: false,
  }
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  BRL: 'R$',
  CAD: 'CA$',
  AUD: 'A$',
  NZD: 'NZ$',
  SGD: 'S$',
}

export function formatCreditAmount(reward: ReferrerRewardInfo): string {
  const symbol = CURRENCY_SYMBOLS[reward.currency] ?? `${reward.currency} `
  const amount = reward.amount_minor_units / 100
  const formatted = amount % 1 === 0 ? amount.toString() : amount.toFixed(2)
  return `${symbol}${formatted}`
}

export async function fetchAndStorePassesEligibility(): Promise<ReferralEligibilityResponse | null> {
  return null
}

export async function getCachedOrFetchPassesEligibility(): Promise<ReferralEligibilityResponse | null> {
  return null
}

export async function prefetchPassesEligibility(): Promise<void> {}
