<template>
  <v-app-bar color="primary" density="compact" height="50">
    <v-btn>Race</v-btn>
    <v-btn>Class</v-btn>
    <v-btn>Background</v-btn>
    <v-btn>Ability Scores</v-btn>
    <v-btn>Languages</v-btn>
    <v-btn>Proficiency</v-btn>
    <v-btn>Feats</v-btn>
  </v-app-bar>
  <v-container>
    <v-row no-gutters class="text-center">
      <v-col cols="12">
        <v-icon :icon="mdiEmoticonCoolOutline" size="250" color="#009f57" />
      </v-col>
      <v-col cols="12" class="my-4">{{ t('desc.second-desc') }}</v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="tsx">
import { useI18n } from 'vue-i18n'
import { mdiEmoticonCoolOutline } from '@mdi/js'

const { t } = useI18n()
</script>
