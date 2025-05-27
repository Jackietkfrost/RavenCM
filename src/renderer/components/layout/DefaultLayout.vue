<template>
  <v-app>
    <v-layout>
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
import { useAppStore } from '@/renderer/store/appStore'

const characterStore = useAppStore()
const drawer = ref(characterStore.createCharacter)
</script>
