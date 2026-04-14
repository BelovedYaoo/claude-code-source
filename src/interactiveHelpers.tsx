import { appendFileSync } from 'fs';
import { feature } from 'bun:bundle';
import React from 'react';
import { gracefulShutdown, gracefulShutdownSync } from 'src/utils/gracefulShutdown.js';
import { setSessionTrustAccepted, setStatsStore } from './bootstrap/state.js';
import type { Command } from './commands.js';
import { createStatsStore, type StatsStore } from './context/stats.js';
import { getSystemContext } from './context.js';
import { isSynchronizedOutputSupported } from './ink/terminal.js';
import type { RenderOptions, Root, TextProps } from './ink.js';
import { KeybindingSetup } from './keybindings/KeybindingProviderSetup.js';
import { startDeferredPrefetches } from './main.js';
import { handleMcpjsonServerApprovals } from './services/mcpServerApproval.js';
import { AppStateProvider } from './state/AppState.js';
import { onChangeAppState } from './state/onChangeAppState.js';
import { getExternalClaudeMdIncludes, getMemoryFiles, shouldShowClaudeMdExternalIncludesWarning } from './utils/claudemd.js';
import { checkHasTrustDialogAccepted, getGlobalConfig, saveGlobalConfig } from './utils/config.js';
import { logForDebugging } from './utils/debug.js';
import { updateDeepLinkTerminalPreference } from './utils/deepLink/terminalPreference.js';
import { isEnvTruthy } from './utils/envUtils.js';
import { type FpsMetrics, FpsTracker } from './utils/fpsTracker.js';
import { updateGithubRepoPathMapping } from './utils/githubRepoPathMapping.js';
import { applyConfigEnvironmentVariables } from './utils/managedEnv.js';
import type { PermissionMode } from './utils/permissions/PermissionMode.js';
import { getBaseRenderOptions } from './utils/renderOptions.js';
import { getSettingsWithAllErrors } from './utils/settings/allErrors.js';
import { hasAutoModeOptIn, hasSkipDangerousModePermissionPrompt } from './utils/settings/settings.js';
export function completeOnboarding(): void {
  saveGlobalConfig(current => ({
    ...current,
    hasCompletedOnboarding: true,
    lastOnboardingVersion: MACRO.VERSION
  }));
}
export function showDialog<T = void>(root: Root, renderer: (done: (result: T) => void) => React.ReactNode): Promise<T> {
  return new Promise<T>(resolve => {
    const done = (result: T): void => void resolve(result);
    root.render(renderer(done));
  });
}

/**
 * Render an error message through Ink, then unmount and exit.
 * Use this for fatal errors after the Ink root has been created —
 * console.error is swallowed by Ink's patchConsole, so we render
 * through the React tree instead.
 */
export async function exitWithError(root: Root, message: string, beforeExit?: () => Promise<void>): Promise<never> {
  return exitWithMessage(root, message, {
    color: 'error',
    beforeExit
  });
}

/**
 * Render a message through Ink, then unmount and exit.
 * Use this for messages after the Ink root has been created —
 * console output is swallowed by Ink's patchConsole, so we render
 * through the React tree instead.
 */
export async function exitWithMessage(root: Root, message: string, options?: {
  color?: TextProps['color'];
  exitCode?: number;
  beforeExit?: () => Promise<void>;
}): Promise<never> {
  const {
    Text
  } = await import('./ink.js');
  const color = options?.color;
  const exitCode = options?.exitCode ?? 1;
  root.render(color ? <Text color={color}>{message}</Text> : <Text>{message}</Text>);
  root.unmount();
  await options?.beforeExit?.();
  // eslint-disable-next-line custom-rules/no-process-exit -- exit after Ink unmount
  process.exit(exitCode);
}

/**
 * Show a setup dialog wrapped in AppStateProvider + KeybindingSetup.
 * Reduces boilerplate in showSetupScreens() where every dialog needs these wrappers.
 */
export function showSetupDialog<T = void>(root: Root, renderer: (done: (result: T) => void) => React.ReactNode, options?: {
  onChangeAppState?: typeof onChangeAppState;
}): Promise<T> {
  return showDialog<T>(root, done => <AppStateProvider onChangeAppState={options?.onChangeAppState}>
      <KeybindingSetup>{renderer(done)}</KeybindingSetup>
    </AppStateProvider>);
}

/**
 * Render the main UI into the root and wait for it to exit.
 * Handles the common epilogue: start deferred prefetches, wait for exit, graceful shutdown.
 */
export async function renderAndRun(root: Root, element: React.ReactNode): Promise<void> {
  root.render(element);
  logForDebugging('[STARTUP] root.render() called');
  startDeferredPrefetches();
  await root.waitUntilExit();
  await gracefulShutdown(0);
}
export async function showSetupScreens(root: Root, permissionMode: PermissionMode, allowDangerouslySkipPermissions: boolean, commands?: Command[], claudeInChrome?: boolean): Promise<boolean> {
  if ("production" === 'test' || isEnvTruthy(false) || process.env.IS_DEMO // Skip onboarding in demo mode
  ) {
    return false;
  }
  const config = getGlobalConfig();
  logForDebugging('[STARTUP] showSetupScreens: entered')
  let onboardingShown = false;
  if (!config.theme || !config.hasCompletedOnboarding // always show onboarding at least once
  ) {
    onboardingShown = true;
    logForDebugging('[STARTUP] showSetupScreens: loading Onboarding')
    const {
      Onboarding
    } = await import('./components/Onboarding.js');
    await showSetupDialog(root, done => <Onboarding onDone={() => {
      completeOnboarding();
      void done();
    }} />, {
      onChangeAppState
    });
  }

  // Always show the trust dialog in interactive sessions, regardless of permission mode.
  // The trust dialog is the workspace trust boundary — it warns about untrusted repos
  // and checks CLAUDE.md external includes. bypassPermissions mode
  // only affects tool execution permissions, not workspace trust.
  // Note: non-interactive sessions (CI/CD with -p) never reach showSetupScreens at all.
  // Skip permission checks in claubbit
  if (!isEnvTruthy(process.env.CLAUBBIT)) {
    // Fast-path: skip TrustDialog import+render when CWD is already trusted.
    // If it returns true, the TrustDialog would auto-resolve regardless of
    // security features, so we can skip the dynamic import and render cycle.
    if (!checkHasTrustDialogAccepted()) {
      logForDebugging('[STARTUP] showSetupScreens: loading TrustDialog')
      const {
        TrustDialog
      } = await import('./components/TrustDialog/TrustDialog.js');
      await showSetupDialog(root, done => <TrustDialog commands={commands} onDone={done} />);
    }

    setSessionTrustAccepted(true);

    // Now that trust is established, prefetch system context if it wasn't already
    void getSystemContext();

    // If settings are valid, check for any mcp.json servers that need approval
    logForDebugging('[STARTUP] showSetupScreens: reading settings errors')
    const {
      errors: allErrors
    } = getSettingsWithAllErrors();
    if (allErrors.length === 0) {
      logForDebugging('[STARTUP] showSetupScreens: handleMcpjsonServerApprovals start')
      await handleMcpjsonServerApprovals(root);
      logForDebugging('[STARTUP] showSetupScreens: handleMcpjsonServerApprovals end')
    }

    // Check for claude.md includes that need approval
    logForDebugging('[STARTUP] showSetupScreens: checking ClaudeMd external includes warning')
    if (await shouldShowClaudeMdExternalIncludesWarning()) {
      logForDebugging('[STARTUP] showSetupScreens: loading memory files for external includes')
      const externalIncludes = getExternalClaudeMdIncludes(await getMemoryFiles(true));
      const {
        ClaudeMdExternalIncludesDialog
      } = await import('./components/ClaudeMdExternalIncludesDialog.js');
      await showSetupDialog(root, done => <ClaudeMdExternalIncludesDialog onDone={done} isStandaloneDialog externalIncludes={externalIncludes} />);
    }
  }

  // 跟踪当前仓库路径，用于远程仓库路径切换（fire-and-forget）
  // This must happen AFTER trust to prevent untrusted directories from poisoning the mapping
  logForDebugging('[STARTUP] showSetupScreens: updateGithubRepoPathMapping fire-and-forget')
  void updateGithubRepoPathMapping();
  if (feature('LODESTONE')) {
    logForDebugging('[STARTUP] showSetupScreens: updateDeepLinkTerminalPreference start')
    updateDeepLinkTerminalPreference();
    logForDebugging('[STARTUP] showSetupScreens: updateDeepLinkTerminalPreference end')
  } else {
    logForDebugging('[STARTUP] showSetupScreens: updateDeepLinkTerminalPreference skipped')
  }

  // Apply full environment variables after trust dialog is accepted OR in bypass mode
  // In bypass mode (CI/CD, automation), we trust the environment so apply all variables
  // In normal mode, this happens after the trust dialog is accepted
  // This includes potentially dangerous environment variables from untrusted sources
  logForDebugging('[STARTUP] showSetupScreens: applyConfigEnvironmentVariables start')
  applyConfigEnvironmentVariables();
  logForDebugging('[STARTUP] showSetupScreens: applyConfigEnvironmentVariables end')

  // 遥测初始化已移除。

  logForDebugging('[STARTUP] showSetupScreens: checking bypass permissions dialog')
  if ((permissionMode === 'bypassPermissions' || allowDangerouslySkipPermissions) && !hasSkipDangerousModePermissionPrompt()) {
    logForDebugging('[STARTUP] showSetupScreens: bypass permissions dialog start')
    const {
      BypassPermissionsModeDialog
    } = await import('./components/BypassPermissionsModeDialog.js');
    await showSetupDialog(root, done => <BypassPermissionsModeDialog onAccept={done} />);
    logForDebugging('[STARTUP] showSetupScreens: bypass permissions dialog end')
  } else {
    logForDebugging('[STARTUP] showSetupScreens: bypass permissions dialog skipped')
  }
  if (feature('TRANSCRIPT_CLASSIFIER')) {
    // Only show the opt-in dialog if auto mode actually resolved — if the
    // gate denied it (org not allowlisted, settings disabled), showing
    // consent for an unavailable feature is pointless. The
    // verifyAutoModeGateAccess notification will explain why instead.
    logForDebugging('[STARTUP] showSetupScreens: checking auto mode opt-in dialog')
    if (permissionMode === 'auto' && !hasAutoModeOptIn()) {
      logForDebugging('[STARTUP] showSetupScreens: auto mode opt-in dialog start')
      const {
        AutoModeOptInDialog
      } = await import('./components/AutoModeOptInDialog.js');
      await showSetupDialog(root, done => <AutoModeOptInDialog onAccept={done} onDecline={() => gracefulShutdownSync(1)} declineExits />);
      logForDebugging('[STARTUP] showSetupScreens: auto mode opt-in dialog end')
    } else {
      logForDebugging('[STARTUP] showSetupScreens: auto mode opt-in dialog skipped')
    }
  }

  // Show Chrome onboarding for first-time Claude in Chrome users
  logForDebugging('[STARTUP] showSetupScreens: checking Claude in Chrome onboarding')
  if (claudeInChrome && !getGlobalConfig().hasCompletedClaudeInChromeOnboarding) {
    logForDebugging('[STARTUP] showSetupScreens: Claude in Chrome onboarding start')
    const {
      ClaudeInChromeOnboarding
    } = await import('./components/ClaudeInChromeOnboarding.js');
    await showSetupDialog(root, done => <ClaudeInChromeOnboarding onDone={done} />);
    logForDebugging('[STARTUP] showSetupScreens: Claude in Chrome onboarding end')
  } else {
    logForDebugging('[STARTUP] showSetupScreens: Claude in Chrome onboarding skipped')
  }
  logForDebugging('[STARTUP] showSetupScreens: completed')
  return onboardingShown;
}
export function getRenderContext(exitOnCtrlC: boolean): {
  renderOptions: RenderOptions;
  getFpsMetrics: () => FpsMetrics | undefined;
  stats: StatsStore;
} {
  let lastFlickerTime = 0;
  const baseOptions = getBaseRenderOptions(exitOnCtrlC);

  // Log analytics event when stdin override is active
  if (baseOptions.stdin) {
  }
  const fpsTracker = new FpsTracker();
  const stats = createStatsStore();
  setStatsStore(stats);

  // Bench mode: when set, append per-frame phase timings as JSONL for
  // offline analysis by bench/repl-scroll.ts. Captures the full TUI
  // render pipeline (yoga → screen buffer → diff → optimize → stdout)
  // so perf work on any phase can be validated against real user flows.
  const frameTimingLogPath = process.env.CLAUDE_CODE_FRAME_TIMING_LOG;
  return {
    getFpsMetrics: () => fpsTracker.getMetrics(),
    stats,
    renderOptions: {
      ...baseOptions,
      onFrame: event => {
        fpsTracker.record(event.durationMs);
        stats.observe('frame_duration_ms', event.durationMs);
        if (frameTimingLogPath && event.phases) {
          // Bench-only env-var-gated path: sync write so no frames dropped
          // on abrupt exit. ~100 bytes at ≤60fps is negligible. rss/cpu are
          // single syscalls; cpu is cumulative — bench side computes delta.
          const line =
          // eslint-disable-next-line custom-rules/no-direct-json-operations -- tiny object, hot bench path
          JSON.stringify({
            total: event.durationMs,
            ...event.phases,
            rss: process.memoryUsage.rss(),
            cpu: process.cpuUsage()
          }) + '\n';
          // eslint-disable-next-line custom-rules/no-sync-fs -- bench-only, sync so no frames dropped on exit
          appendFileSync(frameTimingLogPath, line);
        }
        // Skip flicker reporting for terminals with synchronized output —
        // DEC 2026 buffers between BSU/ESU so clear+redraw is atomic.
        if (isSynchronizedOutputSupported()) {
          return;
        }
        for (const flicker of event.flickers) {
          if (flicker.reason === 'resize') {
            continue;
          }
          const now = Date.now();
          if (now - lastFlickerTime < 1000) {
          }
          lastFlickerTime = now;
        }
      }
    }
  };
}

