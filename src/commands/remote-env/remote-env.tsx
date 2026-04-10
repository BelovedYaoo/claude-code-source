import * as React from 'react'
import type { LocalJSXCommandOnDone } from '../../types/command.js'

export async function call(
  onDone: LocalJSXCommandOnDone,
): Promise<React.ReactNode | null> {
  onDone('Remote environments are unavailable in API-only mode.')
  return null
}
