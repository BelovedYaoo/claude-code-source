export type SubscriptionType = 'max' | 'pro' | 'enterprise' | 'team'

export type RateLimitTier = string | null

export type BillingType = string | null

export type OAuthTokens = {
  accessToken: string
  refreshToken: string
  expiresAt: number
  scopes: string[]
  subscriptionType: SubscriptionType | null
  rateLimitTier: RateLimitTier | null
  profile?: OAuthProfileResponse
  tokenAccount?: {
    uuid: string
    emailAddress: string
    organizationUuid?: string
  }
}

export type OAuthProfileResponse = {
  account: {
    uuid: string
    email: string
    display_name?: string
    created_at?: string
  }
  organization: {
    uuid: string
    organization_type?: string
    rate_limit_tier?: string
    has_extra_usage_enabled?: boolean
    billing_type?: string
    subscription_created_at?: string
  }
}

export type ReferralCampaign = 'claude_code_guest_pass' | string

export type ReferrerRewardInfo = {
  currency: string
  amount_minor_units: number
}

export type ReferralEligibilityResponse = {
  eligible: boolean
  referral_code?: string
  referrer_reward?: ReferrerRewardInfo
  max_referrals?: number
  remaining_referrals?: number
  campaign?: string
  referral_code_details?: {
    code: string
    url: string
    [key: string]: unknown
  }
}

export type ReferralRedemptionsResponse = {
  redemptions: Array<{
    redeemed_at: string
    referral_code: string
    status: string
  }>
  total_count: number
}

