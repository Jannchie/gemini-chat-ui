<script setup lang="ts">
import { Btn } from '@roku-ui/vue'

type T = string | { value: string, label?: string, icon?: string }
const props = withDefaults(defineProps<{
  selections: T[]
  default?: T
  color?: 'primary' | 'secondary' | 'tertiary' | 'error'
  unselectable?: boolean
  size?: 'sm' | 'md' | 'lg'
  rounded?: any
}>(), {
  color: 'primary',
  unselectable: undefined,
})

const unselectable = computed(() => {
  if (props.unselectable === undefined) {
    return props.selections.length === 1
  }
  return props.unselectable
})

function getLabel(selection: T) {
  return typeof selection === 'string' ? selection : selection.label ?? selection.value
}

function getValue(selection: T) {
  return typeof selection === 'string' ? selection : selection.value
}

function getIcon(selection: T) {
  return typeof selection === 'string' ? undefined : selection.icon
}
const model = defineModel<string | undefined>()
function onClick(selection: T) {
  if (getValue(selection) === model.value && unselectable.value) {
    model.value = undefined
  }
  else {
    model.value = getValue(selection)
  }
}
const isSingle = computed(() => props.selections.length === 1)
const childClass = computed(() => isSingle.value ? null : 'first-children:rounded-r-0 last-children:rounded-l-0 not-first-children:rounded-l-0 not-last-children:rounded-r-0')
</script>

<template>
  <div
    class="w-auto inline-flex container"
    :class="[childClass]"
  >
    <Btn
      v-for="selection in selections"
      :key="getValue(selection)"
      :size="props.size"
      :model="model"
      :variant="getValue(selection) === getValue(model) ? 'filled' : undefined"
      :color="props.color"
      @click="onClick(selection)"
    >
      <i
        v-if="getIcon(selection)"
        :class="getIcon(selection)"
      />
      {{ getLabel(selection) }}
    </btn>
  </div>
</template>
