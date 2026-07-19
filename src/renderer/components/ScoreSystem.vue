<template>
  <v-number-input
    :reverse="false"
    controlVariant="stacked"
    :label="label"
    :inset="false"
    variant="solo"
    v-model="modelValue"
    flat
    :max="20"
    :min="3"
    max-width="150"
    tile
  />
</template>
<script setup lang="tsx">
const modelValue = defineModel<number>({ default: 10 })
defineProps({
  label: {
    type: String,
    required: true
  }
})
</script>
