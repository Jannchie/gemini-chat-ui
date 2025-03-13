<script setup lang="ts">
const props = defineProps<{
  role: string
  content: string
  loading: boolean
}>()
</script>

<template>
  <div
    class="m-auto w-full flex-grow-1 px-3 py-4 sm:max-w-712px sm:px-4 sm:py-6"
    :class="{
      'bg-neutral-8 rounded-t-xl': props.role === 'user',
      'bg-neutral-9 rounded-b-xl mb-2': props.role === 'assistant',
    }"
  >
    <!-- 移动端上下结构布局（图标+文字在上，内容在下） -->
    <div class="block sm:hidden">
      <div class="mb-1 flex items-center">
        <div class="mr-1 flex-shrink-0 leading-0">
          <i
            v-if="props.role === 'user'"
            class="i-fluent-person-28-filled text-xs text-neutral-4"
          />
          <i
            v-else
            class="i-fluent-bot-48-filled text-xs text-neutral-4"
            :class="{ 'animate-pulse': props.loading && props.role === 'assistant' }"
          />
        </div>
        <div class="text-xs text-neutral-4 font-medium">
          <span v-if="props.role === 'user'">用户</span>
          <span
            v-else
            :class="{ 'animate-pulse': props.loading && props.role === 'assistant' }"
          >AI助手</span>
        </div>
      </div>
      <div class="w-full">
        <StreamContent
          v-if="props.role === 'assistant'"
          :content="content"
          :loading="loading"
        />
        <UserChatMessage
          v-else
          :content="content"
        />
      </div>
    </div>

    <!-- 桌面端保持原有的左右结构 -->
    <div class="hidden sm:flex sm:gap-4">
      <div class="h-8 w-8 flex-shrink-0">
        <i
          v-if="props.role === 'user'"
          class="i-fluent-person-28-filled h-full w-full"
        />
        <i
          v-else
          class="i-fluent-bot-48-filled h-full w-full"
          :class="{ 'animate-pulse': props.loading && props.role === 'assistant' }"
        />
      </div>

      <div class="flex-grow overflow-hidden">
        <StreamContent
          v-if="props.role === 'assistant'"
          :content="content"
          :loading="loading"
        />
        <UserChatMessage
          v-else
          :content="content"
        />
      </div>
    </div>
  </div>
</template>
