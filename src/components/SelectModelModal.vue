<script setup lang="ts">
const models = [
  'gpt-4-0125-preview',
  'gpt-4-turbo-preview',
  'gpt-4-1106-preview',
  'gpt-4-vision-preview',
  'gpt-4',
  'gpt-4-0314',
  'gpt-4-0613',
  'gpt-4-32k',
  'gpt-4-32k-0314',
  'gpt-4-32k-0613',
  'gpt-3.5-turbo',
  'gpt-3.5-turbo-16k',
  'gpt-3.5-turbo-0301',
  'gpt-3.5-turbo-0613',
  'gpt-3.5-turbo-1106',
  'gpt-3.5-turbo-0125',
  'gpt-3.5-turbo-16k-0613',
]
const model = defineModel('model')
const show = defineModel()
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
        class="fixed inset-0 z-50 flex items-center justify-center bg-[#00000080]"
      >
        <div
          ref="modalRef"
          class="w-96 rounded-3xl bg-neutral-9 p-4"
        >
          <div
            v-for="m in models"
            :key="m"
            class="cursor-pointer rounded-full px-4 py-2 text-sm transition-background-color hover:bg-neutral-8"
            @click="model = m; show = false"
          >
            {{ m }}
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
