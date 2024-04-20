<script setup lang="ts">
const router = useRouter()
function onNewChatClick() {
  router.push({
    name: 'chat-home',
  })
}
const currentChat = useCurrentChat()
</script>

<template>
  <AsideContainer>
    <div
      class="mt-104px pb-4"
    >
      <button
        :disabled="currentChat === null"
        class="min-w-130px flex items-center gap-4 rounded-full bg-neutral-8 px-4 py-3 leading-0 disabled:pointer-events-none hover:bg-neutral-7 disabled:op-50"
        @click="onNewChatClick"
      >
        <i class="i-tabler-plus h-5 w-5" />
        <span class="flex-grow-1 text-sm">
          New Chat
        </span>
      </button>
    </div>
    <div class="my-2 pl-4 text-sm">
      Recent Chat
    </div>
    <RecentChatWrapper />
  </AsideContainer>
</template>
