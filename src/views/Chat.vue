<script setup lang="ts">
import type { ChatData } from '../composables/useHelloWorld'
import localforage from 'localforage'
import { chatHistory } from '../shared'

onMounted(async () => {
  const chatHistoryInit = await localforage.getItem<ChatData[]>('chatHistory')
  if (chatHistoryInit) {
    chatHistory.value = chatHistoryInit
  }
})
</script>

<template>
  <ChatLayout />
</template>
