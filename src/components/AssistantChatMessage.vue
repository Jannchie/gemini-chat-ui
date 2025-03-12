<script setup lang="ts">
import { md } from '../utils'

const { content } = defineProps<{
  content: string
}>()
const result = computed(() => md.render(content))
</script>

<template>
  <div
    key="prose"
    class="prose children:mt-0"
  >
    <component :is="() => result" />
  </div>
</template>
