<template>
  <v-container fluid class="pa-0">
    <v-row>
      <!-- Left Column (Welcome, New Character, What's New) -->
      <v-col cols="12" md="4" lg="3">
        <div class="welcome-section mb-6">
          <h3 class="text-subtitle-1 font-weight-bold text-uppercase mb-2 text-primary">
            Welcome to Raven
          </h3>
          <p class="text-body-2 text-medium-emphasis">
            Your characters are ready for you to load, level up, and manage. Additionally, your characters can be grouped together and those marked as favorite are listed first in the group they are in.
          </p>
        </div>

        <!-- New Character Card Button -->
        <v-card
          class="new-character-card mb-6 d-flex flex-column justify-center"
          @click="handleStartCreateCharacter"
          ripple
          flat
        >
          <div class="new-character-content text-left">
            <div class="text-overline font-weight-black text-white" style="line-height: 1.2;">NEW CHARACTER</div>
            <div class="text-caption text-white-70">CREATE A NEW CHARACTER</div>
          </div>
        </v-card>

        <!-- What's New Section -->
        <div class="whats-new-section">
          <h3 class="text-subtitle-1 font-weight-bold text-uppercase mb-2 text-primary">
            What's New
          </h3>
          <v-divider class="mb-2" />
          <p class="text-body-2 text-medium-emphasis">
            There are no new articles available.
          </p>
        </div>
      </v-col>

      <!-- Right Column (Characters List or Empty State) -->
      <v-col cols="12" md="8" lg="9" class="ps-md-8">
        <!-- Empty State -->
        <div v-if="!hasCharacters" class="text-center py-12">
          <v-icon :icon="mdiAccountGroup" size="200" class="mb-4 text-grey-darken-1 opacity-70" />
          <h2 class="text-h4 font-weight-bold mb-2">No Characters Yet..</h2>
          <p class="text-body-1 text-medium-emphasis mb-6">
            You should create your first D&D character to get started
          </p>
          <v-btn
            color="secondary"
            size="large"
            :prepend-icon="mdiPlus"
            @click="handleStartCreateCharacter"
          >
            {{ t('menu.create-character') }}
          </v-btn>
        </div>

        <!-- Character List -->
        <div v-else>
          <h3 class="text-subtitle-1 font-weight-bold text-uppercase mb-4 text-primary">
            Characters
          </h3>
          <v-divider class="mb-4" />
          <v-row>
            <v-col
              v-for="character in characterStore.characters"
              :key="character.name"
              cols="12"
              sm="6"
              md="4"
            >
              <v-card class="character-card text-left" outline hover @click="handleSelectCharacter(character)">
                <v-img
                  :src="character.avatar || '/images/icon-64px.png'"
                  height="120"
                  cover
                  class="align-end text-white"
                  style="background-color: rgba(var(--v-theme-surface-variant), 0.2);"
                >
                  <v-card-title class="bg-black-50 text-truncate py-1 px-3 text-subtitle-1">
                    {{ character.name }}
                  </v-card-title>
                </v-img>
                <v-card-text class="py-2 px-3">
                  <div class="text-subtitle-2 text-truncate font-weight-bold">
                    {{ character.race }} {{ character.class }}
                  </div>
                  <div class="text-caption text-medium-emphasis">Level {{ character.level }}</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="tsx">
import { useAppStore } from '@/renderer/store/appStore'
import { mdiAccountGroup, mdiPlus } from '@mdi/js'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const characterStore = useAppStore()
const hasCharacters = computed(() => characterStore.getCharacters.length > 0)
const handleStartCreateCharacter = async (): Promise<void> => {
  characterStore.toggleCreateCharacter()
}
const handleSelectCharacter = (character: any) => {
  characterStore.setCharacter(character)
}
</script>

<style scoped>
.new-character-card {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-button)) 100%);
  border: 2px dashed rgba(255, 255, 255, 0.4) !important;
  border-radius: 4px;
  cursor: pointer;
  height: 80px;
  padding: 12px 20px;
  transition: all 0.3s ease;
}

.new-character-card:hover {
  border-color: rgba(255, 255, 255, 0.8) !important;
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.text-white-70 {
  color: rgba(255, 255, 255, 0.7);
}

.bg-black-50 {
  background-color: rgba(0, 0, 0, 0.6);
  width: 100%;
}

.character-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  transition: all 0.2s ease;
}

.character-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
