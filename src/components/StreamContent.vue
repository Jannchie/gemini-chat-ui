<script setup lang="ts">
import { ref } from 'vue'
import { md } from '../utils'

const props = withDefaults(defineProps<{
  content: string
  reasoning?: string
  loading: boolean
}>(), {
  reasoning: '',
})

const content = computed(() => props.content)
const reasoning = computed(() => props.reasoning)
const streamMarkdownWrapperRef = ref<HTMLElement | null>(null)
const loading = computed(() => props.loading)
const debouncedLoading = refDebounced(loading, 1000)
const showCopyTooltip = ref(false)

function editResult(childrenRaw: VNode[]): VNode[] {
  const children = childrenRaw.flat(20)
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    if (typeof child.children === 'string') {
      child.props = {
        ...child.props,
      }
      if (debouncedLoading.value) {
        child.props.class = 'fade-in'
      }
    }
    if (child.children && Array.isArray(child.children) && child.children.length > 0) {
      editResult(child.children as VNode[])
    }
  }
  return children
}

function splitContent(msg: string) {
  const sentences = msg.split(/(?<=[。？！；、，\n])|(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=[.?!`])/g)

  if (sentences.length > 0 && !/[.?!。？！；，、`\n]$/.test(sentences[sentences.length - 1])) {
    sentences.pop()
  }

  if (sentences.length > 0 && /^\d+\./.test(sentences[sentences.length - 1])) {
    sentences.pop()
  }

  const content = sentences.join('')
  return content
}

const formatedContent = computed(() => {
  const msg = content.value
  return splitContent(msg)
})

const contentFinal = computed(() => {
  const msg = content.value
  if (props.loading) {
    return formatedContent.value
  }
  else {
    return msg
  }
})

const contentVNodes = computedWithControl([contentFinal], () => {
  const r = md.render(contentFinal.value ?? '', {
    sanitize: true,
  }) as unknown as VNode[]
  return editResult(r)
})

const reasoningVNodes = computedWithControl([
  reasoning,
], () => {
  return md.render(reasoning.value ?? '', {
    sanitize: true,
  }) as unknown as VNode[]
})

const StreamMarkdownContent = defineComponent({
  setup() {
    return () => {
      return contentVNodes.value
    }
  },
})

const StreamMarkdownReasoning = defineComponent({
  setup() {
    return () => {
      return reasoningVNodes.value
    }
  },
})

debouncedWatch([content], () => {
  contentVNodes.trigger()
}, {
  debounce: 300,
})

debouncedWatch([reasoning], () => {
  reasoningVNodes.trigger()
}, {
  debounce: 300,
})

// Enhanced copy functionality with tooltip feedback
function copyContentToClipboard() {
  const markdownContent = contentFinal.value
  navigator.clipboard.writeText(markdownContent).then(() => {
    showCopyTooltip.value = true
    setTimeout(() => {
      showCopyTooltip.value = false
    }, 2000)
  }).catch((err) => {
    console.error(`Failed to copy content: ${err}`)
  })
}
</script>

<template>
  <div class="relative">
    <div>
      <div
        v-if="reasoning && reasoning.length > 0"
        class="mb-4 min-w-full w-full overflow-auto rounded-xl bg-neutral-1 px-4 py-2 text-xs prose prose-gray dark:bg-neutral-950 dark:prose-invert"
      >
        <StreamMarkdownReasoning />
      </div>
      
      <div class="relative mb-2">
        <div class="absolute top-0 right-0 z-10">
          <button
            class="flex items-center justify-center w-8 h-8 p-1.5 bg-transparent rounded transition-all duration-200 opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10"
            @click="copyContentToClipboard"
            aria-label="Copy markdown content"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <div v-if="showCopyTooltip" class="absolute -bottom-7 right-0 bg-black/70 dark:bg-white/70 text-white dark:text-black text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
              Copied!
            </div>
          </button>
        </div>
      </div>
      
      <div
        key="prose"
        ref="streamMarkdownWrapperRef"
        class="hover text-sm prose prose-neutral children:mt-0 md:text-base prose-h1:text-3xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base prose-h5:text-base dark:prose-invert"
      >
        <StreamMarkdownContent />
      </div>
    </div>
  </div>
</template>

<style>
li > p {
  margin: 0.25em 0em !important;
}
</style>