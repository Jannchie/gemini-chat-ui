import Groq from 'groq-sdk'
import OpenAI from 'openai'
import { isGroqModel } from '../utils'

export function useClient() {
  const model = useModel()
  const apiKey = useApiKey()
  return computed(() => {
    if (isGroqModel(model.value)) {
      return new Groq({
        apiKey: apiKey.value,
        dangerouslyAllowBrowser: true,
      }) as unknown as OpenAI
    }
    return new OpenAI({
      apiKey: apiKey.value,
      dangerouslyAllowBrowser: true,
    })
  })
}
