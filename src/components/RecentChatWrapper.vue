<script setup lang="ts">
const [chatHistory, _] = useChatHistory()
const currentChat = useCurrentChat()
const chatHistoryFirst5 = computed(() => chatHistory.value.slice(0, 5))
</script>

<template>
  <ChatItem
    v-for="chat in chatHistoryFirst5"
    :key="chat.id"
    :chat-data="chat"
    :active="chat.id === currentChat?.id"
  />
</template>
