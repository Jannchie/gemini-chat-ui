<script setup lang="ts">
import { getModelName } from '../utils'

const models = [
  'gpt-4o-mini',
  'gpt-4o',
  'gpt-4-turbo',
  // 'gpt-4-turbo-2024-04-09',
  // 'gpt-4-0125-preview',
  // 'gpt-4-turbo-preview',
  // 'gpt-4-1106-preview',
  // 'gpt-4-vision-preview',
  // 'gpt-4',
  // 'gpt-4-0314',
  // 'gpt-4-0613',
  // 'gpt-4-32k',
  // 'gpt-4-32k-0314',
  // 'gpt-4-32k-0613',
  'gpt-3.5-turbo',
  // 'gpt-3.5-turbo-16k',
  // 'gpt-3.5-turbo-0301',
  // 'gpt-3.5-turbo-0613',
  // 'gpt-3.5-turbo-1106',
  // 'gpt-3.5-turbo-0125',
  // 'gpt-3.5-turbo-16k-0613',
  'llama3-8b-8192',
  'llama3-70b-8192',
  'mixtral-8x7b-32768',
  'gemma-7b-it',
]
const model = defineModel<string>('model', {
  required: true,
})
const show = defineModel<boolean>()
const modalRef = ref<HTMLElement | null>(null)
onClickOutside(modalRef, () => {
  show.value = false
})
</script>

<template>
  <Teleport
    to="body"
  >
    <Transition name="modal-fade">
      <div
        v-if="show"
        class="fixed inset-4 z-50 flex items-center justify-center bg-[#00000080]"
      >
        <div
          ref="modalRef"
          class="w-96 rounded-3xl bg-neutral-9 p-4"
        >
          <div class="font-lg pointer-events-none px-4 pb-4 pt-2 font-bold op-75">
            Select a Model
          </div>
          <div class="max-h-80vh overflow-auto">
            <div
              v-for="m in models"
              :key="m"
              class="cursor-pointer rounded-full px-4 py-2 text-sm transition-background-color hover:bg-neutral-8"
              @click="model = m; show = false"
            >
              {{ getModelName(m) }}
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-to, .modal-fade-leave-from {
  opacity: 1;
}
</style>
