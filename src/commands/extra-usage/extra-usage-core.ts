type ExtraUsageResult =
  | { type: 'message'; value: string }
  | { type: 'browser-opened'; url: string; opened: boolean }

export async function runExtraUsage(): Promise<ExtraUsageResult> {
  return {
    type: 'message',
    value:
      'Extra usage configuration is unavailable in API-only mode. Use ANTHROPIC_API_KEY or apiKeyHelper for usage-based billing.',
  }
}
