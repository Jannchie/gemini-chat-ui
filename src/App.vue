<script setup lang="ts">
import OpenAI from 'openai'
import { GPTTokens } from 'gpt-tokens'

function useSpeed(interval: number = 1000) {
  const record = ref<[number, number][]>([])
  function trigger(num = 1) {
    record.value.push([Date.now(), num])
    record.value = [...record.value].filter(d => d[0] > Date.now() - interval)
  }

  const speed = computed(() => {
    return record.value.reduce((acc, cur) => acc + cur[1], 0) / (record.value[record.value.length - 1][0] - record.value[0][0]) * 1000
  })
  return {
    speed,
    trigger,
  }
}

interface Chat {
  content: string
  role: 'user' | 'assistant' | 'system'
}
const conversation = shallowRef<Chat[]>([{
  role: 'system',
  content: `You are a helpful assistant eager to elevate the quality of your responses. To achieve this, consider the following overarching principles:

Understand the User’s Question:
Ensure you fully grasp the real intent behind the question. This involves identifying key words and phrases, understanding the context, and pinpointing what the user is truly seeking to understand.

Answer Clearly and Accurately:
Focus on accuracy and relevance in your responses. If a question is multifaceted, address each part systematically to ensure comprehensive coverage.

Provide Detailed Explanations and Step-by-Step Guidance:
For inquiries that require explanations or procedural guidance, offer clear, detailed instructions. When possible, include examples to illustrate your points.

Use Language Accessible to the User:
Tailor the complexity of your language to suit the user’s background knowledge. Avoid overly technical or specialized terminology unless it’s essential for understanding your response.

Acknowledge Limitations, Respond Honestly:
If a question extends beyond your scope of knowledge, respond honestly rather than providing information that might mislead. Whenever possible, direct the user to credible resources.

Value User Feedback:
Use feedback from users, whether positive or negative, as an opportunity to learn and improve subsequent interactions.

Encourage Interaction:
Foster further communication, especially when questions are not fully answered. Guide users on how to provide more detailed information or ask more specific questions.`,
}])

type ModelName =
  | 'gpt-4-turbo'
  | 'gpt-4-turbo-2024-04-09'
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

const model = ref<ModelName>(localStorage.getItem('model') as any ?? 'gpt-3.5-turbo-0125')

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

watchEffect(() => {
  localStorage.setItem('model', model.value)
})
const { speed, trigger } = useSpeed(10000)

const displayModelName = computed(() => {
  switch (model.value) {
    case 'gpt-4-turbo':
      return 'GPT-4 Turbo'
    case 'gpt-4-turbo-2024-04-09':
      return 'GPT-4 Turbo 2024-04-09'
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
    default:
      return model.value
  }
})

const defaultApiKey = sessionStorage.getItem('apiKey') ?? import.meta.env.VITE_DEFAULT_API_KEY
const apiKey = ref(defaultApiKey)
watchEffect(() => {
  sessionStorage.setItem('apiKey', apiKey.value)
})
const openai = computed(() => new OpenAI({
  apiKey: apiKey.value,
  dangerouslyAllowBrowser: true,
}))

const groupedConversation = computed(() => {
  // 处理 conversation，每次轮到 ai 说话后，添加新的组，否则添加到上一组
  const result: Chat[][] = []
  let group: Chat[] = []
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

const input = ref('')
const inputHistory = useManualRefHistory(input)
const showSelectModelModal = ref(false)
const streaming = ref(false)
const prevUSD = ref(0)
const prevToken = ref(0)
const isMobile = computed(() => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
})

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
    const stream = await openai.value.chat.completions.create({
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
          <div class="text-lg pr-2 flex">
            <i class="i-tabler-key" />
            <span
              v-if="!isMobile"
              class="text-sm pl-2"
            >API Key</span>
          </div>
          <input
            v-model="apiKey"
            placeholder="OpenAI API Key"
            class="w-30 rounded-full bg-[#1e1e1f] px-6 py-2 text-sm text-[#e3e3e3] outline-1 outline-none transition-all focus-visible:outline-1 focus-visible:outline-transparent focus-visible:outline-offset-0"
            type="password"
          >
        </div>
      </header>
      <div
        v-if="conversation.length <= 1"
        class="h-full overflow-x-hidden overflow-y-auto max-w-830px w-full m-auto text-3.5rem leading-4rem font-medium"
      >
        <div class="mt-8 mb-12">
          <div class="gradient-text">
            Hi there!
          </div>
          <div class="text-3rem animate-fade-delay">
            <div class="op-25">
              What can I help you with today?
            </div>
          </div>
        </div>
      </div>
      <div
        v-else
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
              :role="c.role"
              :content="c.content"
              :loading="streaming && groupedConversation.length - 1 === i"
            />
          </ChatWrapper>
        </TransitionGroup>
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
        <div class="py-1 text-sm color-[#c4c7c5] animate-delay-500 animate-fade-delay flex gap-2">
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

.input-enter-animate {
  animation: inputEnter 0.5s forwards;
}
.animate-fade-delay {
  opacity: 0;
  animation: fade 0.5s forwards 0.2s;
}

textarea::-moz-placeholder {
  white-space: nowrap;
}

textarea::-webkit-placeholder {
  white-space: nowrap;
}

textarea::placeholder {
  white-space: nowrap;
}

.gradient-text {
  --gradient-color-1: #4285f4;
  --gradient-color-2: #9b72cb;
  --gradient-color-3: #d96570;
  background: linear-gradient(to right, var(--gradient-color-1), var(--gradient-color-2), var(--gradient-color-3), var(--gradient-color-3), var(--gradient-color-2), var(--gradient-color-1), var(--gradient-color-1), var(--gradient-color-2), var(--gradient-color-3), rgba(0, 0, 0, 0), rgba(0, 0, 0, 0));
  background-size: 500%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-block;
  animation: gradient-animation 1s forwards;
}
@keyframes gradient-animation {
  0% {
    background-position: 100%;
  }
  100% {
    background-position: 0%;
  }
}

@keyframes inputEnter {
  from {
    opacity: 0;
    width: 50%;
    translate: 25% 0%;
  }
  to {
    opacity: 1;
    width: 100%;
    translate: 0% 0%;
  }
}

@keyframes fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
