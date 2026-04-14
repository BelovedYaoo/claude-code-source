import { getFeatureValue_CACHED_MAY_BE_STALE } from '../../../services/analytics/growthbook.js'
import { getCwd } from '../../cwd.js'
import { logForDebugging } from '../../debug.js'
import { detectCurrentRepository } from '../../detectRepository.js'
import { findGitRoot } from '../../git.js'

/**
 * API-only 模式下远程会话不可用。
 * @returns true when the unavailable state should be shown
 */
export async function checkRemoteUnavailableInApiMode(): Promise<boolean> {
  return true
}

/**
 * API-only 模式下远程环境不可用。
 */
export async function checkHasRemoteEnvironment(): Promise<boolean> {
  logForDebugging('Remote environments are unavailable in API-only mode')
  return false
}

/**
 * Checks if current directory is inside a git repository (has .git/).
 * Distinct from checkHasGitRemote — a local-only repo passes this but not that.
 */
export function checkIsInGitRepo(): boolean {
  return findGitRoot(getCwd()) !== null
}

/**
 * Checks if GitHub app is installed on a specific repository
 * @param owner The repository owner (e.g., "anthropics")
 * @param repo The repository name (e.g., "claude-cli-internal")
 * @returns true if GitHub app is installed, false otherwise
 */
export async function checkGithubAppInstalled(
  _owner: string,
  _repo: string,
  _signal?: AbortSignal,
): Promise<boolean> {
  return false
}

/**
 * Checks if the user has synced their GitHub credentials via the web auth flow
 * @returns true if GitHub token is synced, false otherwise
 */
export async function checkGithubTokenSynced(): Promise<boolean> {
  return false
}

type RepoAccessMethod = 'github-app' | 'token-sync' | 'none'

