import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNotifications } from 'src/context/notifications.js';
import { Text } from 'src/ink.js';
import { getRateLimitWarning, getUsingOverageText } from 'src/services/claudeAiLimits.js';
import { useClaudeAiLimits } from 'src/services/claudeAiLimitsHook.js';
import { getIsRemoteMode } from '../../bootstrap/state.js';

export function useRateLimitWarningNotification(model: string): void {
  const { addNotification } = useNotifications();
  const claudeAiLimits = useClaudeAiLimits();
  const rateLimitWarning = useMemo(
    () => getRateLimitWarning(claudeAiLimits, model),
    [claudeAiLimits, model],
  );
  const usingOverageText = useMemo(
    () => getUsingOverageText(claudeAiLimits),
    [claudeAiLimits],
  );
  const shownWarningRef = useRef<string | null>(null);
  const [hasShownOverageNotification, setHasShownOverageNotification] =
    useState(false);

  useEffect(() => {
    if (getIsRemoteMode()) return;
    if (claudeAiLimits.isUsingOverage && !hasShownOverageNotification) {
      addNotification({
        key: 'limit-reached',
        text: usingOverageText,
        priority: 'immediate',
      });
      setHasShownOverageNotification(true);
    } else if (!claudeAiLimits.isUsingOverage && hasShownOverageNotification) {
      setHasShownOverageNotification(false);
    }
  }, [
    claudeAiLimits.isUsingOverage,
    usingOverageText,
    hasShownOverageNotification,
    addNotification,
  ]);

  useEffect(() => {
    if (getIsRemoteMode()) return;
    if (rateLimitWarning && rateLimitWarning !== shownWarningRef.current) {
      shownWarningRef.current = rateLimitWarning;
      addNotification({
        key: 'rate-limit-warning',
        jsx: (
          <Text>
            <Text color="warning">{rateLimitWarning}</Text>
          </Text>
        ),
        priority: 'high',
      });
    }
  }, [rateLimitWarning, addNotification]);
}
