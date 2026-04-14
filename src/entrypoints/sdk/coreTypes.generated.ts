/**
 * Auto-generated SDK Core Types - DO NOT EDIT MANUALLY.
 *
 * Generated from Zod schemas in coreSchemas.ts.
 * To regenerate: bun scripts/generate-sdk-types.ts
 */

import type { z } from 'zod/v4'
import type {
  ModelUsageSchema,
  ApiKeySourceSchema,
  ConfigScopeSchema,
  ThinkingConfigSchema,
  McpServerConfigForProcessTransportSchema,
  McpServerStatusSchema,
  PermissionRuleValueSchema,
  PermissionUpdateSchema,
  PermissionResultSchema,
  PermissionModeSchema,
  HookEventSchema,
  PreToolUseHookInputSchema,
  PermissionRequestHookInputSchema,
  PostToolUseHookInputSchema,
  PostToolUseFailureHookInputSchema,
  PermissionDeniedHookInputSchema,
  NotificationHookInputSchema,
  UserPromptSubmitHookInputSchema,
  SessionStartHookInputSchema,
  SetupHookInputSchema,
  StopHookInputSchema,
  StopFailureHookInputSchema,
  SubagentStartHookInputSchema,
  SubagentStopHookInputSchema,
  PreCompactHookInputSchema,
  PostCompactHookInputSchema,
  TeammateIdleHookInputSchema,
  TaskCreatedHookInputSchema,
  TaskCompletedHookInputSchema,
  ElicitationHookInputSchema,
  ElicitationResultHookInputSchema,
  ConfigChangeHookInputSchema,
  InstructionsLoadedHookInputSchema,
  CwdChangedHookInputSchema,
  FileChangedHookInputSchema,
  ExitReasonSchema,
  SessionEndHookInputSchema,
  HookInputSchema,
  AsyncHookJSONOutputSchema,
  SyncHookJSONOutputSchema,
  HookJSONOutputSchema,
  ModelInfoSchema,
  AgentDefinitionSchema,
  SettingSourceSchema,
  RewindFilesResultSchema,
  SDKAssistantMessageErrorSchema,
  SDKStatusSchema,
  SDKUserMessageSchema,
  SDKUserMessageReplaySchema,
  SDKRateLimitInfoSchema,
  SDKAssistantMessageSchema,
  SDKPermissionDenialSchema,
  SDKCompactBoundaryMessageSchema,
  SDKMessageSchema,

} from './coreSchemas.js'

// ============================================================================
// Usage & Model Types
// ============================================================================

export type ModelUsage = z.infer<ReturnType<typeof ModelUsageSchema>>

// ============================================================================
// Output Format Types
// ============================================================================

// ============================================================================
// Config Types
// ============================================================================

export type ApiKeySource = z.infer<ReturnType<typeof ApiKeySourceSchema>>
export type ConfigScope = z.infer<ReturnType<typeof ConfigScopeSchema>>
export type ThinkingConfig = z.infer<ReturnType<typeof ThinkingConfigSchema>>

// ============================================================================
// MCP Types
// ============================================================================

export type McpServerConfigForProcessTransport = z.infer<ReturnType<typeof McpServerConfigForProcessTransportSchema>>
export type McpServerStatus = z.infer<ReturnType<typeof McpServerStatusSchema>>

// ============================================================================
// Permission Types
// ============================================================================

export type PermissionRuleValue = z.infer<ReturnType<typeof PermissionRuleValueSchema>>
export type PermissionUpdate = z.infer<ReturnType<typeof PermissionUpdateSchema>>
export type PermissionResult = z.infer<ReturnType<typeof PermissionResultSchema>>
export type PermissionMode = z.infer<ReturnType<typeof PermissionModeSchema>>

// ============================================================================
// Hook Types
// ============================================================================

export type HookEvent = z.infer<ReturnType<typeof HookEventSchema>>
export type PreToolUseHookInput = z.infer<ReturnType<typeof PreToolUseHookInputSchema>>
export type PermissionRequestHookInput = z.infer<ReturnType<typeof PermissionRequestHookInputSchema>>
export type PostToolUseHookInput = z.infer<ReturnType<typeof PostToolUseHookInputSchema>>
export type PostToolUseFailureHookInput = z.infer<ReturnType<typeof PostToolUseFailureHookInputSchema>>
export type PermissionDeniedHookInput = z.infer<ReturnType<typeof PermissionDeniedHookInputSchema>>
export type NotificationHookInput = z.infer<ReturnType<typeof NotificationHookInputSchema>>
export type UserPromptSubmitHookInput = z.infer<ReturnType<typeof UserPromptSubmitHookInputSchema>>
export type SessionStartHookInput = z.infer<ReturnType<typeof SessionStartHookInputSchema>>
export type SetupHookInput = z.infer<ReturnType<typeof SetupHookInputSchema>>
export type StopHookInput = z.infer<ReturnType<typeof StopHookInputSchema>>
export type StopFailureHookInput = z.infer<ReturnType<typeof StopFailureHookInputSchema>>
export type SubagentStartHookInput = z.infer<ReturnType<typeof SubagentStartHookInputSchema>>
export type SubagentStopHookInput = z.infer<ReturnType<typeof SubagentStopHookInputSchema>>
export type PreCompactHookInput = z.infer<ReturnType<typeof PreCompactHookInputSchema>>
export type PostCompactHookInput = z.infer<ReturnType<typeof PostCompactHookInputSchema>>
export type TeammateIdleHookInput = z.infer<ReturnType<typeof TeammateIdleHookInputSchema>>
export type TaskCreatedHookInput = z.infer<ReturnType<typeof TaskCreatedHookInputSchema>>
export type TaskCompletedHookInput = z.infer<ReturnType<typeof TaskCompletedHookInputSchema>>
export type ElicitationHookInput = z.infer<ReturnType<typeof ElicitationHookInputSchema>>
export type ElicitationResultHookInput = z.infer<ReturnType<typeof ElicitationResultHookInputSchema>>
export type ConfigChangeHookInput = z.infer<ReturnType<typeof ConfigChangeHookInputSchema>>
export type InstructionsLoadedHookInput = z.infer<ReturnType<typeof InstructionsLoadedHookInputSchema>>
export type CwdChangedHookInput = z.infer<ReturnType<typeof CwdChangedHookInputSchema>>
export type FileChangedHookInput = z.infer<ReturnType<typeof FileChangedHookInputSchema>>
export type ExitReason = z.infer<ReturnType<typeof ExitReasonSchema>>
export type SessionEndHookInput = z.infer<ReturnType<typeof SessionEndHookInputSchema>>
export type HookInput = z.infer<ReturnType<typeof HookInputSchema>>

// ============================================================================
// Hook Output Types
// ============================================================================

export type AsyncHookJSONOutput = z.infer<ReturnType<typeof AsyncHookJSONOutputSchema>>
export type SyncHookJSONOutput = z.infer<ReturnType<typeof SyncHookJSONOutputSchema>>
export type HookJSONOutput = z.infer<ReturnType<typeof HookJSONOutputSchema>>

// ============================================================================
// Prompt & UI Types
// ============================================================================

// ============================================================================
// Agent & Model Types
// ============================================================================

export type ModelInfo = z.infer<ReturnType<typeof ModelInfoSchema>>
export type AgentDefinition = z.infer<ReturnType<typeof AgentDefinitionSchema>>
export type SettingSource = z.infer<ReturnType<typeof SettingSourceSchema>>
export type RewindFilesResult = z.infer<ReturnType<typeof RewindFilesResultSchema>>

// ============================================================================
// SDK Message Types
// ============================================================================

export type SDKAssistantMessageError = z.infer<ReturnType<typeof SDKAssistantMessageErrorSchema>>
export type SDKStatus = z.infer<ReturnType<typeof SDKStatusSchema>>
export type SDKUserMessage = z.infer<ReturnType<typeof SDKUserMessageSchema>>
export type SDKUserMessageReplay = z.infer<ReturnType<typeof SDKUserMessageReplaySchema>>
export type SDKRateLimitInfo = z.infer<ReturnType<typeof SDKRateLimitInfoSchema>>
export type SDKAssistantMessage = z.infer<ReturnType<typeof SDKAssistantMessageSchema>>
export type SDKPermissionDenial = z.infer<ReturnType<typeof SDKPermissionDenialSchema>>
export type SDKCompactBoundaryMessage = z.infer<ReturnType<typeof SDKCompactBoundaryMessageSchema>>
export type SDKMessage = z.infer<ReturnType<typeof SDKMessageSchema>>
