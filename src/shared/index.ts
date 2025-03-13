export const chatHistory = shallowRef<ChatData[]>([])

export const serviceUrl = useLocalStorage('serviceUrl', 'https://api.openai.com/v1')
export const apiKey = useLocalStorage('apiKey', '')
export const model = useLocalStorage('model', 'gpt-3.5-turbo')
export const platform = useLocalStorage('platform', 'openai')
export function useCurrentChat() {
  const router = useRouter()
  return computed<ChatData | null>({
    get: () => {
      return chatHistory.value.find(chat => chat.id === router.currentRoute.value.params.id) || null
    },
    set: (chat) => {
      if (!chat) {
        return
      }
      const index = chatHistory.value.findIndex(c => c.id === chat.id)
      if (index === -1) {
        chatHistory.value.push(chat)
      }
      else {
        chatHistory.value[index] = chat
      }
    },
  })
}
