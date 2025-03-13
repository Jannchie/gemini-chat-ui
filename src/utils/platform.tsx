function OpenRouterSVG() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" class="w-4 rounded-full" fill="currentColor" stroke="currentColor" aria-label="Logo">
      <g clip-path="url(#clip0_205_3)">
        <path d="M3 248.945C18 248.945 76 236 106 219C136 202 136 202 198 158C276.497 102.293 332 120.945 423 120.945" stroke-width="90"></path>
        <path d="M511 121.5L357.25 210.268L357.25 32.7324L511 121.5Z"></path>
        <path d="M0 249C15 249 73 261.945 103 278.945C133 295.945 133 295.945 195 339.945C273.497 395.652 329 377 420 377" stroke-width="90"></path>
        <path d="M508 376.445L354.25 287.678L354.25 465.213L508 376.445Z"></path>
      </g>
      <title style="display:none">OpenRouter</title>
      <defs><clipPath id="clip0_205_3"><rect width="512" height="512" fill="white"></rect></clipPath></defs>
    </svg>
  )
}

export function getPlatformName(name: string) {
  switch (name) {
    case 'openai':
      return 'OpenAI'
    case 'openrouter':
      return 'Open Router'
    case 'custom':
      return 'Custom'
    case 'anthropic':
      return 'Anthropic'
    default:
      return name
  }
}
export function getPlatformIcon(name: string) {
  switch (name) {
    case 'openrouter':
      return <OpenRouterSVG />
    case 'custom':
      return <i class="i-tabler-brain"></i>
    case 'openai':
      return <i class="i-ri-openai-fill"></i>
    case 'anthropic':
      return <i class="i-ri-anthropic-fill"></i>
  }
}
