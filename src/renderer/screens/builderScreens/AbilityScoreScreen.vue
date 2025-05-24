<template>
  <v-container
    >Ability Scores
    <v-number-input
      :reverse="false"
      controlVariant="stacked"
      label="test"
      :inset="false"
      variant="solo"
      flat
      :max="20"
      :min="3"
      max-width="150"
      tile
    ></v-number-input>
  </v-container>
</template>

<script setup lang="tsx">
// import { useI18n } from 'vue-i18n'
// const { t } = useI18n()
</script>
