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
            >
              Generate Preview
            </v-btn>
            <v-btn
              color="primary"
              variant="outlined"
              :prepend-icon="mdiFilePdfBox"
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
          ></v-text-field>
        </div>
      </v-col>

      <!-- Right column: Preview box -->
      <v-col cols="7">
        <v-card
          variant="outlined"
          class="d-flex flex-column align-center justify-center fill-height"
          style="
            border-color: rgba(128, 128, 128, 0.2);
            min-height: calc(100vh - 220px);
            background-color: rgba(var(--v-theme-surface-variant), 0.02);
            border-radius: 4px;
          "
        >
          <v-icon :icon="mdiFilePdfBox" size="120" class="text-grey-darken-2 opacity-50 mb-3" />
          <div class="text-subtitle-1 text-grey">Character Sheet Preview</div>
          <div class="text-caption text-grey-darken-1 mt-1">Click "Generate Preview" to load the document</div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="tsx">
import { useAppStore } from '@/renderer/store/appStore'
import { mdiCog, mdiFileSearchOutline, mdiFilePdfBox } from '@mdi/js'

const characterStore = useAppStore()
</script>

<style scoped>
.border-bottom {
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
}
.gap-x-3 {
  column-gap: 12px;
}
</style>
