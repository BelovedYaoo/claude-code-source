import * as React from 'react';
import type { LocalJSXCommandContext } from '../../commands.js';
import { ConfigurableShortcutHint } from '../../components/ConfigurableShortcutHint.js';
import { Dialog } from '../../components/design-system/Dialog.js';
import { Text } from '../../ink.js';
import type { LocalJSXCommandOnDone } from '../../types/command.js';

export async function call(onDone: LocalJSXCommandOnDone, _context: LocalJSXCommandContext): Promise<React.ReactNode> {
  return <Login onDone={() => {
    onDone('Login is unavailable in API-only mode.');
  }} />;
}
export function Login(props: {
  onDone: (success: boolean) => void;
  startingMessage?: string;
}): React.ReactNode {
  return <Dialog title="Login" onCancel={() => props.onDone(false)} color="permission" inputGuide={_temp}>
      {props.startingMessage ? <Text bold>{props.startingMessage}</Text> : null}
      <Text color="warning">Login is unavailable in API-only mode.</Text>
      <Text dimColor>Use ANTHROPIC_API_KEY, configure apiKeyHelper, or use a supported third-party provider.</Text>
    </Dialog>;
}
function _temp(exitState: {
  pending: boolean;
  keyName: string;
}): React.ReactNode {
  return exitState.pending ? <Text>Press {exitState.keyName} again to exit</Text> : <ConfigurableShortcutHint action="confirm:no" context="Confirmation" fallback="Esc" description="cancel" />;
}

