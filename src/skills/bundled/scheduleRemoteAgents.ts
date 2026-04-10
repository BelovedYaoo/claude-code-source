import { getFeatureValue_CACHED_MAY_BE_STALE } from '../../services/analytics/growthbook.js'
import { isPolicyAllowed } from '../../services/policyLimits/index.js'
import type { ToolUseContext } from '../../Tool.js'
import { ASK_USER_QUESTION_TOOL_NAME } from '../../tools/AskUserQuestionTool/prompt.js'
import { REMOTE_TRIGGER_TOOL_NAME } from '../../tools/RemoteTriggerTool/prompt.js'
import { registerBundledSkill } from '../bundledSkills.js'

export function registerScheduleSkill(): void {
  registerBundledSkill({
    name: 'schedule',
    description:
      'Create, update, list, or run scheduled remote agents (triggers) that execute on a cron schedule.',
    whenToUse:
      'When the user wants to schedule a recurring remote agent, set up automated tasks, create a cron job for Claude Code, or manage their scheduled agents/triggers.',
    userInvocable: true,
    isEnabled: () =>
      getFeatureValue_CACHED_MAY_BE_STALE('tengu_surreal_dali', false) &&
      isPolicyAllowed('allow_remote_sessions'),
    allowedTools: [REMOTE_TRIGGER_TOOL_NAME, ASK_USER_QUESTION_TOOL_NAME],
    async getPromptForCommand(_args: string, _context: ToolUseContext) {
      return [
        {
          type: 'text',
          text: 'Scheduling remote agents is unavailable in API-only mode.',
        },
      ]
    },
  })
}
