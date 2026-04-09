import * as React from 'react'
import { Text } from '../../ink.js'
import type { LocalJSXCommandOnDone } from '../../types/command.js'

export async function call(
  _onDone: LocalJSXCommandOnDone,
): Promise<React.ReactNode> {
  return <Text dimColor={true}>Guest passes are unavailable in API-only mode.</Text>
}
