import * as React from 'react'
import type { LocalJSXCommandOnDone } from '../../types/command.js'

const FALLBACK_MESSAGE = 'Privacy settings are unavailable in API-only mode.'

export async function call(
  onDone: LocalJSXCommandOnDone,
): Promise<React.ReactNode | null> {
  onDone(FALLBACK_MESSAGE)
  return null
}
