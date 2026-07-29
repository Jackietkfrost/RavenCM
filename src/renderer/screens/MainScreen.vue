<template>
  <v-app-bar color="header" density="compact" height="50">
    <v-btn
      variant="text"
      :class="{ active: isCurrentStage('character-collection') }"
      @click="handlePage('character-collection')"
    >
      {{ t('StartScreen.character-collection') }}</v-btn
    >
    <v-btn
      variant="text"
      :class="{ active: isCurrentStage('sources') }"
      @click="handlePage('sources')"
    >
      {{ t('StartScreen.sources') }}</v-btn
    >
    <v-btn
      variant="text"
      :class="{ active: isCurrentStage('additional-sources') }"
      @click="handlePage('additional-sources')"
    >
      {{ t('StartScreen.additional-sources') }}</v-btn
    >
  </v-app-bar>
  <v-container fluid class="px-6 py-4">
    <CharacterCollection v-if="characterStore.currentStartStage === 'character-collection'" />
    <SourcesScreen v-if="characterStore.currentStartStage === 'sources'" />
    <AdditionalContent v-if="characterStore.currentStartStage === 'additional-sources'" />
  </v-container>
</template>
<script setup lang="tsx">
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/renderer/store/appStore'
import { onMounted, ref } from 'vue'
import CharacterCollection from './startScreens/CharacterCollection.vue'
import AdditionalContent from './startScreens/AdditionalContent.vue'
import SourcesScreen from './startScreens/SourcesScreen.vue'

const { t, availableLocales } = useI18n()

const characterStore = useAppStore()
const languages = ref(['en'])

onMounted(
  (): void => {
    languages.value = availableLocales

    // Get application version from package.json version string (Using IPC communication)
    // getApplicationVersionFromMainProcess()
    if (!characterStore.characters || characterStore.characters.length === 0) {
      window.mainApi.invoke('msgGetCharacters').then((characters) => {
        if (!characters) return
        characterStore.characters = characters
      })
    }
    characterStore.fetchElementsIfNeeded()
  }
  // }
)

const handlePage = (value: string): void => {
  characterStore.currentStartStage = value
}

const isCurrentStage = (stage: string): boolean => {
  return characterStore.currentStartStage === stage
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
