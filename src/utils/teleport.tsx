import chalk from 'chalk'
import type { Root } from '../ink.js'
import type { Message } from '../types/message.js'
import type { PermissionMode } from '../types/permissions.js'
import type { SessionResource } from './teleport/api.js'
import type { TeleportRemoteResponse } from './conversationRecovery.js'
import { TeleportOperationError } from './errors.js'

export type TeleportResult = {
  messages: Message[]
  branchName: string
}

export type TeleportProgressStep =
  | 'validating'
  | 'fetching_logs'
  | 'fetching_branch'
  | 'checking_out'
  | 'done'

export type TeleportProgressCallback = (step: TeleportProgressStep) => void

type TeleportToRemoteResponse = {
  id: string
  title: string
}

export async function validateGitState(): Promise<void> {
  return
}

export function processMessagesForTeleportResume(
  messages: Message[],
  _error: Error | null,
): Message[] {
  return messages
}

export async function checkOutTeleportedSessionBranch(
  _branch?: string,
): Promise<{
  branchName: string
  branchError: Error | null
}> {
  return {
    branchName: 'claude/task',
    branchError: new Error('Remote sessions are unavailable in API-only mode.'),
  }
}

export type RepoValidationResult =
  | { status: 'match' }
  | { status: 'no_repo_required' }
  | {
      status: 'not_in_repo'
      sessionRepo: string
      sessionHost?: string
    }
  | {
      status: 'mismatch'
      sessionRepo: string
      currentRepo: string
      sessionHost?: string
      currentHost?: string
    }
  | { status: 'error'; errorMessage?: string }

export async function validateSessionRepository(
  _sessionData: SessionResource,
): Promise<RepoValidationResult> {
  return { status: 'error', errorMessage: 'Remote sessions are unavailable in API-only mode.' }
}

export async function teleportResumeCodeSession(
  _sessionId: string,
  _onProgress?: TeleportProgressCallback,
): Promise<TeleportRemoteResponse> {
  throw new TeleportOperationError(
    'Remote sessions are unavailable in API-only mode.',
    chalk.red('Remote sessions are unavailable in API-only mode.\n'),
  )
}

export async function teleportToRemoteWithErrorHandling(
  _root: Root,
  _description: string | null,
  _signal: AbortSignal,
  _branchName?: string,
): Promise<TeleportToRemoteResponse | null> {
  return null
}

export async function teleportFromSessionsAPI(
  _sessionId: string,
  _orgUUID: string,
  _accessToken: string,
  _onProgress?: TeleportProgressCallback,
  _sessionData?: SessionResource,
): Promise<TeleportRemoteResponse> {
  throw new Error('Remote sessions are unavailable in API-only mode.')
}

export type PollRemoteSessionResponse = {
  newEvents: Array<unknown>
  lastEventId: string | null
  branch?: string
  sessionStatus?: 'idle' | 'running' | 'requires_action' | 'archived'
}

export async function pollRemoteSessionEvents(
  _sessionId: string,
  afterId: string | null = null,
  _opts?: {
    skipMetadata?: boolean
  },
): Promise<PollRemoteSessionResponse> {
  return {
    newEvents: [],
    lastEventId: afterId,
  }
}

export async function teleportToRemote(_options: {
  initialMessage: string | null
  branchName?: string
  title?: string
  description?: string
  model?: string
  permissionMode?: PermissionMode
  ultraplan?: boolean
  signal: AbortSignal
  useDefaultEnvironment?: boolean
  environmentId?: string
  environmentVariables?: Record<string, string>
  useBundle?: boolean
  onBundleFail?: (message: string) => void
  skipBundle?: boolean
  reuseOutcomeBranch?: string
  githubPr?: {
    owner: string
    repo: string
    number: number
  }
}): Promise<TeleportToRemoteResponse | null> {
  return null
}

export async function archiveRemoteSession(_sessionId: string): Promise<void> {
  return
}
