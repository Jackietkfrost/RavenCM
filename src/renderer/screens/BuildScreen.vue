<template>
  <v-app-bar color="primary" density="compact" height="50">
    <v-btn variant="text" :class="{ active: isCurrentStage('race') }" @click="handlePage('race')">{{
      t('BuildScreen.race')
    }}</v-btn>
    <v-btn
      variant="text"
      :class="{ active: isCurrentStage('class') }"
      @click="handlePage('class')"
      >{{ t('BuildScreen.class') }}</v-btn
    >
    <v-btn
      variant="text"
      :class="{ active: isCurrentStage('background') }"
      @click="handlePage('background')"
      >{{ t('BuildScreen.background') }}</v-btn
    >
    <v-btn
      variant="text"
      :class="{ active: isCurrentStage('ability-scores') }"
      @click="handlePage('ability-scores')"
      >{{ t('BuildScreen.ability-scores') }}</v-btn
    >
    <v-btn
      variant="text"
      :class="{ active: isCurrentStage('languages') }"
      @click="handlePage('languages')"
      >{{ t('BuildScreen.languages') }}</v-btn
    >
    <v-btn
      variant="text"
      :class="{ active: isCurrentStage('proficiency') }"
      @click="handlePage('proficiency')"
      >{{ t('BuildScreen.proficiency') }}</v-btn
    >
    <v-btn
      variant="text"
      :class="{ active: isCurrentStage('feats') }"
      @click="handlePage('feats')"
      >{{ t('BuildScreen.feats') }}</v-btn
    >
  </v-app-bar>
  <v-container>
    <RaceScreen v-if="isCurrentStage('race')" />
    <ClassScreen v-if="isCurrentStage('class')" />
    <BackgroundScreen v-if="isCurrentStage('background')" />
    <AbilityScoresScreen v-if="isCurrentStage('ability-scores')" />
    <LanguagesScreen v-if="isCurrentStage('languages')" />
    <ProficiencyScreen v-if="isCurrentStage('proficiency')" />
    <FeatsScreen v-if="isCurrentStage('feats')" />
  </v-container>
</template>

<script setup lang="tsx">
import { useAppStore } from '../store/appStore'
import { useI18n } from 'vue-i18n'
import RaceScreen from '@/renderer/screens/builderScreens/RaceScreen.vue'
import ClassScreen from '@/renderer/screens/builderScreens/ClassScreen.vue'
import BackgroundScreen from '@/renderer/screens/builderScreens/BackgroundScreen.vue'
import AbilityScoresScreen from '@/renderer/screens/builderScreens/AbilityScoreScreen.vue'
import LanguagesScreen from '@/renderer/screens/builderScreens/LanguagesScreen.vue'
import ProficiencyScreen from '@/renderer/screens/builderScreens/ProficiencyScreen.vue'
import FeatsScreen from '@/renderer/screens/builderScreens/FeatsScreen.vue'

const { t } = useI18n()
const characterStore = useAppStore()

const handlePage = (value: string): void => {
  console.log(value)
  characterStore.currentBuildStage = value
}

const isCurrentStage = (stage: string): boolean => {
  return characterStore.currentBuildStage === stage
}
</script>
<style scoped>
.v-btn {
  opacity: 0.4;
}
.active {
  opacity: 1 !important;
}
</style>
