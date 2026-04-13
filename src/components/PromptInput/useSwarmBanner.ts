import * as React from 'react'
import { useAppState, useAppStateStore } from '../../state/AppState.js'
import {
  getActiveAgentForInput,
  getViewedTeammateTask,
} from '../../state/selectors.js'
import {
  AGENT_COLOR_TO_THEME_COLOR,
  AGENT_COLORS,
  type AgentColorName,
  getAgentColor,
} from '../../tools/AgentTool/agentColorManager.js'
import { getStandaloneAgentName } from '../../utils/standaloneAgent.js'
import { isInsideTmux } from '../../utils/swarm/backends/detection.js'
import {
  getCachedDetectionResult,
  isInProcessEnabled,
} from '../../utils/swarm/backends/registry.js'
import { getSwarmSocketName } from '../../utils/swarm/constants.js'
import {
  getAgentName,
  getTeammateColor,
  getTeamName,
  isTeammate,
} from '../../utils/teammate.js'
import { isInProcessTeammate } from '../../utils/teammateContext.js'
import type { Theme } from '../../utils/theme.js'

type SwarmBannerInfo = {
  text: string
  bgColor: keyof Theme
} | null

/**
 * 返回 swarm、独立 agent 或 --agent CLI 场景下的横幅信息。
 * - Leader（非 tmux）：返回 "tmux -L ... attach" 提示，背景色为青色
 * - Leader（tmux / 进程内）：继续走独立 agent 检查，显示已设置的名称/颜色
 * - Teammate：返回 "teammate@team" 格式，使用其分配的背景色
 * - 查看后台 agent（CoordinatorTaskPanel）：返回 agent 名称及其颜色
 * - 独立 agent：返回其名称及颜色（无 @team）
 * - --agent CLI 参数：返回 "@agentName"，背景色为青色
 */
export function useSwarmBanner(): SwarmBannerInfo {
  const teamContext = useAppState(s => s.teamContext)
  const standaloneAgentContext = useAppState(s => s.standaloneAgentContext)
  const agent = useAppState(s => s.agent)
  // Subscribe so the banner updates on enter/exit teammate view even though
  // getActiveAgentForInput reads it from store.getState().
  useAppState(s => s.viewingAgentTaskId)
  const store = useAppStateStore()
  const [insideTmux, setInsideTmux] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    void isInsideTmux().then(setInsideTmux)
  }, [])

  const state = store.getState()

  // Teammate process: show @agentName with assigned color.
  // In-process teammates run headless — their banner shows in the leader UI instead.
  if (isTeammate() && !isInProcessTeammate()) {
    const agentName = getAgentName()
    if (agentName && getTeamName()) {
      return {
        text: `@${agentName}`,
        bgColor: toThemeColor(
          teamContext?.selfAgentColor ?? getTeammateColor(),
        ),
      }
    }
  }

  // Leader with spawned teammates: tmux-attach hint when external, else show
  // the viewed teammate's name when inside tmux / native panes / in-process.
  const hasTeammates =
    teamContext?.teamName &&
    teamContext.teammates &&
    Object.keys(teamContext.teammates).length > 0
  if (hasTeammates) {
    const viewedTeammate = getViewedTeammateTask(state)
    const viewedColor = toThemeColor(viewedTeammate?.identity.color)
    const inProcessMode = isInProcessEnabled()
    const nativePanes = getCachedDetectionResult()?.isNative ?? false

    if (insideTmux === false && !inProcessMode && !nativePanes) {
      return {
        text: `View teammates: \`tmux -L ${getSwarmSocketName()} a\``,
        bgColor: viewedColor,
      }
    }
    if (
      (insideTmux === true || inProcessMode || nativePanes) &&
      viewedTeammate
    ) {
      return {
        text: `@${viewedTeammate.identity.agentName}`,
        bgColor: viewedColor,
      }
    }
    // insideTmux === null：仍在加载，继续向后判断。
    // 未查看 teammate 时，继续沿用当前独立 agent 的名称/颜色。
  }

  // Viewing a background agent (CoordinatorTaskPanel): local_agent tasks aren't
  // InProcessTeammates, so getViewedTeammateTask misses them. Reverse-lookup the
  // name from agentNameRegistry the same way CoordinatorAgentStatus does.
  const active = getActiveAgentForInput(state)
  if (active.type === 'named_agent') {
    const task = active.task
    let name: string | undefined
    for (const [n, id] of state.agentNameRegistry) {
      if (id === task.id) {
        name = n
        break
      }
    }
    return {
      text: name ? `@${name}` : task.description,
      bgColor: getAgentColor(task.agentType) ?? 'cyan_FOR_SUBAGENTS_ONLY',
    }
  }

  // 独立 agent：显示名称和/或自定义颜色，不带 @team。
  const standaloneName = getStandaloneAgentName(state)
  const standaloneColor = standaloneAgentContext?.color
  if (standaloneName || standaloneColor) {
    return {
      text: standaloneName ?? '',
      bgColor: toThemeColor(standaloneColor),
    }
  }

  // --agent CLI flag (when not handled above).
  if (agent) {
    const agentDef = state.agentDefinitions.activeAgents.find(
      a => a.agentType === agent,
    )
    return {
      text: agent,
      bgColor: toThemeColor(agentDef?.color, 'promptBorder'),
    }
  }

  return null
}

function toThemeColor(
  colorName: string | undefined,
  fallback: keyof Theme = 'cyan_FOR_SUBAGENTS_ONLY',
): keyof Theme {
  return colorName && AGENT_COLORS.includes(colorName as AgentColorName)
    ? AGENT_COLOR_TO_THEME_COLOR[colorName as AgentColorName]
    : fallback
}
