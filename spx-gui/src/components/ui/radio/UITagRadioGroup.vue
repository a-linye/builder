<template>
  <div class="ui-radio-group-container">
    <slot />
  </div>
</template>
<script lang="ts">
export const radioGroupValueKey: InjectionKey<ComputedRef<string | undefined>> = Symbol('radioGroupValue')
export const updateRadioValueKey: InjectionKey<(value: string) => void> = Symbol('updateRadioValue')
</script>

<script setup lang="ts">
import { provide, type InjectionKey, computed, type ComputedRef } from 'vue'

const props = defineProps<{
  value?: string
}>()

const emit = defineEmits<{
  'update:value': [string]
}>()

const updateValue = (newValue: string) => {
  emit('update:value', newValue)
}

provide(
  radioGroupValueKey,
  computed(() => props.value)
)
provide(updateRadioValueKey, updateValue)
</script>

<style scoped lang="scss">
.ui-radio-group-container {
  display: flex;
  gap: 12px;
}
</style>
