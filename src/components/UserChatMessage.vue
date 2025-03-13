<script setup lang="ts">
import { onMounted, ref } from 'vue'

defineProps<{
  content: string
}>()

const collapsed = ref<boolean>(true)
const contentRef = ref<HTMLElement | null>(null)
const needsCollapse = ref<boolean>(true)

// Check if content needs to be collapsed
onMounted(() => {
  if (contentRef.value) {
    // Check if content height exceeds 3 lines
    const lineHeight = Number.parseInt(getComputedStyle(contentRef.value).lineHeight)
    const contentHeight = contentRef.value.scrollHeight

    // If content height is less than or equal to 3 lines, no need to collapse
    needsCollapse.value = contentHeight > (lineHeight * 3)

    // If no need to collapse, set collapsed to false by default
    if (!needsCollapse.value) {
      collapsed.value = false
    }
  }
})
</script>

<template>
  <div
    class="flex-grow-1"
  >
    <pre
      ref="contentRef"
      class="grow overflow-hidden whitespace-pre-wrap font-inherit"
      :class="collapsed ? 'line-clamp-3' : 'line-clamp-none'"
      v-text="content"
    />
  </div>
  <div
    v-if="needsCollapse"
    class="w-10 shrink-0"
    @click="collapsed = !collapsed"
  >
    <button class="h-10 w-10 flex items-center justify-center rounded-full hover:bg-neutral-5/10">
      <i
        :class="collapsed ? 'i-tabler-chevron-down' : 'i-tabler-chevron-up'"
      />
    </button>
  </div>
</template>
