import React, { useCallback, useState } from 'react'
import TextInput from '../../components/TextInput.js'
import { useTerminalSize } from '../../hooks/useTerminalSize.js'
import { Box, color, Text, useTheme } from '../../ink.js'
import { useKeybindings } from '../../keybindings/useKeybinding.js'

interface ApiKeyStepProps {
  existingApiKey: string | null
  useExistingKey: boolean
  apiKeyOrOAuthToken: string
  onApiKeyChange: (value: string) => void
  onToggleUseExistingKey: (useExisting: boolean) => void
  onSubmit: () => void
  selectedOption?: 'existing' | 'new'
  onSelectOption?: (option: 'existing' | 'new') => void
}

export function ApiKeyStep({
  existingApiKey,
  apiKeyOrOAuthToken,
  onApiKeyChange,
  onSubmit,
  onToggleUseExistingKey,
  selectedOption = existingApiKey ? 'existing' : 'new',
  onSelectOption,
}: ApiKeyStepProps): React.ReactNode {
  const [cursorOffset, setCursorOffset] = useState(0)
  const terminalSize = useTerminalSize()
  const [theme] = useTheme()

  const handlePrevious = useCallback(() => {
    if (selectedOption === 'new' && existingApiKey) {
      onSelectOption?.('existing')
      onToggleUseExistingKey(true)
    }
  }, [selectedOption, existingApiKey, onSelectOption, onToggleUseExistingKey])

  const handleNext = useCallback(() => {
    if (selectedOption === 'existing') {
      onSelectOption?.('new')
      onToggleUseExistingKey(false)
    }
  }, [selectedOption, onSelectOption, onToggleUseExistingKey])

  const isTextInputVisible = selectedOption === 'new'

  useKeybindings(
    {
      'confirm:previous': handlePrevious,
      'confirm:next': handleNext,
      'confirm:yes': onSubmit,
    },
    { context: 'Confirmation', isActive: !isTextInputVisible },
  )

  useKeybindings(
    {
      'confirm:previous': handlePrevious,
      'confirm:next': handleNext,
    },
    { context: 'Confirmation', isActive: isTextInputVisible },
  )

  return (
    <>
      <Box flexDirection="column" borderStyle="round" paddingX={1}>
        <Box flexDirection="column" marginBottom={1}>
          <Text bold>Install GitHub App</Text>
          <Text dimColor>Choose API key</Text>
        </Box>
        {existingApiKey ? (
          <Box marginBottom={1}>
            <Text>
              {selectedOption === 'existing'
                ? color('success', theme)('> ')
                : '  '}
              Use your existing Claude Code API key
            </Text>
          </Box>
        ) : null}
        <Box marginBottom={1}>
          <Text>
            {selectedOption === 'new' ? color('success', theme)('> ') : '  '}
            Enter a new API key
          </Text>
        </Box>
        {selectedOption === 'new' ? (
          <TextInput
            value={apiKeyOrOAuthToken}
            onChange={onApiKeyChange}
            onSubmit={onSubmit}
            onPaste={onApiKeyChange}
            focus={true}
            placeholder="sk-ant… (Create a new key at https://platform.claude.com/settings/keys)"
            mask="*"
            columns={terminalSize.columns}
            cursorOffset={cursorOffset}
            onChangeCursorOffset={setCursorOffset}
            showCursor={true}
          />
        ) : null}
      </Box>
      <Box marginLeft={3}>
        <Text dimColor>↑/↓ to select · Enter to continue</Text>
      </Box>
    </>
  )
}
