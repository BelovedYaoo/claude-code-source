import type { AppState } from '../state/AppState.js'
import { FILE_EDIT_TOOL_NAME } from '../tools/FileEditTool/constants.js'
import { FILE_READ_TOOL_NAME } from '../tools/FileReadTool/prompt.js'
import { FILE_WRITE_TOOL_NAME } from '../tools/FileWriteTool/prompt.js'
import { GLOB_TOOL_NAME } from '../tools/GlobTool/prompt.js'
import { GREP_TOOL_NAME } from '../tools/GrepTool/prompt.js'
import { getInitialSettings } from './settings/settings.js'

export type AttributionTexts = {
  commit: string
  pr: string
}

/**
 * Returns attribution text for commits and PRs based on user settings.
 */
export function getAttributionTexts(): AttributionTexts {
  const settings = getInitialSettings()

  if (settings.attribution) {
    return {
      commit: settings.attribution.commit ?? '',
      pr: settings.attribution.pr ?? '',
    }
  }

  return { commit: '', pr: '' }
}
new Set([
  FILE_READ_TOOL_NAME,
  GREP_TOOL_NAME,
  GLOB_TOOL_NAME,
  FILE_EDIT_TOOL_NAME,
  FILE_WRITE_TOOL_NAME,
]);
/**
 * Returns the configured PR attribution text.
 * Defaults to empty so PRs never include attribution unless explicitly set.
 *
 * @param _getAppState Kept for call-site compatibility.
 */
export async function getEnhancedPRAttribution(
  _getAppState: () => AppState,
): Promise<string> {
  const settings = getInitialSettings()

  if (settings.attribution?.pr !== undefined) {
    return settings.attribution.pr
  }

  return ''
}
