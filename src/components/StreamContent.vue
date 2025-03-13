<script setup lang="ts">
import { md } from '../utils'

const props = defineProps<{
  content: string
  loading: boolean
}>()
const message = computed(() => props.content)
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
  const msg = message.value
  return splitContent(msg)
})
const content = computed(() => {
  const msg = message.value
  if (props.loading) {
    return formatedContent.value
  }
  else {
    return msg
  }
})

const result = computedWithControl([
  content,
], () => {
  const r = md.render(content.value ?? '', {
    sanitize: true,
  }) as unknown as VNode[]
  return editResult(r)
})
const StreamMarkdown = defineComponent({
  setup() {
    return () => {
      return result.value
    }
  },
})
debouncedWatch([message], () => {
  result.trigger()
}, {
  debounce: 100,
})
</script>

<template>
  <div
    key="prose"
    ref="streamMarkdownWrapperRef"
    class="hover text-sm prose prose prose-neutral children:mt-0 md:text-base prose-h1:text-3xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base prose-h5:text-base dark:prose-invert"
  >
    <StreamMarkdown />
  </div>
</template>

<style>
li > p {
  margin: 0.25em 0em !important;
}
</style>
