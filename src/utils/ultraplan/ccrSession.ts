export class UltraplanPollError extends Error {
  constructor(
    message: string,
    public readonly reason:
      | 'stopped'
      | 'network_or_unknown'
      | 'extract_marker_missing'
      | 'terminated'
      | 'timeout_pending'
      | 'timeout_no_plan',
    public readonly rejectCount: number,
    public readonly metadata?: { cause?: unknown },
  ) {
    super(message)
    this.name = 'UltraplanPollError'
  }
}

export type PollResult = {
  plan: string
  rejectCount: number
  executionTarget: 'local' | 'remote'
}

export async function pollForApprovedExitPlanMode(
  _sessionId: string,
  timeoutMs: number,
  _onPhaseChange?: (phase: UltraplanPhase) => void,
  _shouldStop?: () => boolean,
): Promise<PollResult> {
  throw new UltraplanPollError(
    `remote polling unavailable after ${timeoutMs / 1000}s`,
    'network_or_unknown',
    0,
  )
}

export type UltraplanPhase = 'running' | 'needs_input' | 'plan_ready'
