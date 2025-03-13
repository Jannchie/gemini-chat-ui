import localforage from 'localforage'
import { chatHistory } from '../shared'

export function useChatHistory() {
  function setChatHistory(ch: ChatData[]) {
    void localforage.setItem('chatHistory', ch).then(() => {
      chatHistory.value = ch
    })
  }
  return [chatHistory, setChatHistory] as const
}

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
  title: string
  conversation: ChatMessage[]
}
