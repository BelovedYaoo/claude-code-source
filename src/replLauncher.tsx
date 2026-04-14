import React from 'react';
import type { StatsStore } from './context/stats.js';
import type { Root } from './ink.js';
import type { Props as REPLProps } from './screens/REPL.js';
import type { AppState } from './state/AppStateStore.js';
import type { FpsMetrics } from './utils/fpsTracker.js';
type AppWrapperProps = {
  getFpsMetrics: () => FpsMetrics | undefined;
  stats?: StatsStore;
  initialState: AppState;
};
export async function launchRepl(root: Root, appProps: AppWrapperProps, replProps: REPLProps, renderAndRun: (root: Root, element: React.ReactNode) => Promise<void>): Promise<void> {
  const { logForDebugging } = await import('./utils/debug.js')
  logForDebugging('[STARTUP] launchRepl: importing App')
  const {
    App
  } = await import('./components/App.js');
  logForDebugging('[STARTUP] launchRepl: App imported')
  const {
    REPL
  } = await import('./screens/REPL.js');
  logForDebugging('[STARTUP] launchRepl: REPL imported')
  await renderAndRun(root, <App {...appProps}>
      <REPL {...replProps} />
    </App>);
}

