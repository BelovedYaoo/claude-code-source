import React from 'react'
import { Box, Text } from '../ink.js'

type Props = {
  onDone(): void
  startingMessage?: string
  mode?: 'login' | 'setup-token'
  forceLoginMethod?: 'claudeai' | 'console'
}

export function ConsoleOAuthFlow({
  startingMessage,
  mode = 'login',
}: Props): React.ReactNode {
  const title =
    mode === 'setup-token'
      ? 'Setup token is unavailable in API-only mode.'
      : 'Login is unavailable in API-only mode.'

  const detail =
    mode === 'setup-token'
      ? 'Use ANTHROPIC_API_KEY, configure apiKeyHelper, or use a supported third-party provider.'
      : 'Use ANTHROPIC_API_KEY, configure apiKeyHelper, or use a supported third-party provider.'

  return (
    <Box flexDirection="column" gap={1}>
      {startingMessage ? <Text bold>{startingMessage}</Text> : null}
      <Text color="warning">{title}</Text>
      <Text dimColor>{detail}</Text>
    </Box>
  )
}
