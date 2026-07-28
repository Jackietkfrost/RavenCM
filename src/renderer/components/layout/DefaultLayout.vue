<template>
  <v-app>
    <CustomTitleBar />
    <v-layout
      style="
        top: 38px;
        height: calc(100vh - 38px);
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
      "
    >
      <CreateCharacterDrawer />
      <HeaderLayout />
      <v-main>
        <slot />
      </v-main>

      <v-dialog
        v-model="characterStore.showSettings"
        max-width="950"
        height="650"
        transition="dialog-bottom-transition"
      >
        <SettingsScreen />
      </v-dialog>

      <v-snackbar
        v-model="updateSnackbar"
        location="bottom right"
        :timeout="-1"
        :color="updateSnackbarColor"
      >
        {{ updateSnackbarText }}
        <template #actions v-if="updateSnackbarCanClose">
          <v-btn variant="text" @click="updateSnackbar = false">Close</v-btn>
        </template>
      </v-snackbar>
    </v-layout>
  </v-app>
</template>
<script setup lang="tsx">
import CreateCharacterDrawer from '@/renderer/screens/CreateCharacterDrawer.vue'
import HeaderLayout from '@/renderer/components/layout/HeaderLayout.vue'
import CustomTitleBar from '@/renderer/components/layout/CustomTitleBar.vue'
import SettingsScreen from '@/renderer/screens/SettingsScreen.vue'
import { useAppStore } from '@/renderer/store/appStore'
import { ref, onMounted, onUnmounted } from 'vue'

const characterStore = useAppStore()

const updateSnackbar = ref(false)
const updateSnackbarText = ref('')
const updateSnackbarColor = ref('info')
const updateSnackbarCanClose = ref(false)

let activeUpdates = 0

const handleUpdateStatus = (event: any, data: any) => {
  const { status, indexName, version, error } = data

  switch (status) {
    case 'checking':
      updateSnackbarText.value = `Checking for updates for ${indexName}...`
      updateSnackbarColor.value = 'info'
      updateSnackbar.value = true
      updateSnackbarCanClose.value = false
      break
    case 'updating':
      activeUpdates++
      updateSnackbarText.value = `Updating ${indexName} to v${version}...`
      updateSnackbarColor.value = 'warning'
      updateSnackbar.value = true
      updateSnackbarCanClose.value = false
      break
    case 'updated':
      activeUpdates = Math.max(0, activeUpdates - 1)
      updateSnackbarText.value = `Updated ${indexName} successfully to v${version}!`
      updateSnackbarColor.value = 'success'
      updateSnackbar.value = true
      updateSnackbarCanClose.value = true
      setTimeout(() => {
        if (activeUpdates === 0) {
          updateSnackbar.value = false
        }
      }, 4000)
      break
    case 'up-to-date':
      if (indexName) {
        if (activeUpdates === 0) {
          updateSnackbarText.value = `${indexName} is up to date.`
          updateSnackbarColor.value = 'success'
          updateSnackbar.value = true
          updateSnackbarCanClose.value = true
          setTimeout(() => {
            if (activeUpdates === 0) {
              updateSnackbar.value = false
            }
          }, 3000)
        }
      } else {
        if (activeUpdates === 0) {
          updateSnackbarText.value = `All content is up to date.`
          updateSnackbarColor.value = 'success'
          updateSnackbar.value = true
          updateSnackbarCanClose.value = true
          setTimeout(() => {
            updateSnackbar.value = false
          }, 3000)
        }
      }
      break
    case 'offline':
      updateSnackbarText.value = `Offline: could not reach update server for ${indexName || 'index'}.`
      updateSnackbarColor.value = 'error'
      updateSnackbar.value = true
      updateSnackbarCanClose.value = true
      break
    case 'error':
      updateSnackbarText.value = `Error checking update for ${indexName || 'index'}: ${error || 'Unknown error'}.`
      updateSnackbarColor.value = 'error'
      updateSnackbar.value = true
      updateSnackbarCanClose.value = true
      break
  }
}

onMounted(() => {
  window.mainApi.on('msgUpdateStatus', handleUpdateStatus)

  // Trigger update check shortly after boot (e.g., 2 seconds delay)
  setTimeout(() => {
    window.mainApi.invoke('msgTriggerUpdateCheck')
  }, 2000)
})

onUnmounted(() => {
  window.mainApi.off('msgUpdateStatus', handleUpdateStatus)
})
</script>
