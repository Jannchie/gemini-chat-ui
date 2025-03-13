<script setup lang="ts">
import { md } from '../utils'

const props = defineProps<{
  content: string
  reasoning?: string
  loading: boolean
}>()
const content = computed(() => props.content)
const streamMarkdownWrapperRef = ref<HTMLElement | null>(null)
const loading = computed(() => props.loading)
const debouncedLoading = refDebounced(loading, 1000)
function editResult(childrenRaw: VNode[]): VNode[] {
  const children = childrenRaw.flat(20)
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    // 如果包含文本节点
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

  // 如果最后一个句子不是以标点符号结尾，则移除最后一个句子
  if (sentences.length > 0 && !/[.?!。？！；，、`\n]$/.test(sentences[sentences.length - 1])) {
    sentences.pop() // 移除最后一个句子
  }

  // 如果最后一个句子是列表项，则移除最后一个句子
  if (sentences.length > 0 && /^\d+\./.test(sentences[sentences.length - 1])) {
    sentences.pop() // 移除最后一个句子
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
const reasoning = computed(() => {
  return props.reasoning
})
const reasoningVNodes = computedWithControl([
  reasoning,
], () => {
  return md.render(reasoning.value ?? '', {
    sanitize: true,
  }) as unknown as VNode[]
})

// eslint-disable-next-line vue/one-component-per-file
const StreamMarkdownContent = defineComponent({
  setup() {
    return () => {
      return contentVNodes.value
    }
  },
})

// eslint-disable-next-line vue/one-component-per-file
const StreamMarkdownReasoning = defineComponent({
  setup() {
    return () => {
      return reasoningVNodes.value
    }
  },
})
debouncedWatch([content], () => {
  reasoningVNodes.trigger()
}, {
  debounce: 300,
})

debouncedWatch([reasoning], () => {
  reasoningVNodes.trigger()
}, {
  debounce: 300,
})
// watchEffect(() => {
//   console.log(content.value)
// })
</script>

<template>
  <div>
    <div
      v-if="reasoning && reasoning.length > 0"
      class="mb-4 min-w-full w-full overflow-auto rounded-xl bg-neutral-1 px-4 py-2 text-xs prose prose-gray dark:bg-neutral-950 dark:prose-invert"
    >
      <StreamMarkdownReasoning />
    </div>
    <div
      key="prose"
      ref="streamMarkdownWrapperRef"
      class="hover text-sm prose prose prose-neutral children:mt-0 md:text-base prose-h1:text-3xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base prose-h5:text-base dark:prose-invert"
    >
      <StreamMarkdownContent />
    </div>
  </div>
</template>

<style>
li > p {
  margin: 0.25em 0em !important;
}
</style>
