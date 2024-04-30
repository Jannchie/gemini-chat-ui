<script setup lang="ts">
import OpenAI from 'openai'
import type { ChatMessage } from '../composables/useHelloWorld'
import StreamContent from '../components/StreamContent.vue'

const router = useRouter()
function onHomeClick() {
  router.push({
    name: 'chat-home',
  })
}
const text = ref('')
const targetLang = ref('Chinese')
const textDebounced = useDebounce(text, 1000)
const conversation = computed<ChatMessage[]>(() => [{
  role: 'system',
  content: 'Translate user\'s input to Chinese',
}, {
  role: 'user',
  content: `translate this to ${targetLang.value}:\n ${textDebounced.value}`,
}])

const apiKey = useApiKey()
const openai = computed(() => new OpenAI({
  apiKey: apiKey.value,
  dangerouslyAllowBrowser: true,
}))
const translateContent = ref('')
const model = useModel()
const loading = ref(false)
watchEffect(async () => {
  try {
    if (textDebounced.value === '') {
      return
    }
    loading.value = true
    const stream = await openai.value.chat.completions.create({
      model: model.value,
      // 你只需要输出总结文本，而不需要附加其他信息。不需要标点
      stream: true,
      messages: conversation.value,
    })
    translateContent.value = ''
    for await (const chunk of stream) {
      if (chunk.choices[0].delta.content) {
        translateContent.value += chunk.choices[0].delta.content
      }
    }
    loading.value = false
  }
  catch (error) {
    console.error(error)
  }
})
</script>

<template>
  <BaseContainer>
    <AsideContainer>
      <div
        class="mt-104px pb-4"
      >
        <button
          class="min-w-130px flex items-center gap-4 rounded-full bg-neutral-8 px-4 py-3 leading-0 disabled:pointer-events-none hover:bg-neutral-7 disabled:op-50"
          @click="onHomeClick"
        >
          <i class="i-tabler-home h-5 w-5" />
          <span class="flex-grow-1 text-sm">
            Home
          </span>
        </button>
      </div>
    </AsideContainer>
    <MainContainer>
      <ChatHeader />
      <main class="h-full flex flex-col">
        <div
          class="m-auto h-full max-w-830px w-full flex flex-col overflow-x-hidden overflow-y-auto px-2 font-medium leading-4rem"
        >
          <div>
            <div class="mb-12 mt-8 text-3.5rem">
              <div class="gradient-text">
                Translate
              </div>
            </div>
            <div class="animate-fade-delay">
              <div class="mb-4 flex items-center gap-4">
                <button class="flex">
                  <div class="rounded-2xl bg-neutral-8 px-4 py-3 text-xl">
                    Chinese
                  </div>
                </button>
              </div>
              <textarea
                v-model="text"
                style="resize: none; scrollbar-width: none; min-height: 200px; height: auto;"
                class="z-10 w-full flex-grow-0 rounded-2xl bg-[#1e1e1f] px-6 py-4 text-lg text-[#e3e3e3] outline-1 outline-none transition-all focus:bg-neutral-8 hover:bg-neutral-8 focus-visible:outline-1 focus-visible:outline-transparent focus-visible:outline-offset-0"
              />
            </div>
          </div>
          <div class="flex-shrink-1 p-6">
            <StreamContent
              :content="translateContent"
              :loading="!translateContent"
            />
          </div>
        </div>
      </main>
    </MainContainer>
  </BaseContainer>
</template>
