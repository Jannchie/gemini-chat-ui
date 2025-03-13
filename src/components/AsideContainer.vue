<script setup lang="ts">
import { breakpointsTailwind } from '@vueuse/core'

const breakpoints = useBreakpoints(breakpointsTailwind)
const open = ref(false)
provideLocal('open', open)
const shouldShow = computed(() => !breakpoints.sm.value || open.value)
</script>

<template>
  <aside
    class="w-16 w-284px flex flex-shrink-0 flex-col bg-neutral-9 px-3 transition-all"
    :class="{
      '-ml-284px': shouldShow,
      'ml-0': !shouldShow,
    }"
  >
    <slot />
  </aside>
</template>
