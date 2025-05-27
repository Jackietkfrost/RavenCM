<template>
  <v-number-input
    :reverse="false"
    controlVariant="stacked"
    :label="label"
    :inset="false"
    variant="solo"
    v-model="moduleValue"
    flat
    :max="20"
    :min="3"
    max-width="150"
    tile
  />
</template>
<script setup lang="tsx">
import { defineProps, ref } from 'vue'
const moduleValue = ref(10)
defineProps({
  label: {
    type: String,
    required: true
  }
})
</script>
