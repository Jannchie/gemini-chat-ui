import { client } from '../shared'

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
      if (client.value.baseURL === 'https://api.anthropic.com/v1/') {
        return [
          'claude-3-7-sonnet-latest',
          'claude-3-5-haiku-latest',
          'claude-3-5-sonnet-latest',
          'claude-3-opus-latest',
          'claude-3-sonnet-20240229',
          'claude-3-haiku-20240307',
        ]
      }
      const response = await client.value.models.list()
      models.value = response.data.map(d => d.id)
    }
    catch (error) {
      console.error(error)
    }
  })
  return models
}
