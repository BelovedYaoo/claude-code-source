/* eslint-disable custom-rules/no-process-exit -- CLI subcommand handler intentionally exits */

import {
  getAnthropicApiKeyWithSource,
  isUsing3PServices,
} from '../../utils/auth.js'
import { isRunningOnHomespace } from '../../utils/envUtils.js'
import { getAPIProvider } from '../../utils/model/providers.js'
import { jsonStringify } from '../../utils/slowOperations.js'
import {
  buildAccountProperties,
  buildAPIProviderProperties,
} from '../../utils/status.js'

export async function authStatus(opts: {
  json?: boolean
  text?: boolean
}): Promise<void> {
  const { source: apiKeySource } = getAnthropicApiKeyWithSource()
  const hasApiKeyEnvVar =
    !!process.env.ANTHROPIC_API_KEY && !isRunningOnHomespace()
  const using3P = isUsing3PServices()
  const authenticated = apiKeySource !== 'none' || hasApiKeyEnvVar || using3P

  let authMethod: string = 'none'
  if (using3P) {
    authMethod = 'third_party'
  } else if (apiKeySource === 'apiKeyHelper') {
    authMethod = 'api_key_helper'
  } else if (apiKeySource !== 'none' || hasApiKeyEnvVar) {
    authMethod = 'api_key'
  }

  if (opts.text) {
    const properties = [
      ...buildAccountProperties(),
      ...buildAPIProviderProperties(),
    ]
    let hasAuthProperty = false
    for (const prop of properties) {
      const value =
        typeof prop.value === 'string'
          ? prop.value
          : Array.isArray(prop.value)
            ? prop.value.join(', ')
            : null
      if (value === null || value === 'none') {
        continue
      }
      hasAuthProperty = true
      if (prop.label) {
        process.stdout.write(`${prop.label}: ${value}\n`)
      } else {
        process.stdout.write(`${value}\n`)
      }
    }
    if (!hasAuthProperty && hasApiKeyEnvVar) {
      process.stdout.write('API key: ANTHROPIC_API_KEY\n')
    }
    if (!authenticated) {
      process.stdout.write(
        'Authentication required. Set ANTHROPIC_API_KEY, configure apiKeyHelper, or use a supported third-party provider.\n',
      )
    }
  } else {
    const apiProvider = getAPIProvider()
    const resolvedApiKeySource =
      apiKeySource !== 'none'
        ? apiKeySource
        : hasApiKeyEnvVar
          ? 'ANTHROPIC_API_KEY'
          : null
    const output: Record<string, string | boolean | null> = {
      authenticated,
      authMethod,
      apiProvider,
    }
    if (resolvedApiKeySource) {
      output.apiKeySource = resolvedApiKeySource
    }
    process.stdout.write(jsonStringify(output, null, 2) + '\n')
  }
  process.exit(authenticated ? 0 : 1)
}
