<script setup lang="ts">
import { Btn } from '@roku-ui/vue'
import { ref } from 'vue'
import { useModels } from '../composables'
import { apiKey, customServiceUrl, model, platform } from '../shared'
import { getPlatformIcon, getPlatformName } from '../utils'

const showSelectModelModal = ref(false)
const showMobileMenu = ref(false)
const showSelectPresetModal = ref(false)
const models = useModels()

// Update the global model when selection changes
function updateModel(modelName: string | null | undefined) {
  model.value = modelName
  showSelectModelModal.value = false
}
const searchQuery = ref('')

const filteredModels = computed(() => {
  if (!searchQuery.value) {
    return models.value
  }
  const query = searchQuery.value.toLowerCase()
  return models.value.filter(model =>
    model.toLowerCase().includes(query),
  )
})
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

    <!-- New Model Selection Modal -->
    <Transition
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
      enter-active-class="transition ease-out"
      leave-active-class="transition ease-in"
    >
      <div
        v-if="showSelectModelModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="showSelectModelModal = false"
      >
        <div class="absolute top-10rem mx-4 max-w-md w-full overflow-hidden rounded-xl bg-[#1a1a1a] shadow-lg">
          <div class="flex items-center justify-between border-b border-neutral-800 p-4">
            <h3 class="text-lg text-white font-medium">
              Select Model
            </h3>
            <Btn
              icon
              rounded="full"
              color="white"
              variant="transparent"
              hover-variant="light"
              @click="showSelectModelModal = false"
            >
              <i class="i-tabler-x text-xl" />
            </Btn>
          </div>

          <!-- Search bar -->
          <div class="border-b border-neutral-800 p-4">
            <div class="relative">
              <i class="i-tabler-search absolute left-3 top-1/2 transform text-neutral-400 -translate-y-1/2" />
              <input
                v-model="searchQuery"
                type="text"
                class="w-full rounded-lg bg-neutral-800 p-2 pl-10 pr-8 text-white outline-none transition-colors focus:bg-neutral-700 focus:ring-2 focus:ring-neutral-600 placeholder-neutral-500"
                placeholder="Search models..."
              >
              <button
                v-if="searchQuery"
                class="absolute right-3 top-1/2 transform text-neutral-400 transition-colors -translate-y-1/2 hover:text-white"
                @click="searchQuery = ''"
              >
                <i class="i-tabler-x text-sm" />
              </button>
            </div>
          </div>

          <div class="max-h-96 overflow-y-auto p-2">
            <div v-if="filteredModels.length > 0">
              <div
                v-for="(modelOption, index) in filteredModels"
                :key="index"
                class="mb-1 flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-neutral-800"
                :class="{ 'bg-neutral-800': modelOption === model }"
                @click="updateModel(modelOption)"
              >
                <div class="h-8 w-8 flex flex-shrink-0 items-center justify-center rounded-full bg-neutral-800">
                  <i class="i-tabler-cube text-purple-400" />
                </div>
                <div class="flex flex-col">
                  <span class="truncate text-sm text-white font-medium">{{ modelOption }}</span>
                  <span class="text-xs text-neutral-400">{{ platform }}</span>
                </div>
                <div class="ml-auto flex-shrink-0">
                  <i
                    v-if="modelOption === model"
                    class="i-tabler-check text-neutral-400"
                  />
                </div>
              </div>
            </div>
            <div
              v-else
              class="p-4 text-center text-neutral-400"
            >
              <i class="i-tabler-info-circle text-xl" />
              <p class="mt-2">
                No Models Found
              </p>
            </div>
          </div>

          <div class="flex justify-end border-t border-neutral-800 p-4">
            <button
              class="rounded-lg bg-neutral-700 px-4 py-2 text-sm text-white font-medium transition-colors hover:bg-neutral-600"
              @click="showSelectModelModal = false"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Transition>
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
