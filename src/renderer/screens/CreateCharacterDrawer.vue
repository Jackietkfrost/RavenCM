<template>
  <v-navigation-drawer
    v-model="drawer"
    location="right"
    temporary
    width="500"
    color="background"
    @click:outside="characterStore.toggleCreateCharacter"
  >
    <!-- Drawer Title Header matching screenshot layout -->
    <div
      class="text-center py-4 text-h5 font-weight-bold text-uppercase"
      style="letter-spacing: 0.15em; border-bottom: 1px solid rgba(128, 128, 128, 0.2)"
    >
      New Character
    </div>

    <!-- Custom 3D Overlapping Avatar Carousel -->
    <div class="d-flex align-center justify-space-between px-4 my-4" style="height: 160px">
      <!-- Previous button -->
      <v-btn
        variant="text"
        @click="selectPrev"
        color="grey-lighten-1"
        :icon="mdiChevronLeft"
      ></v-btn>

      <!-- Avatars container (max-width forces overlapping) -->
      <div
        class="d-flex align-center justify-center position-relative flex-grow-1"
        style="max-width: 240px; height: 100%"
      >
        <!-- Left Avatar (Previous) -->
        <v-avatar
          size="72"
          class="cursor-pointer position-absolute"
          style="
            left: 0;
            opacity: 0.4;
            z-index: 1;
            border: 2px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
          "
          @click="selectPrev"
        >
          <v-img :src="items[prevIndex].src" cover />
        </v-avatar>

        <!-- Center Avatar (Current) -->
        <v-avatar
          size="120"
          class="position-absolute"
          style="
            left: 50%;
            transform: translateX(-50%);
            z-index: 2;
            border: 4px solid var(--v-primary-base, #1976d2);
            box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.5);
            transition: all 0.3s ease;
          "
        >
          <v-img :src="items[model].src" cover />
        </v-avatar>

        <!-- Right Avatar (Next) -->
        <v-avatar
          size="72"
          class="cursor-pointer position-absolute"
          style="
            right: 0;
            opacity: 0.4;
            z-index: 1;
            border: 2px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
          "
          @click="selectNext"
        >
          <v-img :src="items[nextIndex].src" cover />
        </v-avatar>
      </div>

      <!-- Next button -->
      <v-btn
        variant="text"
        @click="selectNext"
        color="grey-lighten-1"
        :icon="mdiChevronRight"
      ></v-btn>
    </div>

    <v-expansion-panels class="px-2" v-model="activePanel">
      <v-expansion-panel value="details" color="accordion" title="Character Details">
        <v-expansion-panel-text color="accordion">
          <!-- Name field full-width -->
          <v-row>
            <v-col cols="12">
              <v-text-field
                label="Name"
                v-model="characterName"
                hide-details
                density="compact"
              ></v-text-field>
            </v-col>
          </v-row>
          <!-- Starting Level and Gender select dropdowns side-by-side -->
          <v-row>
            <v-col cols="6">
              <v-select
                label="Starting Level"
                v-model="startingLevel"
                :items="levels"
                hide-details
                density="compact"
              ></v-select>
            </v-col>
            <v-col cols="6">
              <v-select
                label="Gender"
                v-model="pronouns"
                :items="['Female', 'Male', 'Construct', 'Nonbinary']"
                hide-details
                density="compact"
              ></v-select>
            </v-col>
          </v-row>
          <!-- Ability Score Gen option full-width -->
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

    <!-- Character Options section styled matching screenshot -->
    <v-container class="mt-4 px-4">
      <div
        class="text-subtitle-1 font-weight-bold text-uppercase mb-1"
        style="letter-spacing: 0.05em"
        >Character Options</div
      >
      <div class="text-caption text-grey mb-4">
        These options enable or disable some options your characters will have.
      </div>

      <!-- Average Hit Points checkbox card -->
      <v-card
        variant="outlined"
        class="mb-3 pa-2"
        style="border-style: dashed; border-color: rgba(128, 128, 128, 0.4)"
      >
        <v-checkbox v-model="averageHitPoints" color="primary" hide-details>
          <template #label>
            <div class="d-flex flex-column ml-2">
              <span class="text-body-2 font-weight-bold text-uppercase">Average Hit Points</span>
              <span class="text-caption text-grey">
                The character is awarded the average amount of hit points based on their hit dice.
              </span>
            </div>
          </template>
        </v-checkbox>
      </v-card>

      <!-- Feats checkbox card -->
      <v-card
        variant="outlined"
        class="mb-3 pa-2"
        style="border-style: dashed; border-color: rgba(128, 128, 128, 0.4)"
      >
        <v-checkbox v-model="feats" color="primary" hide-details>
          <template #label>
            <div class="d-flex flex-column ml-2">
              <span class="text-body-2 font-weight-bold text-uppercase">Feats</span>
              <span class="text-caption text-grey">
                Using the optional feats rule, you can forgo taking the Ability Score Improvement
                feature to take a feat of your choice instead.
              </span>
            </div>
          </template>
        </v-checkbox>
      </v-card>

      <!-- Multiclassing checkbox card -->
      <v-card
        variant="outlined"
        class="mb-3 pa-2"
        style="border-style: dashed; border-color: rgba(128, 128, 128, 0.4)"
      >
        <v-checkbox v-model="multiclassing" color="primary" hide-details>
          <template #label>
            <div class="d-flex flex-column ml-2">
              <span class="text-body-2 font-weight-bold text-uppercase">Multiclassing</span>
              <span class="text-caption text-grey">
                Multiclassing allows you to gain levels in multiple classes. To qualify for a new
                class, you must meet the ability score prerequisites for both your current class and
                your new one.
              </span>
            </div>
          </template>
        </v-checkbox>
      </v-card>
    </v-container>

    <template #append>
      <v-container
        class="d-flex justify-center border-top"
        style="border-color: rgba(128, 128, 128, 0.2) !important"
      >
        <v-btn class="mx-2" @click="characterStore.toggleCreateCharacter" color="error">
          Cancel
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
import { CharacterInfo } from '../utils/dnd-typing'
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'

interface Image {
  src: string
}
const characterStore = useAppStore()
const model = ref(0)
const characterName = ref('')
const startingLevel = ref(1)
const levels = ref(Array.from({ length: 20 }, (_, i) => i + 1))
const pronouns = ref('Male')
const abilityGenerationOption = ref('Roll 4d6 - Discard Lowest')
const abilityGenerationOptions = ref([
  'Roll 3d6',
  'Roll 4d6 - Discard Lowest',
  'Standard Array (15, 14, 13, 12, 10, 8)',
  'Point Buy'
])
const averageHitPoints = ref(false)
const feats = ref(true)
const multiclassing = ref(true)
const activePanel = ref('details')
const router = useRouter()

const prevIndex = computed(() => (model.value - 1 + items.value.length) % items.value.length)
const nextIndex = computed(() => (model.value + 1) % items.value.length)

const selectPrev = () => {
  model.value = prevIndex.value
}
const selectNext = () => {
  model.value = nextIndex.value
}

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
  const data: CharacterInfo = {
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
    background: {
      name: '',
      description: '',
      id: '',
      source: ''
    },
    alignment: '',
    archetype: '',
    spells: [],
    averageHitPoints: averageHitPoints.value,
    feats: feats.value,
    multiclassing: multiclassing.value,
    gender: pronouns.value,
    playerName: '',
    experience: 0,
    deity: '',
    age: '',
    height: '',
    weight: '',
    eyes: '',
    skin: '',
    hair: '',
    additionalFeatures: '',
    armorClass: ''
  }
  characterStore.setCharacter(data)
  handleRoute('/builder')
}
</script>
