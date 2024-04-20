<script setup lang="ts">
import { isMobile } from '../utils'

const apiKey = useApiKey()
const showSelectModelModal = ref(false)
const model = useModel()
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
</script>

<template>
  <header class="h-72px flex flex-shrink-0 items-center justify-between gap-4 px-4 text-lg">
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
      <div class="flex pr-2 text-lg">
        <i class="i-tabler-key" />
        <span
          v-if="!isMobile"
          class="pl-2 text-sm"
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
</template>
