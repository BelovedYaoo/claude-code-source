import { queryHaiku } from '../../services/api/claude.js'
import type { Message } from '../../types/message.js'
import { logForDebugging } from '../../utils/debug.js'
import { errorMessage } from '../../utils/errors.js'
import { safeParseJSON } from '../../utils/json.js'
import { extractTextContent, getContentText } from '../../utils/messages.js'
import { asSystemPrompt } from '../../utils/systemPromptType.js'

function extractConversationText(messages: Message[]): string {
  return messages
    .flatMap(message => {
      if ('isMeta' in message && message.isMeta) {
        return []
      }

      if (message.type === 'user') {
        const text = getContentText(message.message.content)
        return text ? [text] : []
      }

      if (message.type === 'assistant') {
        const text = extractTextContent(message.message.content, '\n').trim()
        return text ? [text] : []
      }

      return []
    })
    .join('\n\n')
    .trim()
}

export async function generateSessionName(
  messages: Message[],
  signal: AbortSignal,
): Promise<string | null> {
  const conversationText = extractConversationText(messages)
  if (!conversationText) {
    return null
  }

  try {
    const result = await queryHaiku({
      systemPrompt: asSystemPrompt([
        'Generate a short kebab-case name (2-4 words) that captures the main topic of this conversation. Use lowercase words separated by hyphens. Examples: "fix-login-bug", "add-auth-feature", "refactor-api-client", "debug-test-failures". Return JSON with a "name" field.',
      ]),
      userPrompt: conversationText,
      outputFormat: {
        type: 'json_schema',
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
          required: ['name'],
          additionalProperties: false,
        },
      },
      signal,
      options: {
        querySource: 'rename_generate_name',
        agents: [],
        isNonInteractiveSession: false,
        hasAppendSystemPrompt: false,
        mcpTools: [],
      },
    })

    const content = extractTextContent(result.message.content)
    const response = safeParseJSON(content)

    if (
      response &&
      typeof response === 'object' &&
      'name' in response &&
      typeof response.name === 'string'
    ) {
      return response.name
    }

    return null
  } catch (error) {
    logForDebugging(`generateSessionName failed: ${errorMessage(error)}`, {
      level: 'error',
    })
    return null
  }
}
