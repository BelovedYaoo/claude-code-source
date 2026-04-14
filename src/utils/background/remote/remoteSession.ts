/**
 * Precondition failures for background remote sessions
 */
export type BackgroundRemoteSessionPrecondition =
  | { type: 'api_only_unavailable' }
  | { type: 'no_remote_environment' }
  | { type: 'not_in_git_repo' }
  | { type: 'no_git_remote' }
  | { type: 'github_app_not_installed' }
  | { type: 'policy_blocked' }

