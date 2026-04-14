import memoize from 'lodash-es/memoize.js'
import { getGlobalConfig, saveGlobalConfig } from 'src/utils/config.js'
import { clearMcpAuthCache } from './client.js'
import type { ScopedMcpServerConfig } from './types.js'

/**
 * Claude.ai-managed MCP servers are unavailable in API-only mode.
 */
export const fetchClaudeAIMcpConfigsIfEligible = memoize(
  async (): Promise<Record<string, ScopedMcpServerConfig>> => {
    return {}
  },
)

/**
 * Clears the memoized cache for fetchClaudeAIMcpConfigsIfEligible.
 */
export function clearClaudeAIMcpConfigsCache(): void {
  fetchClaudeAIMcpConfigsIfEligible.cache.clear?.()
  // Also clear the auth cache so freshly-authorized servers get re-connected
  clearMcpAuthCache()
}

export function hasClaudeAiMcpEverConnected(name: string): boolean {
  return (getGlobalConfig().claudeAiMcpEverConnected ?? []).includes(name)
}
