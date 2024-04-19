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
</script>

<template>
  <button
    ref="buttonRef"
    class="w-full text-sm  relative"
    @click="currentChat = chatData"
  >
    <div
      :class="{
        'bg-blue-5/30 text-blue-2 ': active,
        'hover:bg-neutral-8': !active,
      }"
      class="flex gap-2 items-center rounded-full pl-2 pr-1 py-1 "
    >
      <i class="i-tabler-message m-2 flex-shrink-0" />
      <span class="flex-grow text-left text-nowrap overflow-x-hidden text-ellipsis">
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
        class="p-2 rounded-full leading-0"
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
      class="fixed z-9 inset-0"
    />
    <menu
      v-if="showMenu"

      ref="menuRef"
      class="absolute z-10 left-[calc(100%+1rem)] top-0"
    >
      <div class="w-32 bg-neutral-8 rounded-md overflow-hidden">
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
