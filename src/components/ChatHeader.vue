<script setup lang="ts">
import { ref } from 'vue'
import { apiKey, customServiceUrl, model, platform } from '../shared'
import { getPlatformIcon, getPlatformName } from '../utils'
import SelectModelModal from './SelectModelModal.vue'

const showSelectModelModal = ref(false)
const showMobileMenu = ref(false)
const showSelectPresetModal = ref(false)
</script>

<template>
  <header class="flex flex-shrink-0 items-center justify-between gap-4 px-4 py-3 text-lg md:h-72px md:px-6">
    <!-- New Conversation Button for small screens -->
    <button
      class="flex items-center justify-center rounded-full p-2 text-lg md:hidden hover:bg-neutral-8"
      @click="$router.push('/')"
    >
      <i class="i-tabler-plus text-neutral-400" />
    </button>
    <!-- Model selection - visible on all devices -->
    <button
      class="flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-neutral-8 md:px-4 md:py-2.5"
      @click="showSelectPresetModal = true"
    >
      <div class="text-lg leading-0">
        <component :is="() => getPlatformIcon(platform)" />
      </div>
      {{ getPlatformName(platform) }}
      <i class="i-tabler-chevron-down ml-1 text-xs opacity-60" />
    </button>

    <!-- Keep original SelectPresetModal -->
    <SelectPresetModal
      v-model="showSelectPresetModal"
    />

    <!-- Use the new SelectModelModal component -->
    <SelectModelModal
      v-model="showSelectModelModal"
      v-model:selected-model="model"
    />
    <!-- Desktop view - row of inputs -->
    <div class="hidden md:flex md:gap-3">
      <div
        v-if="platform === 'custom'"
        class="flex items-center gap-2"
      >
        <div class="flex items-center pr-2 text-lg">
          <i class="i-tabler-link text-green-400" />
          <span class="pl-2 text-sm font-medium">Service URL</span>
        </div>
        <input
          v-model="customServiceUrl"
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
        <!-- Replace input with button to show model selection modal -->
        <button
          class="min-w-36 flex items-center justify-between rounded-full bg-[#1e1e1f] px-6 py-2 text-sm text-[#e3e3e3] transition-all focus:border-neutral-500/50 hover:bg-[#252526] focus:ring-2 focus:ring-neutral-500/20"
          @click="showSelectModelModal = true"
        >
          <span class="truncate pr-2">{{ model || 'Select Model' }}</span>
          <i class="i-tabler-chevron-down text-xs opacity-60" />
        </button>
      </div>

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

          <div
            v-if="platform === 'custom'"
            class="flex flex-col gap-2"
          >
            <label class="flex items-center gap-2 text-sm font-medium">
              <i class="i-tabler-link text-green-400" />
              Service URL
            </label>
            <input
              v-model="customServiceUrl"
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
            <!-- Replace input with button to show model selection modal in mobile menu -->
            <button
              class="w-full flex items-center justify-between rounded-lg bg-[#1e1e1f] px-4 py-2 text-sm text-[#e3e3e3] transition-all focus:border-neutral-500/50 hover:bg-[#252526] focus:ring-2 focus:ring-neutral-500/20"
              @click="showSelectModelModal = true; showMobileMenu = false"
            >
              <span class="truncate">{{ model || 'Select Model' }}</span>
              <i class="i-tabler-chevron-down text-xs opacity-60" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
