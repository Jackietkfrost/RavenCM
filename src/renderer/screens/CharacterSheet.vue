<script setup lang="tsx">
// import { useI18n } from 'vue-i18n'
import { mdiFile } from '@mdi/js'

// const { t } = useI18n()
</script>

<template>
  <v-container>
    <v-row no-gutters class="text-center">Generate preview of pdf sheet</v-row>
    <v-row no-gutters class="text-center">
      <v-col cols="12">
        <v-icon :icon="mdiFile" size="250" color="#009f57" />
      </v-col>
      <v-col cols="12" class="my-4">PDF PREVIEW HERE</v-col>
    </v-row>
  </v-container>
</template>
