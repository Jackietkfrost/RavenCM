<template>
  <v-app-bar color="subheader" density="compact" height="50" sticky>
    <v-btn :class="{ active: isCurrentStage('spells') }">Spellcasting</v-btn>
    <v-btn v-if="classSupportsSpells" disabled class="ml-2">
      {{ characterStore.character.class }}
    </v-btn>
  </v-app-bar>

  <template v-if="characterStore.character.class && classSupportsSpells">
    <SpellsScreen />
  </template>
  <template v-else>
    <v-container
      fluid
      class="pa-4 d-flex align-center justify-center"
      style="height: calc(100vh - 120px)"
    >
      <div class="text-center text-grey">
        <div class="text-h6">Choose a class that can use spells for options.</div>
      </div>
    </v-container>
  </template>
</template>

<script setup lang="tsx">
import { computed } from 'vue'
import { useAppStore } from '../store/appStore'
import SpellsScreen from './magicScreens/SpellsScreen.vue'

const characterStore = useAppStore()

const isCurrentStage = (stage: string): boolean => {
  return characterStore.currentMagicStage === stage
}

const allSpells = computed(() => characterStore.elements.spells || [])

// Check if chosen class has spellcasting support in elements XMLs
const classSupportsSpells = computed(() => {
  const currentClass = characterStore.character.class
  if (!currentClass) return false

  const allSpellsList = allSpells.value
  const classNameLower = currentClass.toLowerCase()
  return allSpellsList.some((spell: any) => {
    if (!spell.supports) return false
    const classes = spell.supports.split(',').map((s: string) => s.trim().toLowerCase())
    return classes.includes(classNameLower)
  })
})
</script>

<style scoped>
.v-btn {
  opacity: 0.4;
}
.active {
  opacity: 1 !important;
}
</style>
