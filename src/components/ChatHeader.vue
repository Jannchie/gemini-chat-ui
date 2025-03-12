<script setup lang="ts">
import { getModelName, isMobile } from '../utils'

const apiKey = useApiKey()
const serviceUrl = ref('')
const modelParam = ref('')
const showSelectModelModal = ref(false)
const model = useModel()

const displayModelName = computed(() => {
  return getModelName(model.value)
})
</script>

<template>
  <header class="h-72px flex flex-shrink-0 items-center justify-between gap-4 px-6 text-lg">
    <button
      class="flex cursor-pointer items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors hover:bg-neutral-8"
      @click="showSelectModelModal = true"
    >
      <i class="i-tabler-brain text-sm text-blue-400" />
      {{ displayModelName }}
      <i class="i-tabler-chevron-down ml-1 text-xs opacity-60" />
    </button>

    <SelectModelModal
      v-model="showSelectModelModal"
      v-model:model="model"
    />

    <div class="flex gap-3">
      <div class="flex items-center gap-2">
        <div class="flex items-center pr-2 text-lg">
          <i class="i-tabler-key text-blue-400" />
          <span
            v-if="!isMobile"
            class="pl-2 text-sm font-medium"
          >API Key</span>
        </div>
        <input
          v-model="apiKey"
          placeholder="API Key"
          class="w-36 rounded-full bg-[#1e1e1f] px-6 py-2 text-sm text-[#e3e3e3] outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
          type="password"
        >
      </div>

      <div class="flex items-center gap-2">
        <div class="flex items-center pr-2 text-lg">
          <i class="i-tabler-link text-green-400" />
          <span
            v-if="!isMobile"
            class="pl-2 text-sm font-medium"
          >Service URL</span>
        </div>
        <input
          v-model="serviceUrl"
          placeholder="Service URL"
          class="w-36 rounded-full bg-[#1e1e1f] px-6 py-2 text-sm text-[#e3e3e3] outline-none transition-all focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20"
          type="text"
        >
      </div>

      <div class="flex items-center gap-2">
        <div class="flex items-center pr-2 text-lg">
          <i class="i-tabler-cube text-purple-400" />
          <span
            v-if="!isMobile"
            class="pl-2 text-sm font-medium"
          >Model</span>
        </div>
        <input
          v-model="modelParam"
          placeholder="Model"
          class="w-36 rounded-full bg-[#1e1e1f] px-6 py-2 text-sm text-[#e3e3e3] outline-none transition-all focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
          type="text"
        >
      </div>
    </div>
  </header>
</template>
