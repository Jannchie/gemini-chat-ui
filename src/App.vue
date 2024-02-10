<script setup lang="ts">
import OpenAI from 'openai'

interface Chat {
  content: string
  role: string
}

const conversation = ref<Chat[]>([])
type ModelName =
  | 'gpt-4-0125-preview'
  | 'gpt-4-turbo-preview'
  | 'gpt-4-1106-preview'
  | 'gpt-4-vision-preview'
  | 'gpt-4'
  | 'gpt-4-0314'
  | 'gpt-4-0613'
  | 'gpt-4-32k'
  | 'gpt-4-32k-0314'
  | 'gpt-4-32k-0613'
  | 'gpt-3.5-turbo'
  | 'gpt-3.5-turbo-16k'
  | 'gpt-3.5-turbo-0301'
  | 'gpt-3.5-turbo-0613'
  | 'gpt-3.5-turbo-1106'
  | 'gpt-3.5-turbo-0125'
  | 'gpt-3.5-turbo-16k-0613'

const model = ref<ModelName>('gpt-3.5-turbo')
const displayModelName = computed(() => {
  switch (model.value) {
    case 'gpt-4-0125-preview':
      return 'GPT-4 0125 Preview'
    case 'gpt-4-turbo-preview':
      return 'GPT-4 Turbo Preview'
    case 'gpt-4-1106-preview':
      return 'GPT-4 1106 Preview'
    case 'gpt-4-vision-preview':
      return 'GPT-4 Vision Preview'
    case 'gpt-4':
      return 'GPT-4'
    case 'gpt-4-0314':
      return 'GPT-4 0314'
    case 'gpt-4-0613':
      return 'GPT-4 0613'
    case 'gpt-4-32k':
      return 'GPT-4 32k'
    case 'gpt-4-32k-0314':
      return 'GPT-4 32k 0314'
    case 'gpt-4-32k-0613':
      return 'GPT-4 32k 0613'
    case 'gpt-3.5-turbo':
      return 'GPT-3.5 Turbo'
    case 'gpt-3.5-turbo-16k':
      return 'GPT-3.5 Turbo 16k'
    case 'gpt-3.5-turbo-0301':
      return 'GPT-3.5 Turbo 0301'
    case 'gpt-3.5-turbo-0613':
      return 'GPT-3.5 Turbo 0613'
    case 'gpt-3.5-turbo-1106':
      return 'GPT-3.5 Turbo 1106'
    case 'gpt-3.5-turbo-0125':
      return 'GPT-3.5 Turbo 0125'
    case 'gpt-3.5-turbo-16k-0613':
      return 'GPT-3.5 Turbo 16k 0613'
  }
})
const apiKey = ref('')
const openai = new OpenAI({
  apiKey: apiKey.value,
  dangerouslyAllowBrowser: true,
})

const groupedConversation = computed(() => {
  // 处理 conversation，每次轮到 ai 说话后，添加新的组，否则添加到上一组
  const result: Chat[][] = []
  let group: Chat[] = []
  for (const c of conversation.value) {
    if (c.role === 'assistant') {
      group.push(c)
      result.push(group)
      group = []
    }
    else {
      group.push(c)
    }
  }
  if (group.length) {
    result.push(group)
  }
  return result
})

function scrollToBottomSmoothly(element: { scrollTop: number, scrollHeight: number, clientHeight: number }, duration: number) {
  const start = element.scrollTop
  const end = element.scrollHeight - element.clientHeight
  const distance = end - start
  const startTime = performance.now()
  function easeInOutQuad(time: number, start: number, change: number, duration: number) {
    time /= duration / 2
    if (time < 1) {
      return change / 2 * time * time + start
    }
    time--
    return -change / 2 * (time * (time - 2) - 1) + start
  }

  function scroll() {
    const currentTime = performance.now()
    const timeElapsed = currentTime - startTime
    element.scrollTop = easeInOutQuad(timeElapsed, start, distance, duration)
    if (timeElapsed < duration) {
      requestAnimationFrame(scroll)
    }
    else {
      element.scrollTop = end
    }
  }

  scroll()
}

const groupCount = computed(() => groupedConversation.value.length)
const scrollArea = ref<HTMLElement | null>(null)
watch(groupCount, () => {
  nextTick(() => {
    const el = scrollArea.value
    if (el) {
      scrollToBottomSmoothly(el, 1000)
    }
  })
})

const input = ref('重复这句话：这是一段带有内联md代码的文本，例如 print("Hello, world!") 是一个常见的编程语句。')
const showSelectModelModal = ref(false)
const streaming = ref(false)
</script>

<template>
  <div class="h-100dvh w-100dvw color-[#e3e3e3]">
    <div class="h-100vh flex flex-col">
      <header class="h-72px flex items-center justify-between gap-4 px-4 text-lg">
        <button
          class="cursor-pointer rounded-full px-4 py-2 text-sm transition-background-color hover:bg-neutral-8"
          @click="showSelectModelModal = true"
        >
          {{ displayModelName }}
        </button>
        <SelectModelModal
          v-model="showSelectModelModal"
          v-model:model="model"
        />
        <div class="flex items-center gap-2">
          <div class="text-sm">
            Key
          </div>
          <input
            v-model="apiKey"
            placeholder="OpenAI API Key"
            class="w-30 rounded-full bg-[#1e1e1f] px-6 py-2 text-sm text-[#e3e3e3] outline-1 outline-none transition-all focus-visible:outline-1 focus-visible:outline-indigo-7 focus-visible:outline-offset-0"
            type="password"
          >
        </div>
      </header>
      <div
        ref="scrollArea"
        class="h-full overflow-x-hidden overflow-y-auto last-children:min-h-[calc(100vh-92px-72px)]"
      >
        <TransitionGroup
          name="fade"
        >
          <ChatWrapper
            v-for="g, i in groupedConversation"
            :key="i"
          >
            <ChatMessage
              v-for="c, j in g"
              :key="j"
              :avatar="c.role"
              :content="c.content"
              :loading="streaming && groupedConversation.length - 1 === i"
            />
          </ChatWrapper>
        </TransitionGroup>
      </div>
      <div class="input-section relative flex flex-col items-center gap-1 px-4">
        <textarea
          v-model="input"
          type="text"
          class="z-10 max-w-830px w-full flex-grow-0 rounded-full bg-[#1e1e1f] px-6 py-4 text-lg text-[#e3e3e3] outline-1 outline-none transition-all focus-visible:outline-1 focus-visible:outline-indigo-7 focus-visible:outline-offset-0"
          placeholder="Input your question here"
          @keydown.enter="async () => {
            if (streaming) {
              return
            }
            streaming = true
            try {
              const content = `${input.trim()}\n`
              input = ''
              conversation.push({ role: 'user', content })
              conversation.push({ role: 'assistant', content: '' })
              const stream = await openai.chat.completions.create({
                messages: [{ role: 'user', content }],
                model,
                stream: true,
              })
              for await (const chunk of stream) {
                if (chunk.choices[0].delta.content){
                  conversation[conversation.length - 1].content += chunk.choices[0].delta.content
                }
              }
            }
            finally {
              streaming = false
            }
          }"
        />
        <div class="py-1 text-sm color-[#c4c7c5]">
          Gemini Style Web UI for Chat Services
        </div>
      </div>
    </div>
  </div>
</template>

<style>
:root {
  font-family: "Noto Sans SC", sans-serif;
  font-optical-sizing: auto;
  font-style: normal;
  color-scheme: dark light;
}
body {
  background-color: #131314;
}

.input-section:before {
    content: "";
    position: absolute;
    top: -50px;
    width: 100%;
    height: 100px;
    pointer-events: none;
    background: -webkit-gradient(linear,left top,left bottom,from(#13131400),color-stop(60%,#131314));
    background: -webkit-linear-gradient(top,#13131400,#131314 60%);
    background: linear-gradient(180deg,#13131400,#131314 60%);
}
pre {
  outline: none;
}
</style>
