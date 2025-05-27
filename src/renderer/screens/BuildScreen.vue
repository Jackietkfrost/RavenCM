<template>
  <v-app-bar color="primary" density="compact" height="50">
    <v-btn
      variant="text"
      :class="{ active: characterStore.currentBuildStage === 'race' }"
      @click="handlePage('race')"
      >{{ t('BuildScreen.race') }}</v-btn
    >
    <v-btn
      variant="text"
      :class="{ active: characterStore.currentBuildStage === 'class' }"
      @click="handlePage('class')"
      >{{ t('BuildScreen.class') }}</v-btn
    >
    <v-btn
      variant="text"
      :class="{ active: characterStore.currentBuildStage === 'background' }"
      @click="handlePage('background')"
      >{{ t('BuildScreen.background') }}</v-btn
    >
    <v-btn
      variant="text"
      :class="{ active: characterStore.currentBuildStage === 'ability-scores' }"
      @click="handlePage('ability-scores')"
      >{{ t('BuildScreen.ability-scores') }}</v-btn
    >
    <v-btn
      variant="text"
      :class="{ active: characterStore.currentBuildStage === 'languages' }"
      @click="handlePage('languages')"
      >{{ t('BuildScreen.languages') }}</v-btn
    >
    <v-btn
      variant="text"
      :class="{ active: characterStore.currentBuildStage === 'proficiency' }"
      @click="handlePage('proficiency')"
      >{{ t('BuildScreen.proficiency') }}</v-btn
    >
    <v-btn
      variant="text"
      :class="{ active: characterStore.currentBuildStage === 'feats' }"
      @click="handlePage('feats')"
      >{{ t('BuildScreen.feats') }}</v-btn
    >
  </v-app-bar>
  <v-container>
    <RaceScreen v-if="characterStore.currentBuildStage === 'race'" />
    <ClassScreen v-if="characterStore.currentBuildStage === 'class'" />
    <BackgroundScreen v-if="characterStore.currentBuildStage === 'background'" />
    <AbilityScoresScreen v-if="characterStore.currentBuildStage === 'ability-scores'" />
    <LanguagesScreen v-if="characterStore.currentBuildStage === 'languages'" />
    <ProficiencyScreen v-if="characterStore.currentBuildStage === 'proficiency'" />
    <FeatsScreen v-if="characterStore.currentBuildStage === 'feats'" />
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
// import { ref } from 'vue'

const { t } = useI18n()
// const currentPage = ref(0)
const characterStore = useAppStore()

const handlePage = (value: string): void => {
  console.log(value)
  characterStore.currentBuildStage = value
}
</script>
