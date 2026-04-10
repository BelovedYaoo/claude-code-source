export type RemoteMessageContent =
  | string
  | Array<{ type: string; [key: string]: unknown }>
