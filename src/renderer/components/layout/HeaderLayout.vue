<template>
  <v-app-bar color="primary" density="comfortable" elevation="24">
    <v-btn
      :prepend-icon="mdiHome"
      :class="{ active: isCurrentRoute('/') }"
      variant="text"
      @click="handleRoute('/')"
    >
      {{ t('title.main') }}
    </v-btn>
    <v-btn
      :prepend-icon="mdiWrench"
      variant="text"
      :class="{ active: isCurrentRoute('/builder') }"
      @click="handleRoute('/builder')"
      :disabled="!hasSelectedCharacter"
    >
      {{ t('title.build') }}
    </v-btn>
    <v-btn
      :prepend-icon="mdiMagicStaff"
      variant="text"
      :class="{ active: isCurrentRoute('/magic') }"
      @click="handleRoute('/magic')"
      :disabled="!hasSelectedCharacter"
    >
      {{ t('title.magic') }}
    </v-btn>
    <v-btn
      :prepend-icon="mdiSack"
      variant="text"
      :class="{ active: isCurrentRoute('/equipment') }"
      @click="handleRoute('/equipment')"
      :disabled="!hasSelectedCharacter"
    >
      {{ t('title.equipment') }}
    </v-btn>
    <v-btn
      :prepend-icon="mdiAccountCog"
      variant="text"
      :class="{ active: isCurrentRoute('/manager') }"
      @click="handleRoute('/manager')"
      :disabled="!hasSelectedCharacter"
    >
      {{ t('title.manage') }}
    </v-btn>
    <v-btn
      :prepend-icon="mdiAccountCard"
      variant="text"
      :class="{ active: isCurrentRoute('/charactersheet') }"
      @click="handleRoute('/charactersheet')"
      :disabled="!hasSelectedCharacter"
    >
      {{ t('title.charactersheet') }}
    </v-btn>
    <template #append>
      <v-btn icon @click="handleOpenGitHub">
        <v-icon :icon="mdiGithub" />
        <v-tooltip activator="parent" location="bottom">
          {{ t('menu.github') }}
        </v-tooltip>
      </v-btn>
      <v-btn icon @click="handleChangeTheme">
        <v-icon :icon="mdiBrightness6" />
        <v-tooltip activator="parent" location="bottom">
          {{ t('menu.change-theme') }}
        </v-tooltip>
      </v-btn>
      <v-btn icon @click="handleOpenSettings">
        <v-icon :icon="mdiCog" />
        <v-tooltip activator="parent" location="bottom">
          {{ t('menu.settings') }}
        </v-tooltip>
      </v-btn>
      <!-- Selected Character Info or Create Character Button -->
      <v-container v-if="hasSelectedCharacter" width="220" class="pa-0 ma-0 ml-2">
        <v-row no-gutters class="align-center">
          <v-col cols="8" class="text-right pr-2">
            <h5 class="text-subtitle-2 font-weight-bold text-truncate" style="line-height: 1.2;">
              {{ characterStore.character.name }}
            </h5>
            <h6 class="text-caption text-grey" style="line-height: 1.2;">
              Level {{ characterStore.character.level }}
            </h6>
          </v-col>
          <v-col cols="4" class="d-flex justify-end">
            <v-avatar :image="characterStore.character.avatar || '/images/icon-64px.png'" size="36" style="border: 2px solid rgba(var(--v-theme-primary), 0.5);" />
          </v-col>
        </v-row>
      </v-container>
      
      <!-- If no character selected, show Plus button -->
      <v-btn
        v-else
        icon
        variant="text"
        class="ml-2 plus-button"
        @click="characterStore.toggleCreateCharacter()"
      >
        <v-icon :icon="mdiPlus" color="success" size="24" />
        <v-tooltip activator="parent" location="bottom">
          Create Character
        </v-tooltip>
      </v-btn>
    </template>
  </v-app-bar>
  <!-- <v-app-bar color="primary" density="compact" height="50">
    <v-item-group class="mx-2" mandatory v-if="isCurrentRoute('/manager')">
      <v-item><v-btn class="active">Character</v-btn></v-item>
      <v-item><v-btn>Backstory</v-btn></v-item>
      <v-item><v-btn>Notes</v-btn></v-item>
      <v-item><v-btn>Allies & Organizations</v-btn></v-item>
      <v-item><v-btn>Attacks & Spellcasting</v-btn></v-item>
    </v-item-group>
    <v-item-group class="mx-2" mandatory v-if="isCurrentRoute('/charactersheet')">
      <v-item><v-btn class="active">Character Sheet</v-btn></v-item>
    </v-item-group>
  </v-app-bar> -->
</template>
<script setup lang="tsx">
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  mdiGithub,
  mdiHome,
  mdiWrench,
  mdiBrightness6,
  mdiMagicStaff,
  mdiSack,
  mdiAccountCog,
  mdiAccountCard,
  mdiCog,
  mdiPlus
} from '@mdi/js'
import { openExternal } from '@/renderer/utils'
import { useTheme } from 'vuetify'
import { useAppStore } from '@/renderer/store/appStore'

import { computed } from 'vue'

const characterStore = useAppStore()
const theme = useTheme()
const router = useRouter()
const route: any = useRoute()
// const titleKey: string = (route?.meta?.titleKey || 'title.main') as string

const { t } = useI18n()

const hasSelectedCharacter = computed(() => {
  return !!characterStore.character && !!characterStore.character.name
})

const handleRoute = (path: string): void => {
  router.push(path)
}

const isCurrentRoute = (path: string): boolean => {
  return path === route.path
}

const handleChangeTheme = (): void => {
  const nextTheme = theme.global.current.value.dark ? 'light' : 'dark'
  theme.global.name.value = nextTheme
  localStorage.setItem('theme', nextTheme)
}

const handleOpenGitHub = async (): Promise<void> => {
  await openExternal('https://github.com/Jackietkfrost/RavenCM')
}

const handleOpenSettings = (): void => {}
</script>
<style scoped>
.v-btn {
  opacity: 0.4;
}
.active {
  opacity: 1 !important;
}
.plus-button {
  border: 2px dashed rgba(0, 159, 87, 0.4) !important;
  background-color: rgba(0, 159, 87, 0.08) !important;
  border-radius: 50% !important;
  width: 36px !important;
  height: 36px !important;
  opacity: 1 !important;
  transition: all 0.2s ease;
  min-width: 0 !important;
  padding: 0 !important;
}
.plus-button:hover {
  border: 2px solid rgba(0, 159, 87, 0.8) !important;
  background-color: rgba(0, 159, 87, 0.15) !important;
  transform: scale(1.05);
}
</style>
