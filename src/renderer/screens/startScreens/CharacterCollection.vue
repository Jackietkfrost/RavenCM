<template>
  <v-container>
    <v-row no-gutters class="text-center">
      <v-col cols="4"></v-col>
      <v-col cols="8">
        <v-card v-for="character in characterStore.characters" :key="character">
          <v-card-title>{{
            hasCharacters
              ? characterStore.characters[0].character.display_properties[0].name[0]
              : 'Unknown'
          }}</v-card-title>
          Race, Class, Level, Image</v-card
        >
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="tsx">
import { useAppStore } from '@/renderer/store/appStore';
import { ref } from 'vue';


const characterStore = useAppStore()
const hasCharacters = ref(characterStore.getCharacters)

// import { useI18n } from 'vue-i18n'
</script>
