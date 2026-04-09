import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'
import z from 'zod/v4'
import { errorMessage } from '../errors.js'
import { lazySchema } from '../lazySchema.js'
import { logForDebugging } from '../debug.js'

const TELEPORT_RETRY_DELAYS = [2000, 4000, 8000, 16000]
const MAX_TELEPORT_RETRIES = TELEPORT_RETRY_DELAYS.length

export const CCR_BYOC_BETA = 'ccr-byoc-2025-07-29'

export function isTransientNetworkError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) {
    return false
  }
  if (!error.response) {
    return true
  }
  return error.response.status >= 500
}

export async function axiosGetWithRetry<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> {
  let lastError: unknown
  for (let attempt = 0; attempt <= MAX_TELEPORT_RETRIES; attempt++) {
    try {
      return await axios.get<T>(url, config)
    } catch (error) {
      lastError = error
      if (!isTransientNetworkError(error)) {
        throw error
      }
      if (attempt >= MAX_TELEPORT_RETRIES) {
        logForDebugging(
          `Teleport request failed after ${attempt + 1} attempts: ${errorMessage(error)}`,
        )
        throw error
      }
      const delay = TELEPORT_RETRY_DELAYS[attempt] ?? 2000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw lastError
}

export type SessionStatus = 'requires_action' | 'running' | 'idle' | 'archived'

export type GitSource = {
  type: 'git_repository'
  url: string
  revision?: string | null
  allow_unrestricted_git_push?: boolean
}

export type KnowledgeBaseSource = {
  type: 'knowledge_base'
  knowledge_base_id: string
}

export type SessionContextSource = GitSource | KnowledgeBaseSource

export type OutcomeGitInfo = {
  type: 'github'
  repo: string
  branches: string[]
}

export type GitRepositoryOutcome = {
  type: 'git_repository'
  git_info: OutcomeGitInfo
}

export type Outcome = GitRepositoryOutcome

export type SessionContext = {
  sources: SessionContextSource[]
  cwd: string
  outcomes: Outcome[] | null
  custom_system_prompt: string | null
  append_system_prompt: string | null
  model: string | null
  seed_bundle_file_id?: string
  github_pr?: { owner: string; repo: string; number: number }
  reuse_outcome_branches?: boolean
}

export type SessionResource = {
  type: 'session'
  id: string
  title: string | null
  session_status: SessionStatus
  environment_id: string
  created_at: string
  updated_at: string
  session_context: SessionContext
}

export type ListSessionsResponse = {
  data: SessionResource[]
  has_more: boolean
  first_id: string | null
  last_id: string | null
}

export const CodeSessionSchema = lazySchema(() =>
  z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    status: z.enum([
      'idle',
      'working',
      'waiting',
      'completed',
      'archived',
      'cancelled',
      'rejected',
    ]),
    repo: z
      .object({
        name: z.string(),
        owner: z.object({
          login: z.string(),
        }),
        default_branch: z.string().optional(),
      })
      .nullable(),
    turns: z.array(z.string()),
    created_at: z.string(),
    updated_at: z.string(),
  }),
)

export type CodeSession = z.infer<ReturnType<typeof CodeSessionSchema>>

export async function prepareApiRequest(): Promise<{
  accessToken: string
  orgUUID: string
}> {
  throw new Error(
    'Claude Code web sessions require legacy claude.ai authentication and are unavailable in API-only mode.',
  )
}

export function getOAuthHeaders(_accessToken: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'anthropic-version': '2023-06-01',
  }
}

export async function fetchSession(_sessionId: string): Promise<SessionResource> {
  throw new Error('Remote sessions are unavailable in API-only mode.')
}

export function getBranchFromSession(
  session: SessionResource,
): string | undefined {
  const gitOutcome = session.session_context.outcomes?.find(
    (outcome): outcome is GitRepositoryOutcome =>
      outcome.type === 'git_repository',
  )
  return gitOutcome?.git_info?.branches[0]
}

export type RemoteMessageContent =
  | string
  | Array<{ type: string; [key: string]: unknown }>

export async function sendEventToRemoteSession(
  _sessionId: string,
  _messageContent: RemoteMessageContent,
  _opts?: { uuid?: string },
): Promise<boolean> {
  return false
}

export async function updateSessionTitle(
  _sessionId: string,
  _title: string,
): Promise<boolean> {
  return false
}
