<template>
  <v-app>
    <CustomTitleBar />
    <v-layout style="top: 38px; height: calc(100vh - 38px); position: absolute; left: 0; right: 0; bottom: 0;">
      <CreateCharacterDrawer :drawer="drawer" />
      <HeaderLayout />
      <v-main>
        <slot />
      </v-main>
    </v-layout>
  </v-app>
</template>
<script setup lang="tsx">
import { ref } from 'vue'
import CreateCharacterDrawer from '@/renderer/screens/CreateCharacterDrawer.vue'
import HeaderLayout from '@/renderer/components/layout/HeaderLayout.vue'
import CustomTitleBar from '@/renderer/components/layout/CustomTitleBar.vue'
import { useAppStore } from '@/renderer/store/appStore'

const characterStore = useAppStore()
const drawer = ref(characterStore.createCharacter)
</script>
