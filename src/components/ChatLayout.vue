<script setup lang="ts">
import type { ChatMessage } from '../composables/useHelloWorld'
import OpenAI from 'openai'
import { useScrollToBottom } from '../composables/useScrollToBottom'
import { model, useCurrentChat } from '../shared'
import { generateId, isMobile, setChat } from '../utils'

const router = useRouter()

const lastUsage = ref<OpenAI.Completions.CompletionUsage | null>(null)
const conversation = shallowRef<ChatMessage[]>([])
const currentChat = useCurrentChat()

watchEffect(() => {
  if (currentChat.value) {
    conversation.value = currentChat.value.conversation
  }
  else {``
    conversation.value = []
  }
})

const aiClient = useClient()

async function generateSummary(text: string) {
  const resp = await (aiClient.value.chat.completions as OpenAI.Chat.Completions).create({
    model: model.value,
    messages: [
      {
        role: 'system',
        content: 'Please summarize the user\'s text and return the title of the text without adding any additional information. The title MUST in less than 4 words. Use the text language to summarize the text. Do not add any punctuation.',
      },
      {
        role: 'user',
        content: `Summarize the following text in less than 4 words: ${text}`,
      },
    ],
  })
  return resp.choices[0].message.content
}

const groupedConversation = computed(() => {
  // 处理 conversation，每次轮到 ai 说话后，添加新的组，否则添加到上一组
  const result: ChatMessage[][] = []
  let group: ChatMessage[] = []
  for (const c of conversation.value) {
    if (c.role === 'system') {
      continue
    }
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
const enableAutoScroll = ref(false)
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
      enableAutoScroll.value = true
    }
  }

  scroll()
}

const scrollArea = ref<HTMLElement | null>(null)
const input = ref('')
const inputHistory = useManualRefHistory(input)
const streaming = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const rows = ref(1)
watch([input, textareaRef], () => {
  nextTick(() => {
    if (textareaRef.value) {
      const targetRows = getNumberOfLines(textareaRef.value)
      rows.value = targetRows
    }
  })
}, { immediate: true })
function getNumberOfLines(textarea: HTMLTextAreaElement) {
  // 收缩，获取行数，然后展开
  textarea.style.height = '0px'
  const style = window.getComputedStyle(textarea)
  const lineHeight = Number.parseInt(style.lineHeight)
  const padding = Number.parseInt(style.paddingTop) + Number.parseInt(style.paddingBottom)
  const textareaHeight = textarea.scrollHeight - padding
  const numberOfLines = Math.ceil(textareaHeight / lineHeight)
  textarea.style.height = ''
  return numberOfLines
}
watch(currentChat, () => {
  textareaRef.value?.focus()
})
const laststartedAtMS = ref(0)
const lastEndedAtMS = ref(0)
async function onSubmit() {
  if (input.value.trim() === '' || streaming.value) {
    return
  }
  streaming.value = true
  let chat = currentChat.value
  if (!chat) {
    // Create a new chat history entry at the start
    const id = generateId()
    chat = {
      id,
      title: null,
      conversation: conversation.value,
    }
    setChat(chat)
    router.push({
      name: 'chat',
      params: {
        id,
      },
    })
  }


  try {
    const content = `${input.value.trim()}\n`
    inputHistory.commit()
    input.value = ''

    conversation.value = [...conversation.value, { role: 'user', content }, { role: 'assistant', content: '', reasoning: '' }]
    setChat(toRaw({ ...chat, conversation: conversation.value }))
  nextTick(() => {
      const el = scrollArea.value
      if (el) {
        scrollToBottomSmoothly(el, 1000)
      }
    })
    const lastMessage = conversation.value[conversation.value.length - 1]

    const filteredConversition = conversation.value.slice(0, -1).map((d) => {
      if (d.role === 'assistant') {
        delete d.reasoning
      }
      return d
    })

    const stream = await aiClient.value.chat.completions.create({
      messages: filteredConversition,
      model: model.value,
      stream: true,
      stream_options: {
        include_usage: true,
      },
      // max_tokens: 8196,
    }).catch((err) => {
      if (err instanceof OpenAI.APIError) {
        switch (err.status) {
          case 401:
            lastMessage.content = 'Invalid API Key.'
            break
          case 403:
            lastMessage.content = 'API Key has no permission.'
            break
          case 429:
            lastMessage.content = 'Rate limit exceeded.'
            break
          default:
            if ((err?.status ?? 0) >= 500) {
              lastMessage.content = 'Server Error.'
            }
            else {
              lastMessage.content = 'Error.'
            }
        }
      }
      else {
        throw err
      }
    })
    if (!stream) {
      return
    }
    laststartedAtMS.value = 0
    lastEndedAtMS.value = 0
    for await (const chunk of stream) {
      // get token usage
      const usage = chunk.usage
      if (usage) {
        lastEndedAtMS.value = Date.now()
        lastUsage.value = usage
      }

      const lastMessage = conversation.value[conversation.value.length - 1]
      if (chunk.choices.length === 0) {
        continue
      }

      const delta = chunk.choices[0].delta as any
      if (!delta) {
        continue
      }

      if (laststartedAtMS.value === 0) {
        laststartedAtMS.value = Date.now()
      }

      if (delta.content) {
        lastMessage.content += delta.content
      }
      if (delta.reasoning && lastMessage.role === 'assistant') {
        lastMessage.reasoning += delta.reasoning
      }

      conversation.value = conversation.value.map(d => ({ ...d }))
    }
  }
  finally {
    streaming.value = false

    if (chat) {
      chat.conversation = conversation.value
      chat = toRaw(chat)
      setChat(chat)
      if (!chat.title) {
        const aiMessage = conversation.value.filter(d => d.role === 'assistant').map(d => d.content).join('\n')
        const summary = await generateSummary(aiMessage)
        setChat({
          ...chat,
          title: summary,
        })
      }
    }
  }
}
const lastTimeUsageMS = computed(() => {
  return lastEndedAtMS.value - laststartedAtMS.value
})
onMounted(() => {
  textareaRef.value?.focus()
})

async function onEnter(e: KeyboardEvent) {
  if (e.isComposing) {
    return
  }
  if (streaming.value) {
    return
  }
  if (!input.value.trim()) {
    return
  }
  const target = e.target as HTMLTextAreaElement
  if (!isMobile.value && e.shiftKey && target) {
    const selectStart = target.selectionStart
    input.value = `${input.value.slice(0, selectStart)}\n${input.value.slice(target.selectionEnd)}`
    if (e.target) {
      nextTick(() => {
        const totalRows = target.value.split('\n').length
        const targetRows = Math.min(totalRows, 3)
        rows.value = targetRows
        target.selectionStart = selectStart + 1
        target.selectionEnd = selectStart + 1
        const lineHeight = Number.parseInt(window.getComputedStyle(target).lineHeight)
        target.scroll({
          top: lineHeight * totalRows,
        })
      })
    }
    return
  }
  if (isMobile.value) {
    input.value += '\n'
    const target = e.target as HTMLTextAreaElement
    if (e.target) {
      nextTick(() => {
        const rows = target.value.split('\n').length
        target.rows = rows
        target.scrollTop = target.scrollHeight
      })
    }
    return
  }
  onSubmit()
}
useScrollToBottom(scrollArea, 50, enableAutoScroll)
watchEffect(() => {
  if (streaming.value) {
    enableAutoScroll.value = false
  }
})
</script>

<template>
  <BaseContainer>
    <ChatAside />
    <MainContainer>
      <ChatHeader />
      <div
        v-if="conversation.length <= 1"
        class="m-auto h-full max-w-830px w-full overflow-x-hidden overflow-y-auto px-4 text-3.5rem font-medium leading-4rem"
      >
        <div class="sm:mb-12 sm:mt-8">
          <div class="gradient-text text-3xl md:text-4xl lg:text-5xl">
            Hi there!
          </div>
          <div class="animate-fade-delay text-2xl md:text-3xl lg:text-4xl">
            <div class="op-25">
              What can I help you today?
            </div>
          </div>
        </div>
        <div class="mb-10 mt-20 flex gap-4">
          <div class="animate-fade-delay">
            <button
              class="w-full sm:h-200px sm:w-200px flex flex-row sm:flex-col justify-between rounded-xl bg-neutral-8 p-4 sm:p-5 leading-0 shadow-sm transition-colors hover:bg-neutral-7"
              @click="router.push({ name: 'translate' })"
            >
              <div class="flex items-center gap-2">
                <div class="h-8 w-8 flex items-center justify-center rounded-lg bg-blue-500/20">
                  <i class="i-tabler-language h-5 w-5 text-blue-400" />
                </div>
                <div class="text-base font-medium">
                  Translate
                </div>
              </div>
              <div class="ml-auto hidden sm:ml-0 sm:mt-4 text-xs text-neutral-5 sm:flex items-center">
                Easily translate between multiple languages
              </div>
            </button>
          </div>
        </div>
      </div>
      <div
        v-else
        ref="scrollArea"
        class="overflow-x-hidden overflow-y-auto last-children:min-h-[calc(100dvh-120px-72px)]"
      >
        <template
          v-for="g, i in groupedConversation"
          :key="i"
        >
          <ChatMessage
            v-for="c, j in g"
            :key="j"
            :message="c"
            :loading="streaming && groupedConversation.length - 1 === i"
          />
        </template>
      </div>
      <div class="input-section relative min-h-120px flex shrink-0 flex-col items-center justify-end gap-1 px-4">
        <div
          v-if="lastUsage"
          class="z-10 flex items-center rounded-md text-sm op50 shadow-sm"
        >
          <!-- 合并的输入/输出统计 -->
          <div class="mr-6 flex items-center">
            <span class="mr-1 font-medium">Input/Output:</span>
            <span>{{ lastUsage.prompt_tokens }} / {{ lastUsage.completion_tokens }} Token</span>
          </div>

          <!-- 性能指标 -->
          <div class="flex items-center">
            <span class="mr-1 font-medium">Speed:</span>
            <span>{{ (lastUsage.completion_tokens / lastTimeUsageMS * 1000).toFixed(2) }} Token/s</span>
          </div>
        </div>
        <div class="relative z-10 max-w-830px w-full overflow-hidden leading-0">
          <div
            :class="{
              'right-[-48px]': !input.trim(),
              'right-0': input.trim(),
            }"
            class="pointer-events-none absolute h-full w-full flex items-center justify-end p-2 transition-right"
          >
            <!-- <button
              :disabled="streaming"
              class="pointer-events-auto z-20 h-12 w-12 flex items-center justify-center rounded-full color-[#c4c7c5] transition-all hover:bg-neutral-7"
            >
              <i class="i-tabler-photo h-6 w-6" />
            </button> -->
            <button
              :disabled="streaming"
              :class="{
                'opacity-0': !input.trim(),
              }"
              class="pointer-events-auto z-20 h-12 w-12 flex items-center justify-center rounded-full color-[#c4c7c5] transition-all hover:bg-neutral-7"
              @click="onSubmit"
            >
              <i class="i-tabler-send h-6 w-6" />
            </button>
          </div>
          <textarea
            ref="textareaRef"
            v-model="input"
            type="text"
            style="resize: none; scrollbar-width: none; max-height: 300px; height: auto;"
            :rows="rows"
            :class="{
              'rounded-[3rem]': rows === 1,
              'rounded-[1rem]': rows !== 1,
            }"
            class="input-enter-animate z-10 w-full flex-grow-0 bg-[#1e1e1f] px-6 py-4 pr-14 text-lg text-[#e3e3e3] outline-1 outline-none transition-all focus:bg-neutral-8 hover:bg-neutral-8 focus-visible:outline-1 focus-visible:outline-transparent focus-visible:outline-offset-0"
            placeholder="Input your question here"
            @keydown.stop.up="async (e) => {
              if (!(input === '')) return
              const target = e.target as HTMLTextAreaElement
              if (target.selectionStart === 0) {
                const currentIdx = inputHistory.history.value.map(d => d.snapshot).indexOf(input)
                if (currentIdx === -1) {
                  input = inputHistory.history.value[0].snapshot
                }
                else {
                  input = inputHistory.history.value[(currentIdx + 1) % inputHistory.history.value.length].snapshot
                }
              }
            }"
            @keypress.stop.prevent.enter="onEnter"
          />
        </div>
        <div class="animate-fade-delay flex animate-delay-500 gap-2 pb-3 pt-1 text-xs color-[#c4c7c5]">
          <span>
            Jannchie's Web UI for Chat Services
          </span>
          <a
            class="underline"
            target="_blank"
            href="https://github.com/Jannchie/gemini-chat-ui"
          >Repository</a>
        </div>
      </div>
    </MainContainer>
  </BaseContainer>
</template>
