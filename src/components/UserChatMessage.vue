<script setup lang="ts">
defineProps<{
  content: string
}>()
const collapsed = ref<boolean>(true)
// const streaming = inject<Ref<boolean>>('streaming')
</script>

<template>
  <div class="flex-grow-1">
    <pre
      class="grow overflow-hidden whitespace-pre-wrap font-inherit"
      :class="collapsed ? 'line-clamp-3' : 'line-clamp-none'"
      v-text="content"
    />
  </div>
  <div
    class="w-10 shrink-0"
    @click="collapsed = !collapsed"
  >
    <button class="h-10 w-10 flex items-center justify-center rounded-full hover:bg-neutral-5/10">
      <i
        :class="collapsed ? 'i-tabler-chevron-down' : 'i-tabler-chevron-up'"
      />
    </button>
    <!-- <button
      :disabled="streaming"
      :class="{
        'opacity-50 cursor-default': streaming,
      }"
      class="h-10 w-10 flex items-center justify-center rounded-full hover:bg-neutral-5/10"
    >
      <i
        class="i-tabler-edit"
      />
    </button> -->
  </div>
</template>
