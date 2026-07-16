<template>
  <div class="character-manage-container">
    <!-- Character Details Section -->
    <div class="mb-6">
      <div class="text-h6 font-weight-bold text-uppercase border-bottom pb-2 mb-2" style="letter-spacing: 0.05em;">
        Character Details
      </div>
      <div class="text-caption text-grey mb-4">
        Characters are defined by much more than their race and class. They're individuals with their own stories, interests, connections, and capabilities beyond those that class and race define. This section expounds on the details that distinguish characters from one another, including the basics of name and physical description, the rules of backgrounds and languages, and the finer points of personality and alignment.
      </div>
      
      <v-row>
        <!-- Row 1 -->
        <v-col cols="12" md="4">
          <v-text-field
            label="CHARACTER NAME"
            v-model="characterStore.character.name"
            variant="outlined"
            density="compact"
            hide-details
            :prepend-inner-icon="mdiDice5Outline"
            @click:prepend-inner="handleRandomName"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <v-combobox
            label="GENDER"
            v-model="characterStore.character.pronouns"
            :items="genderOptions"
            variant="outlined"
            density="compact"
            hide-details
          ></v-combobox>
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            label="ALIGNMENT"
            v-model="characterStore.character.alignment"
            :items="alignmentOptions"
            variant="outlined"
            density="compact"
            hide-details
          ></v-select>
        </v-col>

        <!-- Row 2 -->
        <v-col cols="12" md="4">
          <v-text-field
            label="PLAYER NAME"
            v-model="characterStore.character.playerName"
            variant="outlined"
            density="compact"
            hide-details
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            label="CURRENT EXPERIENCE"
            v-model.number="characterStore.character.experience"
            type="number"
            variant="outlined"
            density="compact"
            hide-details
          >
            <template #append-inner>
              <div class="d-flex align-center gap-x-1" style="margin-right: -4px;">
                <v-btn icon size="x-small" variant="text" @click="incrementExp">
                  <v-icon :icon="mdiPlus" />
                </v-btn>
                <v-btn icon size="x-small" variant="text" @click="decrementExp">
                  <v-icon :icon="mdiMinus" />
                </v-btn>
              </div>
            </template>
          </v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <v-combobox
            label="DEITY (OPTIONAL)"
            v-model="characterStore.character.deity"
            :items="deitiesList"
            variant="outlined"
            density="compact"
            hide-details
            clearable
          ></v-combobox>
        </v-col>
      </v-row>
    </div>

    <!-- Appearance Section -->
    <div class="mb-6">
      <div class="text-h6 font-weight-bold text-uppercase border-bottom pb-2 mb-2" style="letter-spacing: 0.05em;">
        Appearance
      </div>
      <div class="text-caption text-grey mb-4">
        Define the appearance of your character below.
      </div>
      
      <v-row>
        <!-- Row 1 -->
        <v-col cols="12" md="4">
          <v-text-field
            label="AGE"
            v-model="characterStore.character.age"
            variant="outlined"
            density="compact"
            hide-details
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            label="HEIGHT"
            v-model="characterStore.character.height"
            variant="outlined"
            density="compact"
            hide-details
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            label="WEIGHT"
            v-model="characterStore.character.weight"
            variant="outlined"
            density="compact"
            hide-details
          ></v-text-field>
        </v-col>

        <!-- Row 2 -->
        <v-col cols="12" md="4">
          <v-combobox
            label="EYES"
            v-model="characterStore.character.eyes"
            :items="eyeOptions"
            variant="outlined"
            density="compact"
            hide-details
          ></v-combobox>
        </v-col>
        <v-col cols="12" md="4">
          <v-combobox
            label="SKIN"
            v-model="characterStore.character.skin"
            :items="skinOptions"
            variant="outlined"
            density="compact"
            hide-details
          ></v-combobox>
        </v-col>
        <v-col cols="12" md="4">
          <v-combobox
            label="HAIR"
            v-model="characterStore.character.hair"
            :items="hairOptions"
            variant="outlined"
            density="compact"
            hide-details
          ></v-combobox>
        </v-col>
      </v-row>
    </div>

    <!-- Additional Features Section -->
    <div>
      <div class="text-h6 font-weight-bold text-uppercase border-bottom pb-2 mb-2" style="letter-spacing: 0.05em;">
        Additional Features
      </div>
      <div class="text-caption text-grey mb-4">
        Does your character have any additional features that are from a different source than your race, class, or background?
      </div>
      
      <v-textarea
        label="ADDITIONAL FEATURES"
        v-model="characterStore.character.additionalFeatures"
        variant="outlined"
        rows="4"
        hide-details
      ></v-textarea>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { useAppStore } from '@/renderer/store/appStore'
import { mdiDice5Outline, mdiPlus, mdiMinus } from '@mdi/js'
import { computed } from 'vue'

const characterStore = useAppStore()

const genderOptions = ['Male', 'Female', 'Construct', 'Nonbinary']

const alignmentOptions = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
]

const eyeOptions = ['Blue', 'Brown', 'Green', 'Gray', 'Amber', 'Hazel', 'Red', 'Yellow', 'Black']
const skinOptions = ['Fair', 'Pale', 'Tan', 'Light Brown', 'Dark Brown', 'Black', 'Green', 'Blue', 'Red', 'Gray']
const hairOptions = ['Black', 'Brown', 'Blonde', 'Red', 'White', 'Gray', 'Silver', 'Bald']

const deitiesList = computed(() => {
  return (characterStore.elements.deities || []).map((d: any) => d.name)
})

const randomNames = [
  'Adrik', 'Alberich', 'Baern', 'Barendd', 'Brottor', 'Bruenor',
  'Dain', 'Darrak', 'Delg', 'Eberk', 'Einkil', 'Fargrim',
  'Flint', 'Gardain', 'Harbek', 'Kildrak', 'Morgran', 'Orsik',
  'Oskar', 'Rangrim', 'Rurik', 'Taklinn', 'Thoradin', 'Thorin',
  'Tordek', 'Traubon', 'Travok', 'Ulfgar', 'Veit', 'Vondal',
  'Amber', 'Artin', 'Audhild', 'Bardryn', 'Dagnal', 'Diesa',
  'Eldeth', 'Falkrunn', 'Finellen', 'Gunnloda', 'Gurdis', 'Helja',
  'Hlin', 'Kathra', 'Kristryd', 'Ilde', 'Liftrasa', 'Mardred',
  'Riswynn', 'Sannl', 'Torbera', 'Torgga', 'Vistra'
]

const handleRandomName = () => {
  const idx = Math.floor(Math.random() * randomNames.length)
  characterStore.character.name = randomNames[idx]
}

const incrementExp = () => {
  if (typeof characterStore.character.experience !== 'number') {
    characterStore.character.experience = 0
  }
  characterStore.character.experience += 100
}

const decrementExp = () => {
  if (typeof characterStore.character.experience !== 'number') {
    characterStore.character.experience = 0
  }
  characterStore.character.experience = Math.max(0, characterStore.character.experience - 100)
}
</script>

<style scoped>
.border-bottom {
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
}
.gap-x-1 {
  column-gap: 4px;
}
</style>
