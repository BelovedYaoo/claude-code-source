export function getBridgeTokenOverride(): string | undefined {
  return (process.env.USER_TYPE === 'ant' && process.env.CLAUDE_BRIDGE_OAUTH_TOKEN) || undefined
}

export function getBridgeBaseUrlOverride(): string | undefined {
  return (
    (process.env.USER_TYPE === 'ant' && process.env.CLAUDE_BRIDGE_BASE_URL) ||
    undefined
  )
}

export function getBridgeAccessToken(): string | undefined {
  return getBridgeTokenOverride()
}

export function getBridgeBaseUrl(): string {
  return getBridgeBaseUrlOverride() ?? (process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com')
}
