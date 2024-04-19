<script setup lang="ts">
import type { ChatData } from '../composables/useHelloWorld'

const props = defineProps<{
  chatData: ChatData
  active: boolean
}>()
const currentChat = useCurrentChat()
const [chatHistory, setChatHistory] = useChatHistory()
const buttonRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const hover = useElementHover(buttonRef)
const showMenu = ref(false)
function onActionClick(e: MouseEvent) {
  e.stopPropagation()
  showMenu.value = !showMenu.value
}
onClickOutside(menuRef, (e) => {
  if (!showMenu.value) {
    return
  }
  e.stopPropagation()
  showMenu.value = false
  hover.value = false
})

function onDelete(e: MouseEvent) {
  e.stopPropagation()
  e.preventDefault()
  showMenu.value = false
  chatHistory.value = [...chatHistory.value.filter(chat => chat.id !== props.chatData.id)]
  setChatHistory(chatHistory.value)
  if (currentChat.value?.id === props.chatData.id) {
    currentChat.value = null
  }
}
const router = useRouter()
function onClick() {
  // currentChat = chatData
  router.push({
    name: 'chat',
    params: {
      id: props.chatData.id,
    },
  })
}
</script>

<template>
  <button
    ref="buttonRef"
    class="relative w-full text-sm"
    @click="onClick"
  >
    <div
      :class="{
        'bg-blue-5/30 text-blue-2 ': active,
        'hover:bg-neutral-8': !active,
      }"
      class="flex items-center gap-2 rounded-full py-1 pl-2 pr-1"
    >
      <i class="i-tabler-message m-2 flex-shrink-0" />
      <span class="flex-grow overflow-x-hidden text-ellipsis text-left text-nowrap">
        {{ chatData.title }}
      </span>
      <button
        v-if="hover || showMenu"
        :class="{
          'hover:bg-neutral-9/25': active,
          'hover:bg-neutral-7/25': !active,
          'bg-neutral-9/25': showMenu && active,
          'bg-neutral-7/25': showMenu && !active,
        }"
        class="rounded-full p-2 leading-0"
        @click="onActionClick"
      >
        <i
          v-if="hover || showMenu"
          class="i-tabler-dots-vertical"
        />
      </button>
    </div>
    <div
      v-if="showMenu"
      class="fixed inset-0 z-9"
    />
    <menu
      v-if="showMenu"

      ref="menuRef"
      class="absolute left-[calc(100%+1rem)] top-0 z-10"
    >
      <div class="w-32 overflow-hidden rounded-md bg-neutral-8">
        <button
          class="w-full px-4 py-2 hover:bg-neutral-7"
          @click="onDelete"
        >
          Delete
        </button>
      </div>
    </menu>
  </button>
</template>
