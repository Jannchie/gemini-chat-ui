import Shiki from '@shikijs/markdown-it'
import markdownit from 'markdown-it'
import VNodePlugin from './render'

export * from './platform'

export const isMobile = computed(() => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
})
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function getModelName(model: string) {
  switch (model) {
    case 'llama3-8b-8192':
      return 'Groq Llama3 8B'
    case 'llama3-70b-8192':
      return 'Groq Llama3 70B'
    case 'mixtral-8x7b-32768':
      return 'Groq Mixtral 8x7B'
    case 'gemma-7b-it':
      return 'Groq Gemma 7B IT'
    case 'gpt-4o-mini':
      return 'GPT-4 Omni Mini'
    case 'gpt-4o':
      return 'GPT-4 Omni'
    case 'gpt-4-turbo':
      return 'GPT-4 Turbo'
    case 'gpt-4-turbo-2024-04-09':
      return 'GPT-4 Turbo 2024-04-09'
    case 'gpt-4-0125-preview':
      return 'GPT-4 0125 Preview'
    case 'gpt-4-turbo-preview':
      return 'GPT-4 Turbo Preview'
    case 'gpt-4-1106-preview':
      return 'GPT-4 1106 Preview'
    case 'gpt-4-vision-preview':
      return 'GPT-4 Vision Preview'
    case 'gpt-4':
      return 'GPT-4'
    case 'gpt-4-0314':
      return 'GPT-4 0314'
    case 'gpt-4-0613':
      return 'GPT-4 0613'
    case 'gpt-4-32k':
      return 'GPT-4 32k'
    case 'gpt-4-32k-0314':
      return 'GPT-4 32k 0314'
    case 'gpt-4-32k-0613':
      return 'GPT-4 32k 0613'
    case 'gpt-3.5-turbo':
      return 'GPT-3.5 Turbo'
    case 'gpt-3.5-turbo-16k':
      return 'GPT-3.5 Turbo 16k'
    case 'gpt-3.5-turbo-0301':
      return 'GPT-3.5 Turbo 0301'
    case 'gpt-3.5-turbo-0613':
      return 'GPT-3.5 Turbo 0613'
    case 'gpt-3.5-turbo-1106':
      return 'GPT-3.5 Turbo 1106'
    case 'gpt-3.5-turbo-0125':
      return 'GPT-3.5 Turbo 0125'
    case 'gpt-3.5-turbo-16k-0613':
      return 'GPT-3.5 Turbo 16k 0613'
    default:
      return model
  }
}

export const md = markdownit({
  linkify: true,
  typographer: true,
  breaks: true,
  html: true,
} as any)
md.use(VNodePlugin)

export async function loadShiki() {
  const shiki = await Shiki({
    themes: {
      light: 'vitesse-light',
      dark: 'vitesse-dark',
    },
    langs: [
      'python',
      'javascript',
      'typescript',
      'bash',
      'json',
      'yaml',
      'html',
      'css',
      'markdown',
      'rust',
      'vue',
      'c',
      'c#',
      'c++',
      'java',
      'go',
      'php',
      'ruby',
      'swift',
      'kotlin',
      'scala',
      'sql',
      'perl',
      'lua',
      'r',
      'dart',
      'haskell',
      'clojure',
      'elixir',
      'f#',
      'groovy',
      'powershell',
      'racket',
      'scheme',
      'shell',
      'ocaml',
      'asm',
      'matlab',
      'hcl',
      'objective-c',
      'sas',
      'pascal',
      'vb',
      'cobol',
      'erlang',
    ],
    defaultColor: 'dark',
    fallbackLanguage: 'wiki',
  })
  md.use(shiki)
}
