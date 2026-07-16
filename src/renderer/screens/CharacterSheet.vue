<template>
  <v-container fluid class="pa-4">
    <v-row>
      <!-- Left column: Sheet generation options -->
      <v-col cols="5" class="pr-6">
        <!-- Generate Preview Title and Description -->
        <div class="mb-6">
          <div class="d-flex justify-space-between align-center border-bottom pb-2 mb-2">
            <span class="text-h6 font-weight-bold text-uppercase" style="letter-spacing: 0.05em">
              Generate Preview
            </span>
            <v-btn
              variant="text"
              color="primary"
              size="small"
              :prepend-icon="mdiCog"
              class="text-caption font-weight-bold"
            >
              Character Sheet Settings
            </v-btn>
          </div>
          <p class="text-caption text-grey mb-4">
            Generate a preview of the character sheet or save as a PDF Document. In the application settings you can enable/disable whether you want the sheet to be 'Form Fillable', if you want spell cards, item cards, attack cards, and feature cards.
          </p>

          <!-- Buttons row -->
          <div class="d-flex gap-x-3 mb-6">
            <v-btn
              color="primary"
              variant="outlined"
              :prepend-icon="mdiFileSearchOutline"
              class="mr-2"
              @click="generatePreview"
              :loading="generating"
            >
              Generate Preview
            </v-btn>
            <v-btn
              color="primary"
              variant="outlined"
              :prepend-icon="mdiFilePdfBox"
              @click="saveCharacterSheet"
              :disabled="generating"
            >
              Save Character Sheet
            </v-btn>
          </div>
        </div>

        <!-- Additional Fields Section -->
        <div>
          <div class="text-h6 font-weight-bold text-uppercase border-bottom pb-2 mb-2" style="letter-spacing: 0.05em">
            Additional Fields
          </div>
          <p class="text-caption text-grey mb-4">
            Some fields on the new custom character sheet are not fully implemented yet and can temporary be populated here.
          </p>
          <v-text-field
            label="ARMOR CLASS (CONDITIONAL FIELD)"
            v-model="characterStore.character.armorClass"
            variant="outlined"
            density="compact"
            hide-details
            class="mb-4"
          ></v-text-field>
        </div>
      </v-col>

      <!-- Right column: Preview box -->
      <v-col cols="7">
        <!-- Iframe loader when PDF is generated -->
        <div v-if="pdfUrl" class="fill-height" style="min-height: calc(100vh - 220px);">
          <iframe
            :src="pdfUrl"
            style="border: none; width: 100%; height: 100%; min-height: calc(100vh - 220px); border-radius: 4px; background-color: white;"
          ></iframe>
        </div>

        <!-- Empty state or generating loading placeholder -->
        <v-card
          v-else
          variant="outlined"
          class="d-flex flex-column align-center justify-center fill-height"
          style="
            border-color: rgba(128, 128, 128, 0.2);
            min-height: calc(100vh - 220px);
            background-color: rgba(var(--v-theme-surface-variant), 0.02);
            border-radius: 4px;
          "
        >
          <template v-if="generating">
            <v-progress-circular indeterminate color="primary" size="64" class="mb-4"></v-progress-circular>
            <div class="text-subtitle-1 text-grey">Generating Character Sheet PDF...</div>
            <div class="text-caption text-grey-darken-1 mt-1">Reading elements and writing form fields</div>
          </template>
          <template v-else>
            <v-icon :icon="mdiFilePdfBox" size="120" class="text-grey-darken-2 opacity-50 mb-3" />
            <div class="text-subtitle-1 text-grey">Character Sheet Preview</div>
            <div class="text-caption text-grey-darken-1 mt-1">Click "Generate Preview" to load the document</div>
          </template>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="tsx">
import { useAppStore } from '@/renderer/store/appStore'
import { mdiCog, mdiFileSearchOutline, mdiFilePdfBox } from '@mdi/js'
import { ref, computed, watch } from 'vue'

const characterStore = useAppStore()
const generating = ref(false)
const pdfBase64 = ref('')
const pdfUrl = ref('')

const hasActiveCharacter = computed(() => !!characterStore.character && !!characterStore.character.filePath)

const generatePreview = async () => {
  if (!hasActiveCharacter.value) return
  generating.value = true
  pdfUrl.value = ''
  pdfBase64.value = ''
  try {
    const res = await window.mainApi.invoke(
      'msgGeneratePreview',
      characterStore.character.filePath,
      characterStore.character.armorClass || ''
    )
    if (res && res.success && res.base64) {
      pdfBase64.value = res.base64
      pdfUrl.value = `data:application/pdf;base64,${res.base64}`
    } else {
      console.error('Failed to generate preview:', res?.error)
    }
  } catch (e) {
    console.error('Error generating preview:', e)
  } finally {
    generating.value = false
  }
}

const saveCharacterSheet = async () => {
  if (!hasActiveCharacter.value) return
  if (!pdfBase64.value) {
    await generatePreview()
  }
  if (pdfBase64.value) {
    try {
      const res = await window.mainApi.invoke(
        'msgSavePdf',
        pdfBase64.value,
        characterStore.character.name || 'Character'
      )
      if (res && res.success) {
        console.log('Saved PDF sheet successfully to:', res.filePath)
      } else {
        console.error('Failed to save PDF sheet:', res?.error)
      }
    } catch (e) {
      console.error('Error saving PDF sheet:', e)
    }
  }
}

watch(() => characterStore.autoGenerateTrigger, (newVal) => {
  if (newVal > 0) {
    generatePreview()
  }
})
</script>

<style scoped>
.border-bottom {
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
}
.gap-x-3 {
  column-gap: 12px;
}
</style>
