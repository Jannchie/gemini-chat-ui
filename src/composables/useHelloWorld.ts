export type ChatMessage = {
  content: string
  role: 'user'
} | {
  content: string
  role: 'assistant'
  reasoning?: string
} | {
  content: string
  role: 'system'
}

export interface ChatData {
  id: string
  title: string | null
  conversation: ChatMessage[]
}
