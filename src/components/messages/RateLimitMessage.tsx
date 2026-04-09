import { c as _c } from "react/compiler-runtime";
import React, { useEffect, useMemo, useState } from 'react';
import { extraUsage } from 'src/commands/extra-usage/index.js';
import { Box, Text } from 'src/ink.js';
import { useClaudeAiLimits } from 'src/services/claudeAiLimitsHook.js';
import { shouldProcessMockLimits } from 'src/services/rateLimitMocking.js'; // Used for /mock-limits command
import { MessageResponse } from '../MessageResponse.js';

type UpsellParams = {
  shouldShowUpsell: boolean;
  isExtraUsageCommandEnabled: boolean;
  shouldAutoOpenRateLimitOptionsMenu: boolean;
};

export function getUpsellMessage({
  shouldShowUpsell,
  isExtraUsageCommandEnabled,
  shouldAutoOpenRateLimitOptionsMenu
}: UpsellParams): string | null {
  if (!shouldShowUpsell) return null;
  if (shouldAutoOpenRateLimitOptionsMenu) {
    return 'Opening your options…';
  }
  if (isExtraUsageCommandEnabled) {
    return '/extra-usage to review usage-based billing options.';
  }
  return 'Use ANTHROPIC_API_KEY or apiKeyHelper to continue with usage-based billing.';
}

type RateLimitMessageProps = {
  text: string;
  onOpenRateLimitOptions?: () => void;
};

export function RateLimitMessage(t0) {
  const $ = _c(12);
  const {
    text,
    onOpenRateLimitOptions
  } = t0;
  let t1;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t1 = shouldProcessMockLimits();
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  const shouldShowUpsell = t1;
  const [hasOpenedInteractiveMenu, setHasOpenedInteractiveMenu] = useState(false);
  const claudeAiLimits = useClaudeAiLimits();
  const isCurrentlyRateLimited = claudeAiLimits.status === "rejected" && claudeAiLimits.resetsAt !== undefined && !claudeAiLimits.isUsingOverage;
  const shouldAutoOpenRateLimitOptionsMenu = shouldShowUpsell && !hasOpenedInteractiveMenu && isCurrentlyRateLimited && onOpenRateLimitOptions;
  useEffect(() => {
    if (shouldAutoOpenRateLimitOptionsMenu) {
      setHasOpenedInteractiveMenu(true);
      onOpenRateLimitOptions();
    }
  }, [shouldAutoOpenRateLimitOptionsMenu, onOpenRateLimitOptions]);
  const upsell = useMemo(() => {
    const message = getUpsellMessage({
      shouldShowUpsell,
      isExtraUsageCommandEnabled: extraUsage.isEnabled(),
      shouldAutoOpenRateLimitOptionsMenu: !!shouldAutoOpenRateLimitOptionsMenu
    });
    if (!message) return null;
    return <Text dimColor={true}>{message}</Text>;
  }, [shouldShowUpsell, shouldAutoOpenRateLimitOptionsMenu]);
  return <MessageResponse><Box flexDirection="column"><Text color="error">{text}</Text>{hasOpenedInteractiveMenu ? null : upsell}</Box></MessageResponse>;
}
