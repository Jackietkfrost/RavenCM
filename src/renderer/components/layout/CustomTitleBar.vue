<template>
  <div class="titlebar d-flex align-center justify-space-between px-3">
    <!-- Left Section: Icon, Menus, Selected Character -->
    <div class="d-flex align-center titlebar-no-drag">
      <img src="/images/icon-64px.png" class="app-icon mr-3" alt="app-icon" />
      <v-menu offset="y">
        <template #activator="{ props }">
          <v-btn variant="text" size="small" class="menu-btn px-2" v-bind="props">File</v-btn>
        </template>
        <v-list density="compact">
          <v-list-item disabled><v-list-item-title>New Character</v-list-item-title></v-list-item>
          <v-list-item disabled><v-list-item-title>Save Character</v-list-item-title></v-list-item>
        </v-list>
      </v-menu>

      <v-menu offset="y">
        <template #activator="{ props }">
          <v-btn variant="text" size="small" class="menu-btn px-2" v-bind="props">View</v-btn>
        </template>
        <v-list density="compact">
          <v-list-item disabled><v-list-item-title>Toggle DevTools</v-list-item-title></v-list-item>
        </v-list>
      </v-menu>

      <v-menu offset="y">
        <template #activator="{ props }">
          <v-btn variant="text" size="small" class="menu-btn px-2" v-bind="props">Help</v-btn>
        </template>
        <v-list density="compact">
          <v-list-item disabled><v-list-item-title>About</v-list-item-title></v-list-item>
        </v-list>
      </v-menu>

      <!-- Selected Character Name Dropdown -->
      <v-menu offset="y" v-if="characterStore.character && characterStore.character.name">
        <template #activator="{ props }">
          <span
            v-bind="props"
            class="ml-3 font-weight-bold text-uppercase character-name cursor-pointer titlebar-no-drag"
          >
            {{ characterStore.character.name }}
          </span>
        </template>
        <v-list
          density="compact"
          class="character-dropdown-list py-1"
          width="240"
          bg-color="#1e1e24"
        >
          <v-list-item @click="saveCharacter" class="dropdown-item">
            <div class="d-flex justify-space-between align-center w-100">
              <span class="dropdown-text">Save Character</span>
              <span class="text-caption text-grey-darken-1">Ctrl+S</span>
            </div>
          </v-list-item>
          <v-list-item @click="saveCharacterSheet" class="dropdown-item">
            <span class="dropdown-text">Save Character Sheet (.pdf)</span>
          </v-list-item>
          <v-divider class="my-1 border-grey-darken-3" />
          <v-list-item
            @click="navigateTo('/builder', 'currentBuildStage', 'class')"
            class="dropdown-item"
          >
            <span class="dropdown-text">Level Up, HP, & Multiclass</span>
          </v-list-item>
          <v-list-item
            @click="navigateTo('/manager', 'currentManageStage', 'character')"
            class="dropdown-item"
          >
            <span class="dropdown-text">Manage Character Options</span>
          </v-list-item>
          <v-list-item
            @click="navigateTo('/', 'currentStartStage', 'sources')"
            class="dropdown-item"
          >
            <span class="dropdown-text">Manage Sources</span>
          </v-list-item>
          <v-list-item
            @click="navigateTo('/equipment', 'currentEquipmentStage', 'inventory')"
            class="dropdown-item"
          >
            <span class="dropdown-text">Manage Coins</span>
          </v-list-item>
          <v-divider class="my-1 border-grey-darken-3" />
          <v-list-item @click="updateSheetPreview" class="dropdown-item">
            <span class="dropdown-text">Update Sheet Preview</span>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>

    <!-- Middle Section: Center Title -->
    <div class="flex-grow-1 text-center titlebar-title font-weight-medium"> Raven CM </div>

    <!-- Right Section: Search, Settings, Globe, Support, Controls -->
    <div class="d-flex align-center titlebar-no-drag gap-x-2">
      <!-- Compendium Search Input (disabled) -->
      <input
        type="text"
        placeholder="Compendium Search (Alt+C)"
        disabled
        class="search-input mr-2 px-3 py-1"
      />

      <!-- Library/Book Icon (disabled) -->
      <v-btn icon disabled size="x-small" variant="text" class="mr-1">
        <v-icon :icon="mdiBookOpenVariant" size="16" />
      </v-btn>

      <!-- Settings Icon (active, no functionality) -->
      <v-btn icon size="x-small" variant="text" class="mr-1">
        <v-icon :icon="mdiCog" size="16" />
      </v-btn>

      <!-- Globe/Web Icon (opens blank page) -->
      <v-btn
        icon
        size="x-small"
        variant="text"
        @click="openExternal('https://am-x2.com/RavenCM')"
        class="mr-2"
      >
        <v-icon :icon="mdiEarth" size="16" />
      </v-btn>

      <!-- Support the Project button -->
      <v-btn
        variant="outlined"
        color="primary"
        size="small"
        class="support-btn mr-3"
        @click="openExternal('https://ko-fi.com/jackiem')"
      >
        Support the Project
      </v-btn>

      <!-- Window control buttons -->
      <div class="d-flex window-controls">
        <v-btn icon size="x-small" variant="text" class="control-btn" @click="minimizeWindow">
          <v-icon :icon="mdiMinus" size="16" />
        </v-btn>
        <v-btn icon size="x-small" variant="text" class="control-btn" @click="maximizeWindow">
          <v-icon :icon="mdiWindowMaximize" size="16" />
        </v-btn>
        <v-btn
          icon
          size="x-small"
          variant="text"
          class="control-btn close-btn"
          @click="closeWindow"
        >
          <v-icon :icon="mdiClose" size="16" />
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { useAppStore } from '@/renderer/store/appStore'
import {
  mdiBookOpenVariant,
  mdiCog,
  mdiEarth,
  mdiMinus,
  mdiWindowMaximize,
  mdiClose
} from '@mdi/js'
import { useRouter } from 'vue-router'
import { onMounted, onUnmounted } from 'vue'

const characterStore = useAppStore()
const router = useRouter()

const navigateTo = (path: string, stageField?: string, stageValue?: string) => {
  if (stageField && stageValue) {
    ;(characterStore as any)[stageField] = stageValue
  }
  router.push(path)
}

const saveCharacter = async () => {
  try {
    await characterStore.saveCharacter()
  } catch (e) {
    console.error('Error saving character:', e)
  }
}

const saveCharacterSheet = async () => {
  if (!characterStore.character || !characterStore.character.filePath) return
  try {
    const res = await window.mainApi.invoke(
      'msgGeneratePreview',
      characterStore.character.filePath,
      characterStore.character.armorClass || ''
    )
    if (res && res.success && res.base64) {
      await window.mainApi.invoke(
        'msgSavePdf',
        res.base64,
        characterStore.character.name || 'Character'
      )
    }
  } catch (e) {
    console.error('Error saving PDF character sheet:', e)
  }
}

const updateSheetPreview = () => {
  navigateTo('/charactersheet')
  characterStore.triggerAutoGeneratePreview()
}

const handleKeyDown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault()
    saveCharacter()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

const openExternal = (url: string) => {
  window.mainApi.send('msgOpenExternalLink', url)
}

const minimizeWindow = () => {
  window.mainApi.send('msgMinimizeWindow')
}

const maximizeWindow = () => {
  window.mainApi.send('msgMaximizeWindow')
}

const closeWindow = async () => {
  if (characterStore.hasUnsavedChanges()) {
    const response = await window.mainApi.invoke('msgShowConfirmDialog', {
      title: 'Unsaved Changes',
      message: `You have unsaved changes for ${characterStore.character.name || 'your character'}. Do you want to save them before closing?`,
      buttons: ['Save & Close', 'Discard & Close', 'Cancel']
    })

    if (response === 0) {
      const saveRes = await characterStore.saveCharacter()
      if (saveRes && saveRes.success) {
        window.mainApi.send('msgCloseWindow')
      }
    } else if (response === 1) {
      window.mainApi.send('msgCloseWindow')
    }
  } else {
    window.mainApi.send('msgCloseWindow')
  }
}
</script>

<style scoped>
.titlebar {
  -webkit-app-region: drag;
  height: 38px;
  background-color: #1e1e1e;
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
  color: #fff;
  user-select: none;
  font-family: 'Roboto', sans-serif;
  font-size: 0.72rem;
  z-index: 10000;
  position: relative;
}

.titlebar-no-drag {
  -webkit-app-region: no-drag;
}

.app-icon {
  height: 18px;
  width: 18px;
}

.menu-btn {
  font-size: 0.72rem;
  text-transform: uppercase;
  color: #ccc;
  min-width: 0 !important;
  height: 28px !important;
  opacity: 0.7;
}

.menu-btn:hover {
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.05);
}

.character-name {
  color: #ffb300;
  font-size: 0.72rem;
  letter-spacing: 0.05em;
}

.titlebar-title {
  color: #999;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.search-input {
  background-color: #2b2b2b;
  border: 1px solid rgba(128, 128, 128, 0.3);
  color: #aaa;
  font-size: 0.7rem;
  border-radius: 4px;
  width: 180px;
  height: 24px;
}

.gap-x-2 {
  column-gap: 8px;
}

.support-btn {
  font-size: 0.68rem !important;
  font-weight: bold;
  height: 24px !important;
  border-radius: 4px;
  text-transform: uppercase;
}

.window-controls .control-btn {
  border-radius: 0;
  height: 38px !important;
  width: 38px !important;
  color: #bbb;
}

.window-controls .control-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.window-controls .close-btn:hover {
  background-color: #e81123 !important;
  color: #fff !important;
}

.border-grey-darken-3 {
  border-color: rgba(255, 255, 255, 0.08) !important;
}
.dropdown-item {
  cursor: pointer;
}
.dropdown-text {
  font-size: 0.78rem;
  color: #eee;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
