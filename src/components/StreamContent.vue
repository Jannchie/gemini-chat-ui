<script setup lang="ts">
import Shiki from '@shikijs/markdown-it'
import markdownit from 'markdown-it'
import VNodePlugin from '../utils/render'

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
const md = markdownit({
  linkify: true,
  typographer: true,
  breaks: true,
  html: true,
} as any)
const shiki = await Shiki({
  themes: {
    light: 'github-light',
    dark: 'github-dark',
  },
  defaultColor: 'dark',
  fallbackLanguage: 'wiki',
})
md.use(VNodePlugin)
md.use(shiki)
function spliteContent(msg: string) {
  const sentences = msg.split(/(?<=[。？！；、，\n])|(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=[.?!`])/g)
  // 如果最后一个句子不是以标点符号结尾，则移除最后一个句子
  if (!/[.?!。？！；，、`\n]$/.test(sentences[sentences.length - 1])) {
    sentences.pop() // 移除最后一个句子
  }
  // 如果最后一个句子是列表项，则移除最后一个句子
  if (/^\d+\./.test(sentences[sentences.length - 1])) {
    sentences.pop() // 移除最后一个句子
  }
  const content = sentences.join('')
  return content
}
const content = computed(() => {
  const msg = message.value
  if (props.loading) {
    const content = spliteContent(msg)
    return content
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
    class="prose children:mt-0"
  >
    <StreamMarkdown />
  </div>
</template>
