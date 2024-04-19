import localforage from 'localforage'
import type { ShallowRef } from 'vue'



export function useChatHistory() {
  const chatHistory = inject<ShallowRef<ChatData[]>>('chatHistory', shallowRef([]))
  function setChatHistory(ch: ChatData[]) {
    void localforage.setItem('chatHistory', ch).then(() => {
      chatHistory.value = ch
    })
  }
  return [chatHistory, setChatHistory] as const
}

export function useCurrentChat() {
  return inject<ShallowRef<ChatData | null>>('currentChat', shallowRef(null))
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export interface Chat {
  content: string
  role: 'user' | 'assistant' | 'system'
}
export interface ChatData {
  id: string
  title: string
  conversation: Chat[]
}
