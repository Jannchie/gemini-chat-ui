<script setup lang="ts">
import OpenAI from 'openai'
import { GPTTokens } from 'gpt-tokens'
import Groq from 'groq-sdk'
import type { ChatMessage } from '../composables/useHelloWorld'
import { generateId, isGroqModel, isMobile } from '../utils'

const model = useModel()
const router = useRouter()

function useSpeed(interval: number = 1000) {
  const record = ref<[number, number][]>([])
  function trigger(num = 1) {
    record.value.push([Date.now(), num])
    record.value = [...record.value].filter(d => d[0] > Date.now() - interval)
  }

  const speed = computed(() => {
    if (record.value.length < 2) {
      return 0
    }
    return record.value.reduce((acc, cur) => acc + cur[1], 0) / (record.value[record.value.length - 1][0] - record.value[0][0]) * 1000
  })
  return {
    speed,
    trigger,
  }
}

const conversation = shallowRef<ChatMessage[]>([{
  role: 'system',
  content: ``,
}])

const [chatHistory, setChatHistory] = useChatHistory()
const currentChat = useCurrentChat()
watchEffect(() => {
  if (currentChat.value) {
    conversation.value = currentChat.value.conversation
  }
  else {
    conversation.value = [{
      role: 'system',
      content: ``,
    }]
  }
})

const conversationThrottled = useThrottle(conversation, 1000, true, true)
const tokenCost = computed(() => {
  try {
    if (conversationThrottled.value.filter(d => d.role === 'assistant').length === 0) {
      return null
    }
    return new GPTTokens({
      model: model.value as any,
      messages: conversationThrottled.value,
    })
  }
  catch (e) {
    return null
  }
})

const { speed, trigger } = useSpeed(10000)
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

const scrollArea = ref<HTMLElement | null>(null)
const input = ref('')
const inputHistory = useManualRefHistory(input)
const streaming = ref(false)

// watchEffect(() => {
//   conversation.value = [{
//     role: 'system',
//     content: ``,
//   }, {
//     role: 'user',
//     content: `123`,
//   }, {
//     role: 'assistant',
//     content: input.value,
//   }]
// })

provide('streaming', streaming)

const prevUSD = ref(0)
const prevToken = ref(0)

useBreakpoints({
})

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
async function onSubmit() {
  if (input.value.trim() === '' || streaming.value) {
    return
  }
  streaming.value = true
  try {
    const content = `${input.value.trim()}\n`
    inputHistory.commit()
    input.value = ''
    conversation.value.push({ role: 'user', content })
    conversation.value = [...conversation.value]
    nextTick(() => {
      const el = scrollArea.value
      if (el) {
        scrollToBottomSmoothly(el, 1000)
      }
    })
    const stream = await (aiClient.value.chat.completions as OpenAI.Chat.Completions).create({
      messages: conversation.value,
      model: model.value,
      stream: true,
    }).catch((err) => {
      if (err instanceof OpenAI.APIError) {
        conversation.value.push({ role: 'assistant', content: '' })
        switch (err.status) {
          case 401:
            conversation.value[conversation.value.length - 1].content = 'Invalid API Key.'
            break
          case 403:
            conversation.value[conversation.value.length - 1].content = 'API Key has no permission.'
            break
          case 429:
            conversation.value[conversation.value.length - 1].content = 'Rate limit exceeded.'
            break
          default:
            if ((err?.status ?? 0) >= 500) {
              conversation.value[conversation.value.length - 1].content = 'Server Error.'
            }
            else {
              conversation.value[conversation.value.length - 1].content = 'Error.'
            }
        }
      }
      else {
        throw err
      }
    })
    conversation.value.push({ role: 'assistant', content: '' })
    if (!stream) {
      return
    }
    for await (const chunk of stream) {
      if (chunk.choices[0].delta.content) {
        trigger()
        conversation.value[conversation.value.length - 1].content += chunk.choices[0].delta.content
        conversation.value = [...conversation.value]
      }
    }
  }
  finally {
    streaming.value = false
    nextTick(() => {
      prevUSD.value += tokenCost.value?.usedUSD ?? 0
      prevToken.value += tokenCost.value?.usedTokens ?? 0
    })
    if (currentChat.value) {
      currentChat.value.conversation = unref(conversation.value)
      setChatHistory([...chatHistory.value])
    }
    else {
      const id = generateId()
      const aiMessage = conversation.value.filter(d => d.role === 'assistant').map(d => d.content).join('\n')
      const summary = await generateSummary(aiMessage)
      const newChat = {
        id,
        title: summary ?? 'New Chat',
        conversation: unref(conversation.value),
      }
      setChatHistory([newChat, ...chatHistory.value])
      router.push({
        name: 'chat',
        params: {
          id,
        },
      })
    }
  }
}

onMounted(() => {
  textareaRef.value?.focus()
})

const totalToken = computed(() => {
  if (streaming.value) {
    return prevToken.value + (tokenCost.value?.usedTokens ?? 0)
  }
  return prevToken.value
})

const totalUSD = computed(() => {
  if (streaming.value) {
    return (prevUSD.value + (tokenCost.value?.usedUSD ?? 0))
  }
  return prevUSD.value
})

const totalTokenTransition = useTransition(totalToken, {
  duration: 1000,
})

const totalUSDTransition = useTransition(totalUSD, {
  duration: 1000,
})

const extraInfo = computed(() => {
  return `Used Tokens: ${totalTokenTransition.value.toFixed(0)} (${totalUSDTransition.value.toFixed(5)}$) Speed: ${speed.value.toFixed(1)}/s`
})
</script>

<template>
  <BaseContainer>
    <ChatAside />
    <MainContainer>
      <ChatHeader />
      <div
        v-if="conversation.length <= 1"
        class="m-auto h-full max-w-830px w-full overflow-x-hidden overflow-y-auto px-2 text-3.5rem font-medium leading-4rem"
      >
        <div class="sm:mb-12 sm:mt-8">
          <div class="gradient-text">
            Hi there!
          </div>
          <div class="animate-fade-delay text-3rem">
            <div class="op-25">
              What can I help you today?
            </div>
          </div>
        </div>
        <div class="mb-10 mt-20 flex gap-4">
          <div class="animate-fade-delay">
            <button
              class="h-200px w-200px flex flex-col justify-between rounded-xl bg-neutral-8 p-5 leading-0 hover:bg-neutral-7"
              @click="router.push({ name: 'translate' })"
            >
              <div class="text-base">
                Translate
              </div>
              <div class="h-10 w-10 flex items-center self-end justify-center rounded-full bg-neutral-9">
                <i class="i-tabler-language-hiragana bottom-0 h-6 w-6" />
              </div>
            </button>
          </div>
        </div>
      </div>
      <div
        v-else
        ref="scrollArea"
        class="h-full overflow-x-hidden overflow-y-auto last-children:min-h-[calc(100vh-120px-72px)]"
      >
        <template
          v-for="g, i in groupedConversation"
          :key="i"
        >
          <ChatMessage
            v-for="c, j in g"
            :key="j"
            :role="c.role"
            :content="c.content"
            :loading="streaming && groupedConversation.length - 1 === i"
          />
        </template>
      </div>
      <div class="input-section relative flex flex-col items-center gap-1 px-4">
        <div
          v-if="tokenCost"
          class="z-11 text-sm op-50"
        >
          {{ extraInfo }}
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
            style="resize: none; scrollbar-width: none; max-height: 100px; height: auto;"
            :rows="rows"
            :class="{
              'rounded-[3rem]': rows === 1,
              'rounded-[1rem]': rows !== 1,
            }"
            class="input-enter-animate z-10 w-full flex-grow-0 bg-[#1e1e1f] px-6 py-4 text-lg text-[#e3e3e3] outline-1 outline-none transition-all focus:bg-neutral-8 hover:bg-neutral-8 focus-visible:outline-1 focus-visible:outline-transparent focus-visible:outline-offset-0"
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
            @keydown.stop.prevent.enter="async (e) => {
              if (streaming) {
                return
              }
              if (!input.trim()) {
                return
              }
              const target = e.target as HTMLTextAreaElement
              if (!isMobile && e.shiftKey && target) {
                const selectStart = target.selectionStart
                input = `${input.slice(0, selectStart)}\n${input.slice(target.selectionEnd)}`
                if (e.target){
                  $nextTick(() => {
                    const targetRows = Math.min(target.value.split('\n').length, 3)
                    rows = targetRows
                    target.scrollTop = target.scrollHeight
                    target.selectionStart = selectStart + 1
                    target.selectionEnd = selectStart + 1
                  })
                }
                return
              }
              if (isMobile) {
                input += '\n'
                const target = e.target as HTMLTextAreaElement
                if (e.target){
                  $nextTick(() => {
                    const rows = target.value.split('\n').length
                    target.rows = rows
                    target.scrollTop = target.scrollHeight
                  })
                }
                return
              }
              onSubmit()
            }"
          />
        </div>
        <div class="animate-fade-delay flex animate-delay-500 gap-2 pb-3 pt-1 text-xs color-[#c4c7c5]">
          <span>
            Gemini Style Web UI for Chat Services
          </span>
          <span>
            By
            <a
              class="underline"
              target="_blank"
              href="https://github.com/Jannchie"
            >Jannchie
            </a>
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
