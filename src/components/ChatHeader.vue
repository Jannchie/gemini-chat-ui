<script setup lang="ts">
import { computed, ref } from 'vue'
import { getModelName } from '../utils'

const apiKey = useApiKey()
const serviceUrl = ref('')
const modelParam = ref('')
const showSelectModelModal = ref(false)
const model = useModel()
const showMobileMenu = ref(false)

const displayModelName = computed(() => {
  return getModelName(model.value)
})
</script>

<template>
  <header class="flex flex-shrink-0 items-center justify-between gap-4 px-4 py-3 text-lg md:h-72px md:px-6">
    <!-- Model selection - visible on all devices -->
    <button
      class="flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-neutral-8 md:px-4 md:py-2.5"
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

    <!-- Desktop view - row of inputs -->
    <div class="hidden md:flex md:gap-3">
      <div class="flex items-center gap-2">
        <div class="flex items-center pr-2 text-lg">
          <i class="i-tabler-key text-blue-400" />
          <span class="pl-2 text-sm font-medium">API Key</span>
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
          <span class="pl-2 text-sm font-medium">Service URL</span>
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
          <span class="pl-2 text-sm font-medium">Model</span>
        </div>
        <input
          v-model="modelParam"
          placeholder="Model"
          class="w-36 rounded-full bg-[#1e1e1f] px-6 py-2 text-sm text-[#e3e3e3] outline-none transition-all focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
          type="text"
        >
      </div>
    </div>

    <!-- Mobile view - menu toggle -->
    <button
      class="flex items-center justify-center rounded-full p-2 text-lg md:hidden hover:bg-neutral-8"
      @click="showMobileMenu = !showMobileMenu"
    >
      <i class="i-tabler-settings text-neutral-400" />
    </button>

    <!-- Mobile menu drawer -->
    <div
      v-if="showMobileMenu"
      class="fixed inset-0 z-50 bg-black/50 md:hidden"
      @click.self="showMobileMenu = false"
    >
      <div class="absolute right-0 top-0 h-full w-64 bg-[#121212] p-4 shadow-lg">
        <div class="mb-6 flex items-center justify-between">
          <h3 class="text-lg font-medium">
            Settings
          </h3>
          <button
            class="rounded-full p-1 hover:bg-neutral-8"
            @click="showMobileMenu = false"
          >
            <i class="i-tabler-x text-lg" />
          </button>
        </div>

        <div class="flex flex-col gap-6">
          <div class="flex flex-col gap-2">
            <label class="flex items-center gap-2 text-sm font-medium">
              <i class="i-tabler-key text-blue-400" />
              API Key
            </label>
            <input
              v-model="apiKey"
              placeholder="API Key"
              class="w-full rounded-lg bg-[#1e1e1f] px-4 py-2 text-sm text-[#e3e3e3] outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
              type="password"
            >
          </div>

          <div class="flex flex-col gap-2">
            <label class="flex items-center gap-2 text-sm font-medium">
              <i class="i-tabler-link text-green-400" />
              Service URL
            </label>
            <input
              v-model="serviceUrl"
              placeholder="Service URL"
              class="w-full rounded-lg bg-[#1e1e1f] px-4 py-2 text-sm text-[#e3e3e3] outline-none transition-all focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20"
              type="text"
            >
          </div>

          <div class="flex flex-col gap-2">
            <label class="flex items-center gap-2 text-sm font-medium">
              <i class="i-tabler-cube text-purple-400" />
              Model
            </label>
            <input
              v-model="modelParam"
              placeholder="Model"
              class="w-full rounded-lg bg-[#1e1e1f] px-4 py-2 text-sm text-[#e3e3e3] outline-none transition-all focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
              type="text"
            >
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
