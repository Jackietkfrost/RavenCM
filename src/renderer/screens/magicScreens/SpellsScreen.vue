<template>
<v-btn>Spells</v-btn>
<v-data-table :headers="headers" :items="spellData"></v-data-table>
</template>
<script setup lang="tsx">
import { ref } from 'vue'

const headers = ref([
    { title: 'Spell', key: 'Spell' },
    { title: 'Source', key: 'Source' },
  ])

const spellData = ref([
  { Spell: 'Magic Missile', Source: 'Player\'s Handbook' },
  { Spell: 'Fireball', Source: 'Dungeon Master\'s Guide' },
  { Spell: 'Healing Word', Source: 'Player\'s Handbook' },
  { Spell: 'Shield', Source: 'Player\'s Handbook' },
  { Spell: 'Lightning Bolt', Source: 'Dungeon Master\'s Guide' },
  { Spell: 'Cure Wounds', Source: 'Player\'s Handbook' },
  { Spell: 'Invisibility', Source: 'Player\'s Handbook' },
  { Spell: 'Fly', Source: 'Player\'s Handbook' },
  { Spell: 'Telekinesis', Source: 'Dungeon Master\'s Guide' },
  { Spell: 'Dispel Magic', Source: 'Player\'s Handbook' },
])
</script>
<style scoped>
.v-btn {
  opacity: 0.4;
}
.active {
  opacity: 1 !important;
}
</style>
