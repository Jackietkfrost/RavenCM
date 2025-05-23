<template>
  <v-app-bar color="primary" density="compact" height="50">
    <v-btn>Character Collection</v-btn>
    <v-btn>Sources</v-btn>
    <v-btn>Additional Sources</v-btn>
  </v-app-bar>
  <v-container v-if="false">
    <v-row no-gutters class="text-center align-center">
      <v-col cols="12" md="5">
        <img
          data-testid="main-logo"
          alt="logo"
          draggable="false"
          class="ma-auto h-auto w-sm-50 w-md-100"
          :src="
            theme.global.current.value.dark
              ? `/images/ravencm_logo_white.png`
              : `/images/ravencm_logo_black.png`
          "
        />
      </v-col>
      <v-col cols="12" md="7">
        <v-snackbar-queue
          class="justify-center"
          v-model="messages"
          color="error"
          closable
          timeout="2000"
          transition="expand-y-transition"
        ></v-snackbar-queue>
        <v-row class="my-4">
          <v-col>
            <v-btn icon color="primary" @click="handleChangeTheme">
              <v-icon :icon="mdiBrightness6" />
              <v-tooltip activator="parent" location="bottom">
                {{ t('menu.change-theme') }}
              </v-tooltip>
            </v-btn>
          </v-col>
          <v-col>
            <v-btn icon color="primary" @click="handleOpenDocumentation">
              <v-icon :icon="mdiFileDocument" />
              <v-tooltip activator="parent" location="bottom">
                {{ t('menu.documentation') }}
              </v-tooltip>
            </v-btn>
          </v-col>
          <v-col>
            <v-btn icon color="primary" @click="handleOpenGitHub">
              <v-icon :icon="mdiGithub" />
              <v-tooltip activator="parent" location="bottom">
                {{ t('menu.github') }}
              </v-tooltip>
            </v-btn>
          </v-col>
          <v-col>
            <v-btn icon color="primary" @click="handleOpenFile">
              <v-icon :icon="mdiFolderOpen" />
              <v-tooltip activator="parent" location="bottom">
                {{ t('menu.open-file') }}
              </v-tooltip>
            </v-btn>
          </v-col>
          <v-col cols="12">
            <v-select
              data-testid="select-language"
              :model-value="locale"
              density="compact"
              :label="t('menu.change-language')"
              :items="languages"
              @update:model-value="handleChangeLanguage"
            >
              {{ t('menu.change-language') }}
            </v-select>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
  <v-container v-if="!hasCharacters">
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
    <CreateCharacterDrawer :drawer="drawer" />
  </v-container>
  </v-container>
</template>
<script setup lang="tsx">
import { useI18n } from 'vue-i18n'
import { useTheme } from 'vuetify'
import { openExternal, openFile } from '@/renderer/utils'
import { useAppStore } from '@/renderer/store/appStore'
import { onMounted, ref } from 'vue'
import {
  mdiAccountGroup,
  mdiBrightness6,
  mdiFileDocument,
  mdiFolderOpen,
  mdiGithub,
  mdiPlus
} from '@mdi/js'
import CreateCharacterDrawer from './CreateCharacterDrawer.vue'

const { t, locale, availableLocales } = useI18n()

const characterStore = useAppStore()
const theme = useTheme()
const languages = ref(['en'])
const appVersion = ref('Unknown')
const selectedFile = ref('')
const drawer = ref(characterStore.createCharacter)
const messages = ref<string[]>([])

const hasCharacters = ref(false)

onMounted((): void => {
  languages.value = availableLocales

  // Get application version from package.json version string (Using IPC communication)
  getApplicationVersionFromMainProcess()
})

const getApplicationVersionFromMainProcess = (): void => {
  window.mainApi.invoke('msgRequestGetVersion').then((result: string) => {
    appVersion.value = result
  })
}

const handleChangeTheme = (): void => {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}

const handleChangeLanguage = (val): void => {
  locale.value = val
}

const handleOpenDocumentation = async (): Promise<void> => {
  // await openExternal('')
  messages.value.push('WIP')
}

const handleStartCreateCharacter = async (): Promise<void> => {
  characterStore.toggleCreateCharacter()
}

const handleOpenGitHub = async (): Promise<void> => {
  await openExternal('https://github.com/Jackietkfrost/RavenCM')
}

const handleOpenFile = async () => {
  const dialogResult = await openFile('text')
  if (!dialogResult.canceled) {
    selectedFile.value = dialogResult.filePaths[0]
  }
}
</script>
