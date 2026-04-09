import { getFeatureValue_CACHED_MAY_BE_STALE } from '../../../services/analytics/growthbook.js'
import { getCwd } from '../../cwd.js'
import { logForDebugging } from '../../debug.js'
import { detectCurrentRepository } from '../../detectRepository.js'
import { errorMessage } from '../../errors.js'
import { findGitRoot, getIsClean } from '../../git.js'
import { getOAuthHeaders } from '../../teleport/api.js'
import { fetchEnvironments } from '../../teleport/environments.js'

/**
 * Remote sessions are unavailable in API-only mode.
 * Extracted from getTeleportErrors() in TeleportError.tsx
 * @returns true when the unavailable state should be shown
 */
export async function checkRemoteUnavailableInApiMode(): Promise<boolean> {
  return true
}

/**
 * Checks if git working directory is clean (no uncommitted changes)
 * Ignores untracked files since they won't be lost during branch switching
 * Extracted from getTeleportErrors() in TeleportError.tsx
 * @returns true if git is clean, false otherwise
 */
export async function checkIsGitClean(): Promise<boolean> {
  const isClean = await getIsClean({ ignoreUntracked: true })
  return isClean
}

/**
 * Checks if user has access to at least one remote environment
 * @returns true if user has remote environments, false otherwise
 */
export async function checkHasRemoteEnvironment(): Promise<boolean> {
  try {
    const environments = await fetchEnvironments()
    return environments.length > 0
  } catch (error) {
    logForDebugging(`checkHasRemoteEnvironment failed: ${errorMessage(error)}`)
    return false
  }
}

/**
 * Checks if current directory is inside a git repository (has .git/).
 * Distinct from checkHasGitRemote — a local-only repo passes this but not that.
 */
export function checkIsInGitRepo(): boolean {
  return findGitRoot(getCwd()) !== null
}

/**
 * Checks if current repository has a GitHub remote configured.
 * Returns false for local-only repos (git init with no `origin`).
 */
export async function checkHasGitRemote(): Promise<boolean> {
  const repository = await detectCurrentRepository()
  return repository !== null
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
 * Checks if the user has synced their GitHub credentials via /web-setup
 * @returns true if GitHub token is synced, false otherwise
 */
export async function checkGithubTokenSynced(): Promise<boolean> {
  return false
}

type RepoAccessMethod = 'github-app' | 'token-sync' | 'none'

/**
 * Tiered check for whether a GitHub repo is accessible for remote operations.
 * 1. GitHub App installed on the repo
 * 2. GitHub token synced via /web-setup
 * 3. Neither — caller should prompt user to set up access
 */
export async function checkRepoForRemoteAccess(
  owner: string,
  repo: string,
): Promise<{ hasAccess: boolean; method: RepoAccessMethod }> {
  if (await checkGithubAppInstalled(owner, repo)) {
    return { hasAccess: true, method: 'github-app' }
  }
  if (
    getFeatureValue_CACHED_MAY_BE_STALE('tengu_cobalt_lantern', false) &&
    (await checkGithubTokenSynced())
  ) {
    return { hasAccess: true, method: 'token-sync' }
  }
  return { hasAccess: false, method: 'none' }
}
