<template>
  <v-container
    fluid
    :class="[
      'pa-6 fill-height align-start settings-screen position-relative',
      isDark ? 'theme-dark' : 'theme-light'
    ]"
  >
    <!-- Close Button top right -->
    <v-btn
      icon
      variant="text"
      :color="isDark ? 'grey-lighten-1' : 'grey-darken-1'"
      class="position-absolute"
      style="top: 16px; right: 16px; z-index: 100"
      @click="characterStore.showSettings = false"
    >
      <v-icon :icon="mdiClose" />
    </v-btn>

    <v-row class="h-100">
      <!-- Left Column: Categories -->
      <v-col cols="12" md="5" lg="4" class="d-flex flex-column h-100 pr-md-4 border-right">
        <h2 class="text-h5 font-weight-bold text-uppercase mb-6 text-primary tracking-wide">
          Settings
        </h2>

        <v-list bg-color="transparent" density="compact" class="categories-list py-0">
          <v-list-item
            v-for="cat in categories"
            :key="cat.id"
            :value="cat.id"
            :active="activeCategory === cat.id"
            @click="activeCategory = cat.id"
            class="category-item mb-2 px-4 py-3 rounded-lg text-left"
            ripple
          >
            <template #prepend>
              <v-icon :icon="cat.icon" class="mr-3" size="20" />
            </template>
            <v-list-item-title
              class="text-subtitle-2 font-weight-bold text-uppercase tracking-wider"
            >
              {{ cat.title }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-col>

      <!-- Right Column: Options -->
      <v-col cols="12" md="7" lg="8" class="h-100 pl-md-6 overflow-y-auto">
        <v-window v-model="activeCategory" class="bg-transparent h-100">
          <!-- GENERAL SETTINGS -->
          <v-window-item value="general">
            <h3 class="text-h6 font-weight-bold text-uppercase mb-4 text-white tracking-wider">
              General Settings
            </h3>
            <v-card class="settings-card mb-6 pa-6" variant="flat">
              <v-row align="center" class="mb-6">
                <v-col cols="12" sm="7">
                  <div class="text-subtitle-1 font-weight-medium text-white"
                    >Application Language</div
                  >
                  <div class="text-caption text-grey mt-1">
                    Select your preferred language for the user interface.
                  </div>
                </v-col>
                <v-col cols="12" sm="5">
                  <v-select
                    v-model="selectedLanguage"
                    :items="languages"
                    item-title="name"
                    item-value="code"
                    variant="solo"
                    density="comfortable"
                    hide-details
                    bg-color="input-bg"
                    @update:model-value="changeLanguage"
                  />
                </v-col>
              </v-row>

              <v-divider class="my-6 border-grey-darken-3" />

              <v-row align="center" class="mb-6">
                <v-col cols="12" sm="7">
                  <div class="text-subtitle-1 font-weight-medium text-white">Application Theme</div>
                  <div class="text-caption text-grey mt-1">
                    Toggle between dark mode and light mode interface.
                  </div>
                </v-col>
                <v-col cols="12" sm="5" class="d-flex justify-end">
                  <v-btn-toggle
                    :model-value="selectedTheme"
                    mandatory
                    color="primary"
                    variant="outlined"
                    density="comfortable"
                    @click="changeTheme"
                    readonly
                    class="cursor-pointer"
                  >
                    <v-btn value="dark" :prepend-icon="mdiWeatherNight" class="text-none"
                      >Dark</v-btn
                    >
                    <v-btn value="light" :prepend-icon="mdiWeatherSunny" class="text-none"
                      >Light</v-btn
                    >
                  </v-btn-toggle>
                </v-col>
                <v-divider class="my-6 border-grey-darken-3" />
              </v-row>
              <v-row align="center" class="mb-6">
                <v-col cols="12" sm="7">
                  <div class="text-subtitle-1 font-weight-medium text-white">Player Name</div>
                  <div class="text-caption text-grey mt-1">
                    Your name, to be populated in the fillable PDF character sheets.
                  </div>
                </v-col>
                <v-col cols="12" sm="5">
                  <v-text-field
                    v-model="playerName"
                    variant="solo"
                    density="comfortable"
                    hide-details
                    bg-color="input-bg"
                    placeholder="Enter Player Name"
                    @update:model-value="changePlayerName"
                  />
                </v-col>
              </v-row>

              <v-divider class="my-6 border-grey-darken-3" />

              <v-row align="center">
                <v-col cols="12" sm="7">
                  <div class="text-subtitle-1 font-weight-medium text-white"
                    >Auto-Save Character Sheets</div
                  >
                  <div class="text-caption text-grey mt-1">
                    Automatically save changes to your character sheets as you build.
                  </div>
                </v-col>
                <v-col cols="12" sm="5" class="d-flex justify-end">
                  <v-switch
                    v-model="autoSaveEnabled"
                    color="primary"
                    hide-details
                    inset
                    @update:model-value="changeAutoSave"
                  />
                </v-col>
              </v-row>
            </v-card>
          </v-window-item>

          <!-- CHARACTER DEFAULTS -->
          <v-window-item value="defaults">
            <h3 class="text-h6 font-weight-bold text-uppercase mb-4 text-white tracking-wider">
              Character Defaults
            </h3>
            <v-card class="settings-card mb-6 pa-6" variant="flat">
              <v-row align="center" class="mb-6">
                <v-col cols="12" sm="7">
                  <div class="text-subtitle-1 font-weight-medium text-white"
                    >Default Ability Score Generation Option</div
                  >
                  <div class="text-caption text-grey mt-1">
                    The default method to roll or buy ability scores for new characters.
                  </div>
                </v-col>
                <v-col cols="12" sm="5">
                  <v-select
                    v-model="defaultGenerationOption"
                    :items="generationOptions"
                    variant="solo"
                    density="comfortable"
                    hide-details
                    bg-color="input-bg"
                    @update:model-value="changeDefaultGenerationOption"
                  />
                </v-col>
              </v-row>

              <v-divider class="my-6 border-grey-darken-3" />

              <v-row align="center" class="mb-6">
                <v-col cols="12" sm="7">
                  <div class="text-subtitle-1 font-weight-medium text-white"
                    >Enable Feats By Default</div
                  >
                  <div class="text-caption text-grey mt-1">
                    Allow selection of feats instead of Ability Score Improvements by default.
                  </div>
                </v-col>
                <v-col cols="12" sm="5" class="d-flex justify-end">
                  <v-switch
                    v-model="defaultFeatsEnabled"
                    color="primary"
                    hide-details
                    inset
                    @update:model-value="changeDefaultFeats"
                  />
                </v-col>
              </v-row>

              <v-divider class="my-6 border-grey-darken-3" />

              <v-row align="center" class="mb-6">
                <v-col cols="12" sm="7">
                  <div class="text-subtitle-1 font-weight-medium text-white"
                    >Enable Multiclassing By Default</div
                  >
                  <div class="text-caption text-grey mt-1">
                    Allow character to gain levels in multiple classes by default.
                  </div>
                </v-col>
                <v-col cols="12" sm="5" class="d-flex justify-end">
                  <v-switch
                    v-model="defaultMulticlassingEnabled"
                    color="primary"
                    hide-details
                    inset
                    @update:model-value="changeDefaultMulticlassing"
                  />
                </v-col>
              </v-row>

              <v-divider class="my-6 border-grey-darken-3" />

              <v-row align="center">
                <v-col cols="12" sm="7">
                  <div class="text-subtitle-1 font-weight-medium text-white"
                    >Default Average Hit Points</div
                  >
                  <div class="text-caption text-grey mt-1">
                    Award average hit points automatically when leveling up by default.
                  </div>
                </v-col>
                <v-col cols="12" sm="5" class="d-flex justify-end">
                  <v-switch
                    v-model="defaultAverageHpEnabled"
                    color="primary"
                    hide-details
                    inset
                    @update:model-value="changeDefaultAverageHp"
                  />
                </v-col>
              </v-row>
            </v-card>
          </v-window-item>

          <!-- STORAGE AND PATHS -->
          <v-window-item value="storage">
            <h3 class="text-h6 font-weight-bold text-uppercase mb-4 text-white tracking-wider">
              Storage and Paths
            </h3>
            <v-card class="settings-card mb-6 pa-6" variant="flat">
              <v-row align="center" class="mb-6">
                <v-col cols="12" sm="7">
                  <div class="text-subtitle-1 font-weight-medium text-white"
                    >Raven Character Manager Directory</div
                  >
                  <div class="text-caption text-grey mt-1">
                    Open your local character directory in File Explorer.
                  </div>
                </v-col>
                <v-col cols="12" sm="5" class="d-flex justify-end">
                  <v-btn
                    color="primary"
                    variant="flat"
                    :prepend-icon="mdiFolderOpen"
                    @click="openContentFolder"
                    class="text-none"
                  >
                    Open Folder
                  </v-btn>
                </v-col>
              </v-row>

              <v-divider class="my-6 border-grey-darken-3" />

              <v-row align="center">
                <v-col cols="12" sm="7">
                  <div class="text-subtitle-1 font-weight-medium text-white"
                    >Custom Compendiums Path</div
                  >
                  <div class="text-caption text-grey mt-1">
                    This folder stores downloaded custom compendiums, rulesets, and sources.
                  </div>
                </v-col>
                <v-col cols="12" sm="5" class="d-flex justify-end">
                  <v-btn
                    color="secondary"
                    variant="flat"
                    :prepend-icon="mdiFolderAccount"
                    @click="openCustomFolder"
                    class="text-none"
                  >
                    Open Custom Folder
                  </v-btn>
                </v-col>
              </v-row>
            </v-card>
          </v-window-item>

          <!-- ABOUT AND UPDATES -->
          <v-window-item value="about">
            <h3 class="text-h6 font-weight-bold text-uppercase mb-4 text-white tracking-wider">
              About & Updates
            </h3>
            <v-card
              class="settings-card mb-6 pa-6 text-center d-flex flex-column align-center"
              variant="flat"
            >
              <v-avatar size="100" class="mb-4 text-primary bg-primary-opacity">
                <v-icon :icon="mdiBookOpenPageVariant" size="48" />
              </v-avatar>

              <h4 class="text-h6 font-weight-bold text-white mb-1">Raven Character Manager</h4>
              <div class="text-caption text-grey mb-4">Version {{ appVersion }}</div>

              <p class="text-body-2 text-medium-emphasis mb-6 max-w-600">
                An offline-first digital companion for D&D 5e character building, leveling and sheet
                management. Made to be backwards compatible with Aurora Builder custom compendiums.
              </p>

              <div class="d-flex gap-x-4 mb-4">
                <v-btn
                  variant="outlined"
                  color="outline_button"
                  :prepend-icon="mdiGithub"
                  @click="openGithub"
                  class="text-none"
                >
                  GitHub Repository
                </v-btn>
                <v-btn
                  variant="outlined"
                  color="outline_button"
                  :prepend-icon="mdiChevronRight"
                  @click="openReleaseNotes"
                  class="text-none"
                >
                  View Release Notes
                </v-btn>
              </div>
            </v-card>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>

    <!-- Release Notes Dialog -->
    <v-dialog v-model="showReleaseNotes" max-width="600">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold text-primary"> Release Notes </v-card-title>
        <v-card-text style="white-space: pre-wrap" class="pt-2 text-body-2 text-medium-emphasis">
          {{ releaseNotes }}
        </v-card-text>
        <v-card-actions class="justify-end px-6 pb-4">
          <v-btn color="primary" variant="flat" @click="showReleaseNotes = false" class="text-none">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="tsx">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from 'vuetify'
import { useAppStore } from '@/renderer/store/appStore'
import { openExternal } from '@/renderer/utils'
import {
  mdiCog,
  mdiShieldAccount,
  mdiFolderOpen,
  mdiBookOpenPageVariant,
  mdiWeatherNight,
  mdiWeatherSunny,
  mdiFolderAccount,
  mdiGithub,
  mdiChevronRight,
  mdiClose
} from '@mdi/js'

const { locale } = useI18n()
const theme = useTheme()
const characterStore = useAppStore()

const isDark = computed(() => theme.global.current.value.dark)

// State
const activeCategory = ref('general')
const appVersion = ref('1.0.0')
const showReleaseNotes = ref(false)
const releaseNotes = ref('')

const categories = [
  { id: 'general', title: 'General', icon: mdiCog },
  { id: 'defaults', title: 'Defaults', icon: mdiShieldAccount },
  { id: 'storage', title: 'Storage & Paths', icon: mdiFolderOpen },
  { id: 'about', title: 'About', icon: mdiBookOpenPageVariant }
]

// General
const selectedLanguage = ref(locale.value)
const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'zhHans', name: '简体中文' },
  { code: 'zhHant', name: '繁體中文' }
]

const selectedTheme = ref(theme.global.name.value)
const autoSaveEnabled = ref(localStorage.getItem('autoSave') !== 'false')
const playerName = ref(localStorage.getItem('defaultPlayerName') || '')

// Defaults
const defaultGenerationOption = ref(
  localStorage.getItem('defaultGenerationOption') || 'Roll 4d6 - Discard Lowest'
)
const generationOptions = [
  'Roll 3d6',
  'Roll 4d6 - Discard Lowest',
  'Standard Array (15, 14, 13, 12, 10, 8)',
  'Point Buy'
]

const defaultFeatsEnabled = ref(localStorage.getItem('defaultFeats') !== 'false')
const defaultMulticlassingEnabled = ref(localStorage.getItem('defaultMulticlassing') !== 'false')
const defaultAverageHpEnabled = ref(localStorage.getItem('defaultAverageHp') === 'true')

onMounted(async () => {
  try {
    const ver = await window.mainApi.invoke('msgRequestGetVersion')
    if (ver) appVersion.value = ver

    const notes = await window.mainApi.invoke('msgGetReleaseNotes')
    if (notes) releaseNotes.value = notes
  } catch (e) {
    console.error('Failed to load version or release notes:', e)
  }
})

// Action handlers
const changeLanguage = (lang: string) => {
  locale.value = lang
  localStorage.setItem('language', lang)
}

const changeTheme = () => {
  const nextTheme = theme.global.name.value === 'dark' ? 'light' : 'dark'
  theme.global.name.value = nextTheme
  selectedTheme.value = nextTheme
  localStorage.setItem('theme', nextTheme)
}

const changeAutoSave = (val: boolean | null) => {
  localStorage.setItem('autoSave', (val ?? false).toString())
}

const changePlayerName = (val: string | null) => {
  const name = val || ''
  localStorage.setItem('defaultPlayerName', name)
  if (characterStore.character) {
    characterStore.character.playerName = name
  }
}

const changeDefaultGenerationOption = (val: string | null) => {
  localStorage.setItem('defaultGenerationOption', val || '')
}

const changeDefaultFeats = (val: boolean | null) => {
  localStorage.setItem('defaultFeats', (val ?? false).toString())
}

const changeDefaultMulticlassing = (val: boolean | null) => {
  localStorage.setItem('defaultMulticlassing', (val ?? false).toString())
}

const changeDefaultAverageHp = (val: boolean | null) => {
  localStorage.setItem('defaultAverageHp', (val ?? false).toString())
}

const openContentFolder = () => {
  window.mainApi.send('msgOpenContentFolder')
}

const openCustomFolder = async () => {
  try {
    window.mainApi.send('msgOpenContentFolder')
  } catch (e) {
    console.error(e)
  }
}

const openGithub = () => {
  openExternal('https://github.com/Jackietkfrost/RavenCM')
}

const openReleaseNotes = () => {
  showReleaseNotes.value = true
}
</script>

<style scoped>
.settings-screen {
  font-family: 'Outfit', sans-serif;
  transition: all 0.3s ease;
}

.settings-screen.theme-dark {
  background-color: #121212;
  color: #ffffff;
}

.settings-screen.theme-light {
  background-color: #f5f5f7;
  color: #1d1d1f;
}

.theme-dark .border-right {
  border-right: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.theme-light .border-right {
  border-right: 1px solid rgba(0, 0, 0, 0.08) !important;
}

.categories-list {
  background: transparent;
}

.category-item {
  transition: all 0.25s ease;
  border: 1px solid transparent;
}

/* Non-active state style */
.theme-dark .category-item {
  color: #aaa !important;
  background-color: transparent !important;
  border: 1px solid transparent !important;
}

.theme-light .category-item {
  color: #555 !important;
  background-color: transparent !important;
  border: 1px solid transparent !important;
}

.theme-dark .category-item:hover {
  background-color: rgba(255, 255, 255, 0.04) !important;
  color: #fff !important;
}

.theme-light .category-item:hover {
  background-color: rgba(0, 0, 0, 0.04) !important;
  color: #000 !important;
}

/* Active state style */
.category-item.v-list-item--active {
  font-weight: bold !important;
}

.theme-dark .category-item.v-list-item--active {
  background: rgba(var(--v-theme-primary), 0.25) !important;
  border: 1px solid rgba(var(--v-theme-primary), 0.4) !important;
  color: #ffffff !important;
}

.theme-light .category-item.v-list-item--active {
  background: rgba(var(--v-theme-primary), 0.08) !important;
  border: 1px solid rgba(var(--v-theme-primary), 0.4) !important;
  color: rgb(var(--v-theme-primary)) !important;
}

/* Ensure active button selected text is always readable */
.v-btn-toggle .v-btn--selected {
  color: #ffffff !important;
}
.theme-light .v-btn-toggle .v-btn--selected {
  color: #ffffff !important;
}

.settings-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.theme-dark .settings-card {
  background-color: #1e1e24 !important;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2) !important;
}

.theme-light .settings-card {
  background-color: #ffffff !important;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05) !important;
}

.bg-primary-opacity {
  background-color: rgba(var(--v-theme-primary), 0.15) !important;
}

.max-w-600 {
  max-width: 600px;
}

.tracking-wide {
  letter-spacing: 0.1em;
}

.tracking-wider {
  letter-spacing: 0.05em;
}

/* Light mode text overrides */
.theme-light .text-white {
  color: #1d1d1f !important;
}

.theme-light .text-grey {
  color: #5b5b66 !important;
}

.theme-light .text-medium-emphasis {
  color: #3a3a3c !important;
}

.cursor-pointer {
  cursor: pointer !important;
}

.category-item :deep(.v-list-item-title) {
  white-space: normal !important;
  word-break: break-word !important;
  line-height: 1.25 !important;
}

.v-btn-toggle {
  width: 100%;
  max-width: 240px;
}
.v-btn-toggle .v-btn {
  flex: 1 1 auto;
}
</style>
