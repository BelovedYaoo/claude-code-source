import { getGlobalConfig } from '../../utils/config.js'
import { logError } from '../../utils/log.js'
import { createSignal } from '../../utils/signal.js'

type GrowthBookRefreshListener = () => void | Promise<void>

const refreshed = createSignal()

let envOverrides: Record<string, unknown> | null = null
let envOverridesParsed = false

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function callSafe(listener: GrowthBookRefreshListener): void {
  try {
    void Promise.resolve(listener()).catch(error => {
      logError(error)
    })
  } catch (error) {
    logError(error)
  }
}

function getEnvOverrides(): Record<string, unknown> | null {
  if (envOverridesParsed) {
    return envOverrides
  }

  envOverridesParsed = true
  if (process.env.USER_TYPE !== 'ant') {
    return null
  }

  const raw = process.env.CLAUDE_INTERNAL_FC_OVERRIDES
  if (!raw) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) {
      throw new Error('CLAUDE_INTERNAL_FC_OVERRIDES must be a JSON object')
    }
    envOverrides = parsed
  } catch {
    logError(
      new Error(`GrowthBook: Failed to parse CLAUDE_INTERNAL_FC_OVERRIDES: ${raw}`),
    )
  }

  return envOverrides
}

function getPersistedFeatures(): Record<string, unknown> | undefined {
  try {
    return getGlobalConfig().cachedGrowthBookFeatures
  } catch {
    return undefined
  }
}

function getConfigOverrides(): Record<string, unknown> | undefined {
  if (process.env.USER_TYPE !== 'ant') {
    return undefined
  }

  try {
    return getGlobalConfig().growthBookOverrides
  } catch {
    return undefined
  }
}

function resolveLocalValue(feature: string): unknown {
  const overrides = getEnvOverrides()
  if (overrides && feature in overrides) {
    return overrides[feature]
  }

  const configOverrides = getConfigOverrides()
  if (configOverrides && feature in configOverrides) {
    return configOverrides[feature]
  }

  const persistedFeatures = getPersistedFeatures()
  if (persistedFeatures && feature in persistedFeatures) {
    return persistedFeatures[feature]
  }

  return undefined
}

function coerceResolvedValue<T>(value: unknown, defaultValue: T): T {
  return value === undefined ? defaultValue : (value as T)
}

function hasLocalConfigData(): boolean {
  const overrides = getEnvOverrides()
  if (overrides && Object.keys(overrides).length > 0) {
    return true
  }

  const configOverrides = getConfigOverrides()
  if (configOverrides && Object.keys(configOverrides).length > 0) {
    return true
  }

  const persistedFeatures = getPersistedFeatures()
  return !!persistedFeatures && Object.keys(persistedFeatures).length > 0
}

export function onGrowthBookRefresh(
  listener: GrowthBookRefreshListener,
): () => void {
  let subscribed = true
  const unsubscribe = refreshed.subscribe(() => callSafe(listener))

  if (hasLocalConfigData()) {
    queueMicrotask(() => {
      if (subscribed && hasLocalConfigData()) {
        callSafe(listener)
      }
    })
  }

  return () => {
    subscribed = false
    unsubscribe()
  }
}
function getFeatureValueInternal<T>(feature: string, defaultValue: T): T {
  return coerceResolvedValue(resolveLocalValue(feature), defaultValue)
}

export function getFeatureValue_CACHED_MAY_BE_STALE<T>(
  feature: string,
  defaultValue: T,
): T {
  return getFeatureValueInternal(feature, defaultValue)
}

export function checkStatsigFeatureGate_CACHED_MAY_BE_STALE(
  gate: string,
): boolean {
  return getFeatureValueInternal(gate, false)
}

export async function checkSecurityRestrictionGate(
  gate: string,
): Promise<boolean> {
  return getFeatureValueInternal(gate, false)
}

export async function checkGate_CACHED_OR_BLOCKING(
  gate: string,
): Promise<boolean> {
  return getFeatureValueInternal(gate, false)
}

export async function getDynamicConfig_BLOCKS_ON_INIT<T>(
  configName: string,
  defaultValue: T,
): Promise<T> {
  return getFeatureValueInternal(configName, defaultValue)
}
