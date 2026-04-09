import * as React from 'react'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useMainLoopModel } from '../../hooks/useMainLoopModel.js'
import { useTerminalSize } from '../../hooks/useTerminalSize.js'
import { stringWidth } from '../../ink/stringWidth.js'
import { Box, Text } from '../../ink.js'
import { useAppState } from '../../state/AppState.js'
import { getEffortSuffix } from '../../utils/effort.js'
import { truncate } from '../../utils/format.js'
import { isFullscreenEnvEnabled } from '../../utils/fullscreen.js'
import {
  formatModelAndBilling,
  getLogoDisplayData,
  truncatePath,
} from '../../utils/logoV2Utils.js'
import { renderModelSetting } from '../../utils/model/model.js'
import { OffscreenFreeze } from '../OffscreenFreeze.js'
import { AnimatedClawd } from './AnimatedClawd.js'
import { Clawd } from './Clawd.js'
import {
  incrementOverageCreditUpsellSeenCount,
  OverageCreditUpsell,
  useShowOverageCreditUpsell,
} from './OverageCreditUpsell.js'

export function CondensedLogo(): ReactNode {
  const { columns } = useTerminalSize()
  const agent = useAppState(state => state.agent)
  const effortValue = useAppState(state => state.effortValue)
  const model = useMainLoopModel()
  const modelDisplayName = renderModelSetting(model)
  const {
    version,
    cwd,
    billingType,
    agentName: agentNameFromSettings,
  } = getLogoDisplayData()

  const agentName = agent ?? agentNameFromSettings
  const showOverageCreditUpsell = useShowOverageCreditUpsell()

  useEffect(() => {
    if (showOverageCreditUpsell) {
      incrementOverageCreditUpsellSeenCount()
    }
  }, [showOverageCreditUpsell])

  const textWidth = Math.max(columns - 15, 20)
  const truncatedVersion = truncate(version, Math.max(textWidth - 13, 6))

  const effortSuffix = getEffortSuffix(model, effortValue)
  const { shouldSplit, truncatedModel, truncatedBilling } =
    formatModelAndBilling(
      modelDisplayName + effortSuffix,
      billingType,
      textWidth,
    )

  const cwdAvailableWidth = agentName
    ? textWidth - 1 - stringWidth(agentName) - 3
    : textWidth
  const truncatedCwd = truncatePath(cwd, Math.max(cwdAvailableWidth, 10))

  return (
    <OffscreenFreeze>
      <Box flexDirection="row" gap={2} alignItems="center">
        {isFullscreenEnvEnabled() ? <AnimatedClawd /> : <Clawd />}

        <Box flexDirection="column">
          <Text>
            <Text bold={true}>Claude Code</Text>{' '}
            <Text dimColor={true}>v{truncatedVersion}</Text>
          </Text>
          {shouldSplit ? (
            <>
              <Text dimColor={true}>{truncatedModel}</Text>
              <Text dimColor={true}>{truncatedBilling}</Text>
            </>
          ) : (
            <Text dimColor={true}>
              {truncatedModel} · {truncatedBilling}
            </Text>
          )}
          <Text dimColor={true}>
            {agentName ? `@${agentName} · ${truncatedCwd}` : truncatedCwd}
          </Text>
          {showOverageCreditUpsell && (
            <OverageCreditUpsell maxWidth={textWidth} twoLine={true} />
          )}
        </Box>
      </Box>
    </OffscreenFreeze>
  )
}
