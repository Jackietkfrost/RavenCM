<template>
  <v-app-bar color="primary" density="compact" height="50">
    <v-btn>Spells</v-btn>
    <v-btn>Sorceror</v-btn>
    <v-btn>Wizard</v-btn>
  </v-app-bar>
  <v-container>
    <v-row>
      <v-col cols="8">
        <v-data-table-virtual
          :headers="spellsHeaders"
          :items="spellData"
          color="primary"
          height="500"
          hover
          sticky
        ></v-data-table-virtual>
      </v-col>
      <v-col>
        <v-card><v-card-text>TEST</v-card-text></v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card
          ><v-card-title>TEST</v-card-title>
          <v-data-table-virtual
            :headers="selectedSpellsHeaders"
            :items="selectedSpells"
            height="200"
            hover
            sticky
          >
          </v-data-table-virtual>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup lang="tsx">
// import { useI18n } from 'vue-i18n'

// const { t } = useI18n()

import { ref } from 'vue'

const spellsHeaders = ref([
  { title: 'Spell', key: 'Spell' },
  { title: 'LevelSchool', key: 'LevelSchool' },
  { title: 'Verbal', key: 'Verbal' },
  { title: 'Somatic', key: 'Somatic' },
  { title: 'Material', key: 'Material' },
  { title: 'Source', key: 'Source' }
])

const selectedSpellsHeaders = ref([
  { title: 'SpellType', key: 'SpellType' },
  { title: 'Selected Spell', key: 'SelectedSpell' },
  { title: 'Gained on Level', key: 'GainedOnLevel' },
  { title: 'Replaced', key: 'Replaced' },
  { title: 'Spellcasting Source', key: 'SpellcastingSource' }
])
const selectedSpells= ref([
  {
    SpellType: 'Cantrip (Wizard)',
    SelectedSpell: 'Fire Bolt',
    GainedOnLevel: 1,
    Replaced: false,
    SpellcastingSource: "Player's Handbook",
  },
  {
    SpellType: 'Cantrip (Wizard)',
    SelectedSpell: 'Animate Skull',
    GainedOnLevel: 1,
    Replaced: false,
    SpellcastingSource: "Dungeon Master's Guide",
  },
  {
    SpellType: 'Cantrip (Wizard)',
    SelectedSpell: 'Cheerful Song',
    GainedOnLevel: 1,
    Replaced: false,
    SpellcastingSource: "Player's Handbook",
  }])
const spellData = ref([
  {
    Spell: 'Magic Missile',
    LevelSchool: '1st',
    Verbal: false,
    Somatic: false,
    Material: false,
    Source: "Player's Handbook"
  },
  {
    Spell: 'Fireball',
    LevelSchool: '1st',
    Verbal: false,
    Somatic: false,
    Material: false,
    Source: "Dungeon Master's Guide"
  },
  {
    Spell: 'Healing Word',
    LevelSchool: '1st',
    Verbal: false,
    Somatic: false,
    Material: false,
    Source: "Player's Handbook"
  },
  {
    Spell: 'Shield',
    LevelSchool: '1st',
    Verbal: false,
    Somatic: false,
    Material: false,
    Source: "Player's Handbook"
  },
  {
    Spell: 'Lightning Bolt',
    LevelSchool: '1st',
    Verbal: false,
    Somatic: false,
    Material: false,
    Source: "Dungeon Master's Guide"
  },
  {
    Spell: 'Cure Wounds',
    LevelSchool: '1st',
    Verbal: false,
    Somatic: false,
    Material: false,
    Source: "Player's Handbook"
  },
  {
    Spell: 'Invisibility',
    LevelSchool: '1st',
    Verbal: false,
    Somatic: false,
    Material: false,
    Source: "Player's Handbook"
  },
  {
    Spell: 'Fly',
    LevelSchool: '1st',
    Verbal: false,
    Somatic: false,
    Material: false,
    Source: "Player's Handbook"
  },
  {
    Spell: 'Telekinesis',
    LevelSchool: '1st',
    Verbal: false,
    Somatic: false,
    Material: false,
    Source: "Dungeon Master's Guide"
  },
  {
    Spell: 'Dispel Magic',
    LevelSchool: '1st',
    Verbal: false,
    Somatic: false,
    Material: false,
    Source: "Player's Handbook"
  },
  {
    Spell: 'Burning Hands',
    LevelSchool: '1st',
    Verbal: false,
    Somatic: false,
    Material: false,
    Source: "Player's Handbook"
  },
  {
    Spell: 'Charm Person',
    LevelSchool: '1st',
    Verbal: false,
    Somatic: false,
    Material: false,
    Source: "Player's Handbook"
  },
  {
    Spell: 'Detect Magic',
    LevelSchool: '1st',
    Verbal: false,
    Somatic: false,
    Material: false,
    Source: "Player's Handbook"
  },
  {
    Spell: 'Feather Fall',
    LevelSchool: '1st',
    Verbal: false,
    Somatic: false,
    Material: false,
    Source: "Player's Handbook"
  },
  {
    Spell: 'Fog Cloud',
    LevelSchool: '1st',
    Verbal: false,
    Somatic: false,
    Material: false,
    Source: "Player's Handbook"
  },
  {
    Spell: 'Gust',
    LevelSchool: '1st',
    Verbal: false,
    Somatic: false,
    Material: false,
    Source: "Dungeon Master's Guide"
  },
  {
    Spell: 'Ice Knife',
    LevelSchool: '1st',
    Verbal: false,
    Somatic: false,
    Material: false,
    Source: "Dungeon Master's Guide"
  },
  {
    Spell: 'Jump',
    LevelSchool: '1st',
    Verbal: false,
    Somatic: false,
    Material: false,
    Source: "Player's Handbook"
  },
  {
    Spell: 'Knock',
    LevelSchool: '1st',
    Verbal: false,
    Somatic: false,
    Material: false,
    Source: "Player's Handbook"
  },
  {
    Spell: 'Mending',
    LevelSchool: '1st',
    Verbal: false,
    Somatic: false,
    Material: false,
    Source: "Player's Handbook"
  }
])
</script>
