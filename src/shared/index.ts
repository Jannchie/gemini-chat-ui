import OpenAI from 'openai'

export const chatHistory = shallowRef<ChatData[]>([])
export const customServiceUrl = useLocalStorage('serviceUrl', 'https://api.openai.com/v1')

export const platform = useLocalStorage('platform', 'openai')
export const serviceUrl = computed(() => {
  if (platform.value === 'custom') {
    return customServiceUrl.value
  }
  switch (platform.value) {
    case 'openai':
      return 'https://api.openai.com/v1/'
    case 'anthropic':
      return 'https://api.anthropic.com/v1/'
    case 'openrouter':
      return 'https://openrouter.ai/api/v1/'
    case 'deepseek':
      return 'https://api.deepseek.com'
  }
})
const apiKeyKey = computed(() => {
  return `apiKey-${serviceUrl.value}`
})

const modelKeyKey = computed(() => {
  return `model-${serviceUrl.value}`
})
export const model = useLocalStorage(modelKeyKey, '')
export const apiKey = useLocalStorage(apiKeyKey, '')
export const client = computed(() => {
  return new OpenAI({
    apiKey: apiKey.value,
    baseURL: serviceUrl.value,
    dangerouslyAllowBrowser: true,
  })
})

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
