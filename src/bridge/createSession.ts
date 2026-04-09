import type { SDKMessage } from '../entrypoints/agentSdkTypes.js'

export async function createBridgeSession(_opts: {
  environmentId: string
  title?: string
  events: { type: 'event'; data: SDKMessage }[]
  gitRepoUrl: string | null
  branch: string
  signal: AbortSignal
  baseUrl?: string
  getAccessToken?: () => string | undefined
  permissionMode?: string
}): Promise<string | null> {
  return null
}

export async function getBridgeSession(
  _sessionId: string,
  _opts?: { baseUrl?: string; getAccessToken?: () => string | undefined },
): Promise<{ environment_id?: string; title?: string } | null> {
  return null
}

export async function archiveBridgeSession(
  _sessionId: string,
  _opts?: {
    baseUrl?: string
    getAccessToken?: () => string | undefined
    timeoutMs?: number
  },
): Promise<void> {
  return
}

export async function updateBridgeSessionTitle(
  _sessionId: string,
  _title: string,
  _opts?: { baseUrl?: string; getAccessToken?: () => string | undefined },
): Promise<void> {
  return
}
