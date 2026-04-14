import React from 'react';
import type { LocalJSXCommandContext } from '../../commands.js';
import type { LocalJSXCommandOnDone } from '../../types/command.js';
import { runExtraUsage } from './extra-usage-core.js';
export async function call(onDone: LocalJSXCommandOnDone, _context: LocalJSXCommandContext): Promise<React.ReactNode | null> {
  const result = await runExtraUsage();
  if (result.type === 'message') {
    onDone(result.value);
    return null;
  }
  onDone('Extra usage login flow is unavailable in API-only mode. Use ANTHROPIC_API_KEY or apiKeyHelper for usage-based billing.');
  return null;
}
