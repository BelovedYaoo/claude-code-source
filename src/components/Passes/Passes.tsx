import * as React from 'react'
import { Box, Text } from '../../ink.js'
import type { CommandResultDisplay } from '../../commands.js'

type Props = {
  onDone: (
    result?: string,
    options?: { display?: CommandResultDisplay },
  ) => void
}

export function Passes(_props: Props): React.ReactNode {
  return (
    <Box flexDirection="column" gap={1}>
      <Text>Guest passes are unavailable in API-only mode.</Text>
      <Text dimColor={true}>
        Use `ANTHROPIC_API_KEY`, `apiKeyHelper`, or a configured third-party provider instead.
      </Text>
    </Box>
  )
}
