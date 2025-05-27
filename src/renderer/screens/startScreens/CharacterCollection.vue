<template>
  <v-container v-if="!hasCharacters" fluid>
    <v-row no-gutters class="text-center">
      <v-col cols="12">
        <v-icon :icon="mdiAccountGroup" size="250" />
      </v-col>
      <v-col cols="12" class="my-4">
        <h1>No Characters Yet..</h1>
        <h5>You should create your first D&D character to get started</h5>
        <v-btn color="secondary" :prepend-icon="mdiPlus" @click="handleStartCreateCharacter">{{
          t('menu.create-character')
        }}</v-btn></v-col
      >
    </v-row>
  </v-container>
  <v-container v-if="hasCharacters" fluid>
    <v-row no-gutters class="text-center">
      <v-col cols="4"></v-col>
      <v-col cols="8">
        <v-card v-for="character in characterStore.characters" :key="character">
          <v-card-title>
            {{ characterStore.characters[0].character.display_properties[0].name[0] }}
          </v-card-title>
          Race, Class, Level, Image</v-card
        >
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="tsx">
import { useAppStore } from '@/renderer/store/appStore'
import { mdiAccountGroup, mdiPlus } from '@mdi/js'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const characterStore = useAppStore()
const hasCharacters = ref(characterStore.getCharacters.length > 0)
const handleStartCreateCharacter = async (): Promise<void> => {
  characterStore.toggleCreateCharacter()
}
</script>
