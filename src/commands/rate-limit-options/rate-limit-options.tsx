import React, { useState } from 'react';
import type { CommandResultDisplay, LocalJSXCommandContext } from '../../commands.js';
import { type OptionWithDescription, Select } from '../../components/CustomSelect/select.js';
import { Dialog } from '../../components/design-system/Dialog.js';
import { getFeatureValue_CACHED_MAY_BE_STALE } from '../../services/analytics/growthbook.js';
import { logEvent } from '../../services/analytics/index.js';
import type { ToolUseContext } from '../../Tool.js';
import type { LocalJSXCommandOnDone } from '../../types/command.js';
import { call as extraUsageCall } from '../extra-usage/extra-usage.js';
import { extraUsage } from '../extra-usage/index.js';

type RateLimitOptionsMenuOptionType = 'extra-usage' | 'cancel';

type RateLimitOptionsMenuProps = {
  onDone: (
    result?: string,
    options?: {
      display?: CommandResultDisplay | undefined;
    } | undefined,
  ) => void;
  context: ToolUseContext & LocalJSXCommandContext;
};

function RateLimitOptionsMenu({
  onDone,
  context,
}: RateLimitOptionsMenuProps): React.ReactNode {
  const [subCommandJSX, setSubCommandJSX] = useState<React.ReactNode>(null);
  const buyFirst = getFeatureValue_CACHED_MAY_BE_STALE(
    'tengu_jade_anvil_4',
    false,
  );

  const actionOptions: OptionWithDescription<RateLimitOptionsMenuOptionType>[] = [];
  if (extraUsage.isEnabled()) {
    actionOptions.push({
      label: 'Configure usage-based billing',
      value: 'extra-usage',
    });
  }

  const cancelOption: OptionWithDescription<RateLimitOptionsMenuOptionType> = {
    label: 'Stop and wait for limit to reset',
    value: 'cancel',
  };

  const options = buyFirst
    ? [...actionOptions, cancelOption]
    : [cancelOption, ...actionOptions];

  function handleCancel(): void {
    logEvent('tengu_rate_limit_options_menu_cancel', {});
    onDone(undefined, { display: 'skip' });
  }

  function handleSelect(value: RateLimitOptionsMenuOptionType): void {
    if (value === 'extra-usage') {
      logEvent('tengu_rate_limit_options_menu_select_extra_usage', {});
      void extraUsageCall(onDone, context).then(jsx => {
        if (jsx) {
          setSubCommandJSX(jsx);
        }
      });
    } else if (value === 'cancel') {
      handleCancel();
    }
  }

  if (subCommandJSX) {
    return subCommandJSX;
  }

  return (
    <Dialog
      title="What do you want to do?"
      onCancel={handleCancel}
      color="suggestion"
    >
      <Select
        options={options}
        onChange={handleSelect}
        visibleOptionCount={options.length}
      />
    </Dialog>
  );
}

export async function call(
  onDone: LocalJSXCommandOnDone,
  context: ToolUseContext & LocalJSXCommandContext,
): Promise<React.ReactNode> {
  return <RateLimitOptionsMenu onDone={onDone} context={context} />;
}
