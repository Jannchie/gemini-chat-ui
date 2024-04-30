<script setup lang="ts">
import { getModelName, isMobile } from '../utils'

const apiKey = useApiKey()
const showSelectModelModal = ref(false)
const model = useModel()

const displayModelName = computed(() => {
  return getModelName(model.value)
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
        placeholder="API Key"
        class="w-30 rounded-full bg-[#1e1e1f] px-6 py-2 text-sm text-[#e3e3e3] outline-1 outline-none transition-all focus-visible:outline-1 focus-visible:outline-transparent focus-visible:outline-offset-0"
        type="password"
      >
    </div>
  </header>
</template>
