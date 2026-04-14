import memoize from 'lodash-es/memoize.js'
import { isEssentialTrafficOnly } from 'src/utils/privacyLevel.js'

export type AccountSettings = {
  grove_enabled: boolean | null
  grove_notice_viewed_at: string | null
}

export type GroveConfig = {
  grove_enabled: boolean
  domain_excluded: boolean
  notice_is_grace_period: boolean
  notice_reminder_frequency: number | null
}

export type ApiResult<T> = { success: true; data: T } | { success: false }

export const getGroveSettings = memoize(
  async (): Promise<ApiResult<AccountSettings>> => {
    if (isEssentialTrafficOnly()) {
      return { success: false }
    }

    return {
      success: true,
      data: {
        grove_enabled: null,
        grove_notice_viewed_at: null,
      },
    }
  },
)

export const getGroveNoticeConfig = memoize(
  async (): Promise<ApiResult<GroveConfig>> => {
    if (isEssentialTrafficOnly()) {
      return { success: false }
    }

    return {
      success: true,
      data: {
        grove_enabled: false,
        domain_excluded: false,
        notice_is_grace_period: true,
        notice_reminder_frequency: null,
      },
    }
  },
)

