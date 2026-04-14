import { isEssentialTrafficOnly } from '../../utils/privacyLevel.js'

export type OverageCreditGrantInfo = {
  available: boolean
  eligible: boolean
  granted: boolean
  amount_minor_units: number | null
  currency: string | null
}

type CachedGrantEntry = {
  info: OverageCreditGrantInfo
  timestamp: number
}

async function fetchOverageCreditGrant(): Promise<OverageCreditGrantInfo | null> {
  return null
}

export function getCachedOverageCreditGrant(): OverageCreditGrantInfo | null {
  return null
}

export async function refreshOverageCreditGrantCache(): Promise<void> {
  if (isEssentialTrafficOnly()) {
    return
  }

  await fetchOverageCreditGrant()
}

export function formatGrantAmount(info: OverageCreditGrantInfo): string | null {
  if (info.amount_minor_units == null || !info.currency) return null
  if (info.currency.toUpperCase() === 'USD') {
    const dollars = info.amount_minor_units / 100
    return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`
  }
  return null
}

export type { CachedGrantEntry as OverageCreditGrantCacheEntry }
