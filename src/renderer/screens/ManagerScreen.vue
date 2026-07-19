<template>
  <v-app-bar color="subheader" density="compact" height="50">
    <v-btn
      variant="text"
      :class="{ active: characterStore.currentManageStage === 'character' }"
      @click="handlePage('character')"
      >Character</v-btn
    >
    <v-btn
      variant="text"
      :class="{ active: characterStore.currentManageStage === 'backstory' }"
      @click="handlePage('backstory')"
      >Backstory</v-btn
    >
    <v-btn
      variant="text"
      :class="{ active: characterStore.currentManageStage === 'notes' }"
      @click="handlePage('notes')"
      >Notes</v-btn
    >
    <v-btn
      variant="text"
      :class="{ active: characterStore.currentManageStage === 'allies' }"
      @click="handlePage('allies')"
      >Allies & Organizations</v-btn
    >
    <v-btn
      variant="text"
      :class="{ active: characterStore.currentManageStage === 'attacks' }"
      @click="handlePage('attacks')"
      >Attacks & Spellcasting</v-btn
    >
  </v-app-bar>
  <v-container fluid class="pa-4">
    <ManageCharacterTab v-if="characterStore.currentManageStage === 'character'" />
    <v-card v-else variant="outlined" style="border-color: rgba(128, 128, 128, 0.2)">
      <v-card-title class="text-subtitle-1 font-weight-bold py-3 border-bottom text-capitalize">
        {{ characterStore.currentManageStage }} Info
      </v-card-title>
      <v-card-text class="py-6 text-center text-grey">
        No {{ characterStore.currentManageStage }} information found.
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="tsx">
import { useAppStore } from '../store/appStore'
import ManageCharacterTab from './manageScreens/ManageCharacterTab.vue'

const characterStore = useAppStore()

const handlePage = (page: string) => {
  characterStore.currentManageStage = page
}
</script>

<style scoped>
.v-btn {
  opacity: 0.4;
}
.active {
  opacity: 1 !important;
}
.border-bottom {
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
}
</style>
