<script setup lang="ts">
import type { ChatData } from '../composables/useHelloWorld'
import localforage from 'localforage'

const router = useRouter()
const chatHistory = shallowRef<ChatData[]>([])
const currentChat = computed<ChatData | null>(() => {
  const c = chatHistory.value.find(chat => chat.id === router.currentRoute.value.params.id) || null
  return c
})
onMounted(async () => {
  const chatHistoryInit = await localforage.getItem<ChatData[]>('chatHistory')
  if (chatHistoryInit) {
    chatHistory.value = chatHistoryInit
  }
})
provide('chatHistory', chatHistory)
provide('currentChat', currentChat)
</script>

<template>
  <slot />
</template>
