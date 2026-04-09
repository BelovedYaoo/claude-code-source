import { execa } from 'execa'
import memoize from 'lodash-es/memoize.js'
import { getSessionId } from '../bootstrap/state.js'
import { getOrCreateUserID } from './config.js'
import { getCwd } from './cwd.js'
import { type env, getHostPlatformForAnalytics } from './env.js'
import { isEnvTruthy } from './envUtils.js'

let cachedEmail: string | undefined | null = null
let emailFetchPromise: Promise<string | undefined> | null = null

export type GitHubActionsMetadata = {
  actor?: string
  actorId?: string
  repository?: string
  repositoryId?: string
  repositoryOwner?: string
  repositoryOwnerId?: string
}

export type CoreUserData = {
  deviceId: string
  sessionId: string
  email?: string
  appVersion: string
  platform: typeof env.platform
  organizationUuid?: string
  accountUuid?: string
  userType?: string
  subscriptionType?: string
  rateLimitTier?: string
  firstTokenTime?: number
  githubActionsMetadata?: GitHubActionsMetadata
}

export async function initUser(): Promise<void> {
  if (cachedEmail === null && !emailFetchPromise) {
    emailFetchPromise = getEmailAsync()
    cachedEmail = await emailFetchPromise
    emailFetchPromise = null
    getCoreUserData.cache.clear?.()
  }
}

export function resetUserCache(): void {
  cachedEmail = null
  emailFetchPromise = null
  getCoreUserData.cache.clear?.()
  getGitEmail.cache.clear?.()
}

export const getCoreUserData = memoize(
  (_includeAnalyticsMetadata?: boolean): CoreUserData => {
    return {
      deviceId: getOrCreateUserID(),
      sessionId: getSessionId(),
      email: getEmail(),
      appVersion: MACRO.VERSION,
      platform: getHostPlatformForAnalytics(),
      userType: process.env.USER_TYPE,
      ...(isEnvTruthy(process.env.GITHUB_ACTIONS) && {
        githubActionsMetadata: {
          actor: process.env.GITHUB_ACTOR,
          actorId: process.env.GITHUB_ACTOR_ID,
          repository: process.env.GITHUB_REPOSITORY,
          repositoryId: process.env.GITHUB_REPOSITORY_ID,
          repositoryOwner: process.env.GITHUB_REPOSITORY_OWNER,
          repositoryOwnerId: process.env.GITHUB_REPOSITORY_OWNER_ID,
        },
      }),
    }
  },
)

export function getUserForGrowthBook(): CoreUserData {
  return getCoreUserData(true)
}

function getEmail(): string | undefined {
  if (cachedEmail !== null) {
    return cachedEmail
  }

  if (process.env.USER_TYPE !== 'ant') {
    return undefined
  }

  if (process.env.COO_CREATOR) {
    return `${process.env.COO_CREATOR}@anthropic.com`
  }

  return undefined
}

async function getEmailAsync(): Promise<string | undefined> {
  if (process.env.USER_TYPE !== 'ant') {
    return undefined
  }

  if (process.env.COO_CREATOR) {
    return `${process.env.COO_CREATOR}@anthropic.com`
  }

  return getGitEmail()
}

export const getGitEmail = memoize(async (): Promise<string | undefined> => {
  const result = await execa('git config --get user.email', {
    shell: true,
    reject: false,
    cwd: getCwd(),
  })
  return result.exitCode === 0 && result.stdout
    ? result.stdout.trim()
    : undefined
})
