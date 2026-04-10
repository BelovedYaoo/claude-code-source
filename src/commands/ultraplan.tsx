import type { LocalJSXCommandCall } from '../types/command.js'
import type { AppState } from '../state/AppStateStore.js'

export const CCR_TERMS_URL = 'https://code.claude.com/docs/en/claude-code-on-the-web'

export function buildUltraplanPrompt(blurb: string, seedPlan?: string): string {
  const parts: string[] = []
  if (seedPlan) {
    parts.push('Here is a draft plan to refine:', '', seedPlan, '')
  }
  if (blurb) {
    parts.push(blurb)
  }
  return parts.join('\n')
}

export async function stopUltraplan(
  _taskId: string,
  _sessionId: string,
  _setAppState: (f: (prev: AppState) => AppState) => void,
): Promise<void> {
  return
}

export async function launchUltraplan(_opts: {
  blurb: string
  seedPlan?: string
  getAppState: () => AppState
  setAppState: (f: (prev: AppState) => AppState) => void
  signal: AbortSignal
  disconnectedBridge?: boolean
  onSessionReady?: (msg: string) => void
}): Promise<string> {
  return 'Ultraplan is unavailable in API-only mode.'
}

const call: LocalJSXCommandCall = async (onDone) => {
  onDone('Ultraplan is unavailable in API-only mode.', {
    display: 'system',
  })
  return null
}

export default {
  type: 'local-jsx',
  name: 'ultraplan',
  description: `~10–30 min · Claude Code on the web drafts an advanced plan you can edit and approve. See ${CCR_TERMS_URL}`,
  load: async () => ({ call }),
}
