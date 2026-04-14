import type { Message } from '../types/message.js'

type Props = {
  isLoading: boolean
  /**
   * When true, bypasses the isLoading gate so tasks can enqueue while a
   * query is streaming rather than deferring to the next 1s check tick
   * after the turn ends. isLoading drops between turns like a normal REPL,
   * so this bypass is now a latency nicety rather than a starvation fix.
   * The prompt is enqueued at 'later' priority either way and drains between turns.
   */
  assistantMode?: boolean
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
}

