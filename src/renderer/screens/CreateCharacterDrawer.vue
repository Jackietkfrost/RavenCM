<template>
  <v-navigation-drawer
    v-model="drawer"
    location="right"
    temporary
    width="500"
    color="background"
    @click:outside="characterStore.toggleCreateCharacter"
  >
    <v-carousel v-model="model" hide-delimiters height="164">
      <v-carousel-item class="justify-center" v-for="(item, index) in items" :key="index">
        <v-avatar :image="item.src" alt="Slide image" size="132" />
      </v-carousel-item>
    </v-carousel>
    <v-expansion-panels>
      <v-expansion-panel color="accordion" title="Character Details">
        <v-expansion-panel-text color="accordion">
          <v-row no-gutters>
            <v-col cols="12" sm="6">
              <v-text-field
                label="Name"
                v-model="characterName"
                hide-details
                density="compact"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="6">
              <v-select
                label="Starting Level"
                v-model="startingLevel"
                :items="levels"
                hide-details
                density="compact"
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                label="Pronouns"
                v-model="pronouns"
                hide-details
                density="compact"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-select
                label="Ability Score Generation Option"
                v-model="abilityGenerationOption"
                :items="abilityGenerationOptions"
                hide-details
                density="compact"
              ></v-select>
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
    <v-container>
      Character Options
      <small class="text-caption"
        >These options enable or disable some options your characters will have when being
        created.</small
      >
      <v-checkbox color="primary">
        <template #label>
          <div class="d-flex flex-column">
            <span>Average Hit Points</span>
            <small class="text-caption"
              >The character is awarded the average number of hit points based on their hit dice.
            </small>
          </div>
        </template>
      </v-checkbox>
      <v-checkbox>
        <template #label>
          <div class="d-flex flex-column">
            <span>Feats</span>
            <small class="text-caption"
              >Using the optional feats rule, you can forgo taking Ability Score improvement feature
              to take a feat of your choice instead.</small
            >
          </div>
        </template>
      </v-checkbox>
      <v-checkbox>
        <template #label>
          <div class="d-flex flex-column">
            <span>Multiclassing</span>
            <small class="text-caption"
              >Multiclassing allows you to gain levels in multiple classes. To qualify for a new
              class, you must meet the the ability score prerequisites for both your current class
              and your new one.</small
            >
          </div>
        </template>
      </v-checkbox>
    </v-container>
    <template #append>
      <v-container class="d-flex justify-center">
        <v-btn class="mx-2" @click="characterStore.toggleCreateCharacter" color="error">
          Close
        </v-btn>
        <v-btn class="mx-2" color="primary" @click="handleCreateCharacter">
          Create Character
        </v-btn>
      </v-container>
    </template>
  </v-navigation-drawer>
</template>
<script setup lang="tsx">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store/appStore'

interface Image {
  src: string
}
const characterStore = useAppStore()
const model = ref(0)
const characterName = ref('')
const startingLevel = ref(1)
const levels = ref(Array.from({ length: 20 }, (_, i) => i + 1))
const pronouns = ref('')
const abilityGenerationOption = ref('Roll 4d6 - Discard Lowest')
const abilityGenerationOptions = ref([
  'Roll 3d6',
  'Roll 4d6 - Discard Lowest',
  'Standard Array (15, 14, 13, 12, 10, 8)',
  'Point Buy'
])
const router = useRouter()

const handleRoute = (path: string): void => {
  router.push(path)
}

const drawer = computed<boolean>({
  get: () => characterStore.createCharacter,
  set: (value) => (characterStore.createCharacter = value)
})

const items = ref<Image[]>([
  { src: 'https://picsum.photos/200/300' },
  { src: 'https://picsum.photos/200/301' },
  { src: 'https://picsum.photos/200/302' },
  { src: 'https://picsum.photos/200/303' },
  { src: 'https://picsum.photos/200/304' }
])

const handleCreateCharacter = async (): Promise<void> => {
  const data = {
    name: characterName.value,
    avatar: items.value[model.value].src,
    level: startingLevel.value,
    pronouns: pronouns.value,
    abilityGenerationOption: abilityGenerationOption.value,
    race: '',
    class: '',
    languages: [],
    feat: '',
    proficiency: '',
    background: '',
    alignment:  '',
    archetype:  ''
  }
  characterStore.setCharacter(data)
  handleRoute('/builder')
}
</script>
