<script setup lang="ts">
import { vAutoAnimate } from '@formkit/auto-animate'

const [chatHistory, _] = useChatHistory()
const currentChat = useCurrentChat()
const chatHistoryFirst5 = computed(() => chatHistory.value.slice(0, 5))
</script>

<template>
  <div v-auto-animate>
    <ChatItem
      v-for="chat in chatHistoryFirst5"
      :key="chat.id"
      :chat-data="chat"
      :active="chat.id === currentChat?.id"
    />
  </div>
</template>
