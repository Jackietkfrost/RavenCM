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
    >
      {{ t('title.build') }}
    </v-btn>
    <v-btn
      :prepend-icon="mdiMagicStaff"
      variant="text"
      :class="{ active: isCurrentRoute('/magic') }"
      @click="handleRoute('/magic')"
    >
      {{ t('title.magic') }}
    </v-btn>
    <v-btn
      :prepend-icon="mdiSack"
      variant="text"
      :class="{ active: isCurrentRoute('/equipment') }"
      @click="handleRoute('/equipment')"
    >
      {{ t('title.equipment') }}
    </v-btn>
    <v-btn
      :prepend-icon="mdiAccountCog"
      variant="text"
      :class="{ active: isCurrentRoute('/manager') }"
      @click="handleRoute('/manager')"
    >
      {{ t('title.manage') }}
    </v-btn>
    <v-btn
      :prepend-icon="mdiAccountCard"
      variant="text"
      :class="{ active: isCurrentRoute('/charactersheet') }"
      @click="handleRoute('/charactersheet')"
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
      <v-container v-if="characterStore.character" width="200">
        <v-row class="justify-center">
          <v-col cols="6">
            <h5>{{ characterStore.character.name }}</h5>
            <h6>Level {{ characterStore.character.level }}</h6>
            <v-col cols="12">
              <v-progress-linear></v-progress-linear>
            </v-col>
          </v-col>
          <v-col cols="6" class="d-flex justify-end">
            <v-avatar :image="characterStore.character.avatar" size="32" />
          </v-col>
        </v-row>
        <v-row> </v-row>
      </v-container>
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
  mdiCog
} from '@mdi/js'
import { openExternal } from '@/renderer/utils'
import { useTheme } from 'vuetify'
import { useAppStore } from '@/renderer/store/appStore'

const characterStore = useAppStore()
const theme = useTheme()
const router = useRouter()
const route: any = useRoute()
// const titleKey: string = (route?.meta?.titleKey || 'title.main') as string

const { t } = useI18n()

const handleRoute = (path: string): void => {
  router.push(path)
}

const isCurrentRoute = (path: string): boolean => {
  return path === route.path
}

const handleChangeTheme = (): void => {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
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
</style>
