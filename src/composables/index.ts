import OpenAI from 'openai'
import { apiKey, platform, serviceUrl } from '../shared'

const client = computed(() => {
  const finalServiceUrl = computed(() => {
    if (platform.value === 'custom') {
      return serviceUrl.value
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

  return new OpenAI({
    apiKey: apiKey.value,
    baseURL: finalServiceUrl.value,
    dangerouslyAllowBrowser: true,
  })
})
export function useClient() {
  return client
}

export function useModels() {
  const models = ref<string[]>([])
  onMounted(async () => {
    try {
      const response = await client.value.models.list()
      models.value = response.data.map(d => d.id)
    }
    catch (error) {
      console.error(error)
    }
  })
  watch(client, async () => {
    try {
      const response = await client.value.models.list()
      models.value = response.data.map(d => d.id)
    }
    catch (error) {
      console.error(error)
    }
  })
  return models
}
