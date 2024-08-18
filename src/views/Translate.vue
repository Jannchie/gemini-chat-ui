<script setup lang="ts">
import { Paper, ScrollArea } from '@roku-ui/vue'
import type { ChatMessage } from '../composables/useHelloWorld'
import StreamContent from '../components/StreamContent.vue'

const router = useRouter()
function onHomeClick() {
  router.push({
    name: 'chat-home',
  })
}
const text = ref('')
const targetLang = useLocalStorage('translate.targetLang', 'chinese')
const textDebounced = useDebounce(text, 1000)

// 可以指定翻译的语气，可选项为：formal, informal, neutral，分别含义是正式、非正式、中性

const conversation = computed<ChatMessage[]>(() => [{
  role: 'system',
  content: `Translate user\'s input to ${targetLang.value}. Ensure that the translation accurately conveys the original meaning and maintains fluency while adhering to the grammar and idiomatic expressions of the target language. If you encounter any proper nouns or specific terminology, try to keep them consistent or provide clarifications to ensure that the target audience can understand.`,
}, {
  role: 'user',
  content: `${textDebounced.value}`,
}])

const client = useClient()
const translateContent = ref('')
const model = useModel()
const loading = ref(false)
let requestId = 0
watchEffect(async () => {
  try {
    if (textDebounced.value === '') {
      return
    }

    loading.value = true
    translateContent.value = ''

    const currentRequestId = ++requestId

    const stream = await client.value.chat.completions.create({
      model: model.value,
      stream: true,
      messages: conversation.value,
    })

    for await (const chunk of stream) {
      // 检查是否是最新的请求
      if (currentRequestId !== requestId) {
        return
      }
      if (chunk.choices[0].delta.content) {
        translateContent.value += chunk.choices[0].delta.content
      }
    }

    // 请求未被中断
    if (currentRequestId === requestId) {
      loading.value = false
    }
  }
  catch (error) {
    console.error(error)
    loading.value = false
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
      <ScrollArea
        is="main"
        class="h-full flex flex-col overflow-x-hidden overflow-y-auto"
      >
        <div
          class="m-auto max-w-830px w-full flex flex-col px-2 font-medium leading-4rem"
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
                  <input
                    v-model="targetLang"
                    class="rounded-2xl bg-neutral-8 px-4 py-3 text-xl outline-none"
                  >
                </button>
              </div>
              <textarea
                v-model="text"
                style="resize: none; scrollbar-width: none; min-height: 200px; height: auto;"
                class="z-10 w-full flex-grow-0 rounded-2xl bg-[#1e1e1f] px-6 py-4 text-lg text-[#e3e3e3] outline-1 outline-none transition-all focus:bg-neutral-8 hover:bg-neutral-8 focus-visible:outline-1 focus-visible:outline-transparent focus-visible:outline-offset-0"
              />
            </div>
          </div>
          <Paper
            :loading="loading"
            class="bg-surface-low animate-fade-delay min-h-110px flex-shrink-1 border border-transparent p-6 rounded-2xl!"
          >
            <StreamContent
              class="max-w-full"
              :content="translateContent"
              :loading="!translateContent"
            />
          </Paper>
        </div>
      </ScrollArea>
    </MainContainer>
  </BaseContainer>
</template>
