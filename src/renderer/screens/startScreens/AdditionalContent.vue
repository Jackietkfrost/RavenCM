<template>
  <v-container>
    <h2>Extending the content</h2>
    <p>
      Raven Character Manager comes bundled with all the content that is included in the System
      Reference Document released under the Open Gaming License. To extend the content, you can
      build your own XML files and add them to the content folder, or use an index file.
    </p>
    <h2>Index Files</h2>
    <p>
      Index files allow the creator to update his or her files and allow Aurora to automatically
      download and update the content. When you've obtained the URL of the .index file; enter it in
      the field below and click 'Download' and then click 'Update Content Files'.
    </p>
    <v-text-field
      placeholder="https://"
      label="Remote Index File URL"
      density="compact"
      variant="outlined"
      v-model="indexUrl"
    >
      <template #append>
        <v-btn
          :prepend-icon="mdiFileDownload"
          color="button"
          small
          variant="flat"
          @click="handleDownloadingContent"
          text="Download"
        />
      </template>
    </v-text-field>
    <h2>UPDATE CONTENT FILES</h2>

    <p
      >Unless disabled, the application will check in the background for updated content shortly
      after starting up. After content has been updated a button will be available to restart the
      application so the updated content can be reloaded. When you are experiencing issues with the
      content you can click the 'Clear Downloaded Content' button to remove content files added
      through the index files. Then click 'Update Content Files' to download the latest files new..
      You should place your personal homebrew files in the specific 'custom\user' folder.</p
    >
    <v-btn
      class="mx-1"
      color="button"
      :prepend-icon="mdiFolderDownload"
      @click="handleUpdateContentFiles"
      >Update Content Files</v-btn
    >
    <v-btn class="mx-1" color="button" :prepend-icon="mdiFolderRemove"
      >Clear Downloaded Content</v-btn
    >
    <v-divider vertical />
    <v-btn
      class="mx-1"
      color="button"
      :prepend-icon="mdiFolderOpen"
      @click="handleOpenContentFolder"
      >Content Folder</v-btn
    >
    <v-btn
      class="mx-1"
      color="button"
      :prepend-icon="mdiFolderAccount"
      @click="handleOpenUserFolder"
      >User Content Folder</v-btn
    >

    <v-snackbar v-model="showError" color="error" timeout="3000"> No index file found </v-snackbar>

    <v-snackbar v-model="showAlreadyUpToDate" color="success" timeout="3000">
      Already up to date
    </v-snackbar>
  </v-container>
</template>
<script setup lang="tsx">
import { useAppStore } from '@/renderer/store/appStore'
import {
  mdiFileDownload,
  mdiFolderAccount,
  mdiFolderDownload,
  mdiFolderOpen,
  mdiFolderRemove
} from '@mdi/js'
import { ref } from 'vue'

const useCharacterStore = useAppStore()
const indexUrl = ref('')
const showError = ref(false)
const showAlreadyUpToDate = ref(false)

const handleDownloadingContent = async () => {
  let rawUrl = indexUrl.value.trim()
  if (!rawUrl) return

  if (!/^https?:\/\//i.test(rawUrl)) {
    rawUrl = 'https://' + rawUrl
  }

  try {
    const urlObj = new URL(rawUrl)
    if (!urlObj.pathname.endsWith('.index')) {
      showError.value = true
      return
    }
    const res = await useCharacterStore.addIndexUrl(rawUrl)
    if (res && res.status === 'up-to-date') {
      showAlreadyUpToDate.value = true
    } else if (res && (res.status === 'offline' || res.status === 'error')) {
      showError.value = true
    } else {
      window.mainApi.invoke('msgTriggerUpdateCheck')
    }
  } catch {
    showError.value = true
  }
}

const handleUpdateContentFiles = () => {
  window.mainApi.invoke('msgTriggerUpdateCheck')
}

const handleOpenContentFolder = () => {
  window.mainApi.invoke('msgOpenContentFolder')
}

const handleOpenUserFolder = () => {
  window.mainApi.invoke('msgOpenUserFolder')
}
</script>
<style></style>
