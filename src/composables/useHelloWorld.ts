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

export interface ChatMessage {
  content: string
  role: 'user' | 'assistant' | 'system'
}
export interface ChatData {
  id: string
  title: string
  conversation: ChatMessage[]
}
