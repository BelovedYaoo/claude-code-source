import type { SDKMessage } from '../entrypoints/agentSdkTypes.js'

export const HISTORY_PAGE_SIZE = 100

export type HistoryPage = {
  events: SDKMessage[]
  firstId: string | null
  hasMore: boolean
}

type SessionEventsResponse = {
  data: SDKMessage[]
  has_more: boolean
  first_id: string | null
  last_id: string | null
}

export type HistoryAuthCtx = {
  baseUrl: string
  headers: Record<string, string>
}

export async function createHistoryAuthCtx(
  _sessionId: string,
): Promise<HistoryAuthCtx> {
  throw new Error('Remote session history is unavailable in API-only mode.')
}

async function fetchPage(
  _ctx: HistoryAuthCtx,
  _params: Record<string, string | number | boolean>,
  _label: string,
): Promise<HistoryPage | null> {
  const _unused: SessionEventsResponse | null = null
  return _unused ? null : null
}

export async function fetchLatestEvents(
  ctx: HistoryAuthCtx,
  limit = HISTORY_PAGE_SIZE,
): Promise<HistoryPage | null> {
  return fetchPage(ctx, { limit, anchor_to_latest: true }, 'fetchLatestEvents')
}

export async function fetchOlderEvents(
  ctx: HistoryAuthCtx,
  beforeId: string,
  limit = HISTORY_PAGE_SIZE,
): Promise<HistoryPage | null> {
  return fetchPage(ctx, { limit, before_id: beforeId }, 'fetchOlderEvents')
}
