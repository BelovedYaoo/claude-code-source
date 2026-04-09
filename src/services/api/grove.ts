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

export async function markGroveNoticeViewed(): Promise<void> {
  getGroveSettings.cache.clear?.()
}

export async function updateGroveSettings(
  _groveEnabled: boolean,
): Promise<void> {
  getGroveSettings.cache.clear?.()
}

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

export function calculateShouldShowGrove(
  settingsResult: ApiResult<AccountSettings>,
  configResult: ApiResult<GroveConfig>,
  showIfAlreadyViewed: boolean,
): boolean {
  if (!settingsResult.success || !configResult.success) {
    return false
  }

  const settings = settingsResult.data
  const config = configResult.data

  if (!config.grove_enabled || config.domain_excluded) {
    return false
  }

  const hasChosen = settings.grove_enabled !== null
  if (hasChosen) {
    return false
  }
  if (showIfAlreadyViewed) {
    return true
  }
  if (!config.notice_is_grace_period) {
    return true
  }

  const reminderFrequency = config.notice_reminder_frequency
  if (reminderFrequency !== null && settings.grove_notice_viewed_at) {
    const daysSinceViewed = Math.floor(
      (Date.now() - new Date(settings.grove_notice_viewed_at).getTime()) /
        (1000 * 60 * 60 * 24),
    )
    return daysSinceViewed >= reminderFrequency
  }

  const viewedAt = settings.grove_notice_viewed_at
  return viewedAt === null || viewedAt === undefined
}

export async function checkGroveForNonInteractive(): Promise<void> {
  return
}
