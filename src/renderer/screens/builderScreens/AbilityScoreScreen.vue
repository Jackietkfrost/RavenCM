<template>
  <v-container>
    <v-row>
      <v-col cols="2"><AbilityScore label="Strength" />+0</v-col>
      <v-col cols="2"><AbilityScore label="Dexterity" />+0</v-col>
      <v-col cols="2"><AbilityScore label="Constitution" />+0</v-col>
      <v-col cols="2"><AbilityScore label="Intelligence" />+0</v-col>
      <v-col cols="2"><AbilityScore label="Wisdom" />+0</v-col>
      <v-col cols="2"><AbilityScore label="Charisma" />+0</v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="tsx">
import AbilityScore from '@/renderer/components/ScoreSystem.vue'
// import { useI18n } from 'vue-i18n'

// const { t } = useI18n()
</script>
