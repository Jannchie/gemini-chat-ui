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
      const response = await client.value.models.list()
      models.value = response.data.map(d => d.id)
    }
    catch (error) {
      console.error(error)
    }
  })
  return models
}
