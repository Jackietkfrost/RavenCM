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
    </v-layout>
  </v-app>
</template>
<script setup lang="tsx">
import CreateCharacterDrawer from '@/renderer/screens/CreateCharacterDrawer.vue'
import HeaderLayout from '@/renderer/components/layout/HeaderLayout.vue'
import CustomTitleBar from '@/renderer/components/layout/CustomTitleBar.vue'
import SettingsScreen from '@/renderer/screens/SettingsScreen.vue'
import { useAppStore } from '@/renderer/store/appStore'

const characterStore = useAppStore()
</script>
