<template>
  <v-navigation-drawer
    v-model="drawer"
    location="right"
    temporary
    width="500"
    color="background"
    @click:outside="characterStore.createCharacter = false"
  >
    <!-- VIEW MODE: At-A-Glance Stats Screen -->
    <template v-if="characterStore.drawerMode === 'view'">
      <!-- Name (XP) Header -->
      <div
        class="text-center py-4 text-h5 font-weight-bold text-uppercase name-title"
        style="letter-spacing: 0.1em; border-bottom: 1px solid rgba(128, 128, 128, 0.2)"
      >
        {{ characterStore.character.name }} ({{ characterStore.character.experience || 0 }})
      </div>

      <!-- Experience Progress Bar -->
      <div class="px-6 py-4">
        <div class="d-flex justify-space-between text-caption text-grey mb-1">
          <span>{{ xpInfo.minXp }} XP</span>
          <span>{{ xpInfo.maxXp }} XP</span>
        </div>
        <v-progress-linear
          :model-value="xpInfo.percentage"
          color="amber-darken-2"
          height="4"
          rounded
        />
      </div>

      <!-- Glowing Profile Picture -->
      <div class="d-flex justify-center my-4">
        <div class="profile-pic-container">
          <v-avatar size="180">
            <v-img :src="characterStore.character.avatar || '/images/icon-64px.png'" cover />
          </v-avatar>
        </div>
      </div>

      <!-- LEVEL X RACE CLASS -->
      <div class="text-center text-subtitle-1 font-weight-bold text-uppercase px-4 mt-2">
        Level {{ characterStore.character.level }} {{ characterStore.character.race || 'Race' }}
        {{ characterStore.character.class || 'Class' }}
      </div>

      <!-- Background | Pronouns | Alignment -->
      <div class="text-center text-caption text-grey text-uppercase px-4 mb-4">
        {{ characterStore.character.background?.name || 'No Background' }} •
        {{ characterStore.character.pronouns }} •
        {{ characterStore.character.alignment || 'Neutral' }}
      </div>

      <!-- Proficiency, Initiative, AC, Speed, HP Row -->
      <div class="text-center text-caption font-weight-bold text-uppercase px-4 mb-4 stats-row">
        PROFICIENCY: <span class="white-text">+{{ proficiencyBonus }}</span> &nbsp;&nbsp;
        INITIATIVE: <span class="white-text">{{ initiativeStr }}</span> &nbsp;&nbsp; AC:
        <span class="white-text">{{ armorClassValue }}</span> &nbsp;&nbsp; SPEED:
        <span class="white-text">{{ characterStore.character.speed || 30 }}ft</span> &nbsp;&nbsp;
        HP: <span class="white-text">{{ characterStore.character.hp || 10 }}</span>
      </div>

      <!-- Main Abilities grid -->
      <v-row
        no-gutters
        class="text-center my-4 py-2 border-top border-bottom justify-space-around"
        style="border-color: rgba(128, 128, 128, 0.15) !important"
      >
        <v-col
          v-for="stat in abilitiesList"
          :key="stat.label"
          cols="2"
          class="d-flex flex-column align-center"
        >
          <span class="text-caption font-weight-bold text-grey-lighten-1 text-uppercase">{{
            stat.label
          }}</span>
          <span class="text-body-2 font-weight-bold mt-1 text-white">
            {{ stat.value }} <span class="text-caption text-grey">({{ stat.mod }})</span>
          </span>
        </v-col>
      </v-row>

      <!-- Collapsible Expansion Panels -->
      <v-expansion-panels class="px-2" v-model="viewActivePanels" multiple>
        <!-- SKILLS Panel -->
        <v-expansion-panel value="skills" color="accordion">
          <v-expansion-panel-title class="font-weight-bold text-uppercase py-2 text-subtitle-2">
            Skills
          </v-expansion-panel-title>
          <v-expansion-panel-text color="accordion" class="pa-0">
            <v-row no-gutters class="px-1 py-1">
              <v-col cols="6" v-for="skill in skillsList" :key="skill.name">
                <v-checkbox
                  v-model="characterStore.character.proficientSkills"
                  :value="skill.name"
                  density="compact"
                  hide-details
                  color="primary"
                  readonly
                  @change="saveCharacterAutomatically"
                >
                  <template #label>
                    <span class="text-caption font-weight-medium text-truncate">
                      <span class="text-grey mr-1" style="min-width: 24px; display: inline-block">{{
                        skill.modStr
                      }}</span>
                      <span class="text-white text-uppercase" style="letter-spacing: 0.05em">{{
                        skill.name
                      }}</span>
                      <span class="text-caption text-grey ml-1">({{ skill.ability }})</span>
                    </span>
                  </template>
                </v-checkbox>
              </v-col>

              <!-- Passive Perception -->
              <v-col cols="12" class="px-3 pt-2">
                <div class="d-flex align-center">
                  <v-checkbox
                    v-model="characterStore.character.proficientSkills"
                    value="PassivePerception"
                    density="compact"
                    hide-details
                    color="primary"
                    disabled
                    class="mr-2"
                  >
                    <template #label>
                      <span class="text-caption font-weight-medium">
                        <span class="text-grey mr-1" style="min-width: 24px; display: inline-block"
                          >+{{ passivePerception }}</span
                        >
                        <span class="text-white text-uppercase" style="letter-spacing: 0.05em"
                          >Passive Perception</span
                        >
                      </span>
                    </template>
                  </v-checkbox>
                </div>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- SAVING THROWS Panel -->
        <v-expansion-panel value="saves" color="accordion">
          <v-expansion-panel-title class="font-weight-bold text-uppercase py-2 text-subtitle-2">
            Saving Throws
          </v-expansion-panel-title>
          <v-expansion-panel-text color="accordion">
            <v-row no-gutters class="px-1 py-1">
              <v-col cols="6" v-for="save in savingThrowsList" :key="save.key">
                <v-checkbox
                  v-model="characterStore.character.proficientSavingThrows"
                  :value="save.key"
                  density="compact"
                  hide-details
                  color="primary"
                  readonly
                  @change="saveCharacterAutomatically"
                >
                  <template #label>
                    <span class="text-caption font-weight-medium text-truncate">
                      <span class="text-grey mr-1" style="min-width: 24px; display: inline-block">{{
                        save.modStr
                      }}</span>
                      <span class="text-white text-uppercase" style="letter-spacing: 0.05em">{{
                        save.label
                      }}</span>
                    </span>
                  </template>
                </v-checkbox>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- CONDITIONS Panel -->
        <v-expansion-panel value="conditions" color="accordion">
          <v-expansion-panel-title class="font-weight-bold text-uppercase py-2 text-subtitle-2">
            Conditions
          </v-expansion-panel-title>
          <v-expansion-panel-text color="accordion">
            <div class="text-caption font-italic text-white px-2 py-1">
              {{ conditionsStr }}
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- ADDITIONAL STATISTICS Panel -->
        <v-expansion-panel value="additional_stats" color="accordion">
          <v-expansion-panel-title class="font-weight-bold text-uppercase py-2 text-subtitle-2">
            Additional Statistics
          </v-expansion-panel-title>
          <v-expansion-panel-text color="accordion" class="pa-0">
            <v-table density="compact" class="bg-transparent additional-stats-table">
              <tbody>
                <tr>
                  <td class="text-left text-caption font-weight-bold py-1 px-3" style="width: 120px"
                    >SPEED</td
                  >
                  <td class="text-center text-caption py-1 px-2" style="width: 40px">{{
                    characterStore.character.speed || 30
                  }}</td>
                  <td class="text-right text-caption text-grey py-1 px-3"
                    >Innate ({{ characterStore.character.speed || 30 }})</td
                  >
                </tr>
                <tr>
                  <td class="text-left text-caption font-weight-bold py-1 px-3">HP</td>
                  <td class="text-center text-caption py-1 px-2">{{ hpBreakdown.totalHp }}</td>
                  <td class="text-right text-caption text-grey py-1 px-3">
                    {{ characterStore.character.class || 'Class' }} ({{ hpBreakdown.classHp }}),
                    Constitution Modifier ({{ hpBreakdown.conHp }})
                  </td>
                </tr>
                <tr>
                  <td class="text-left text-caption font-weight-bold py-1 px-3">AC</td>
                  <td class="text-center text-caption py-1 px-2">{{ armorClassValue }}</td>
                  <td class="text-right text-caption text-grey py-1 px-3">
                    Unarmored (10){{
                      String(characterStore.character.race).toLowerCase() === 'warforged'
                        ? ', Integrated Protection (1)'
                        : ''
                    }}
                  </td>
                </tr>
                <tr>
                  <td class="text-left text-caption font-weight-bold py-1 px-3">INITIATIVE</td>
                  <td class="text-center text-caption py-1 px-2">{{ initiativeStr }}</td>
                  <td class="text-right text-caption text-grey py-1 px-3"></td>
                </tr>
              </tbody>
            </v-table>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </template>

    <!-- CREATE MODE: Original Create Form -->
    <template v-else>
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

      <!-- Randomize Portrait Button -->
      <div class="d-flex justify-center mb-4">
        <v-btn
          variant="tonal"
          size="small"
          color="primary"
          :prepend-icon="mdiDice5Outline"
          @click="selectRandom"
          class="text-none font-weight-bold"
        >
          Randomize Portrait
        </v-btn>
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
                  class, you must meet the ability score prerequisites for both your current class
                  and your new one.
                </span>
              </div>
            </template>
          </v-checkbox>
        </v-card>
      </v-container>
    </template>

    <template #append>
      <!-- View Mode Footer -->
      <v-container
        v-if="characterStore.drawerMode === 'view'"
        class="d-flex justify-center border-top py-3"
        style="border-color: rgba(128, 128, 128, 0.2) !important"
      >
        <v-btn
          block
          color="grey-darken-3"
          class="text-none"
          @click="characterStore.createCharacter = false"
        >
          Close At-A-Glance
        </v-btn>
      </v-container>

      <!-- Create Mode Footer -->
      <v-container
        v-else
        class="d-flex justify-center border-top"
        style="border-color: rgba(128, 128, 128, 0.2) !important"
      >
        <v-btn class="mx-2" @click="characterStore.createCharacter = false" color="error">
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
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store/appStore'
import { CharacterInfo } from '../utils/dnd-typing'
import { mdiChevronLeft, mdiChevronRight, mdiDice5Outline } from '@mdi/js'

interface Image {
  src: string
}
const characterStore = useAppStore()
const model = ref(0)
const characterName = ref('')
const startingLevel = ref(1)
const levels = ref(Array.from({ length: 20 }, (_, i) => i + 1))
const pronouns = ref('Male')
const abilityGenerationOption = ref(
  localStorage.getItem('defaultGenerationOption') || 'Roll 4d6 - Discard Lowest'
)
const abilityGenerationOptions = ref([
  'Roll 3d6',
  'Roll 4d6 - Discard Lowest',
  'Standard Array (15, 14, 13, 12, 10, 8)',
  'Point Buy'
])
const averageHitPoints = ref(localStorage.getItem('defaultAverageHp') === 'true')
const feats = ref(localStorage.getItem('defaultFeats') !== 'false')
const multiclassing = ref(localStorage.getItem('defaultMulticlassing') !== 'false')
const activePanel = ref('details')
const router = useRouter()

// View Mode Panels
const viewActivePanels = ref(['skills', 'saves', 'conditions', 'additional_stats'])

const prevIndex = computed(() => (model.value - 1 + items.value.length) % items.value.length)
const nextIndex = computed(() => (model.value + 1) % items.value.length)

const selectPrev = () => {
  model.value = prevIndex.value
}
const selectNext = () => {
  model.value = nextIndex.value
}
const selectRandom = () => {
  if (!items.value || items.value.length <= 1) return
  let randomIndex = model.value
  while (randomIndex === model.value) {
    randomIndex = Math.floor(Math.random() * items.value.length)
  }
  model.value = randomIndex
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
    playerName: localStorage.getItem('defaultPlayerName') || '',
    experience: 0,
    deity: '',
    age: '',
    height: '',
    weight: '',
    eyes: '',
    skin: '',
    hair: '',
    additionalFeatures: '',
    armorClass: '',
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10,
    hp: 10,
    speed: 30,
    proficientSkills: [],
    proficientSavingThrows: [],
    asiChoices: {}
  }
  characterStore.setCharacter(data)
  handleRoute('/builder')
}

// At-A-Glance logic computations
const xpThresholds = [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000,
  195000, 225000, 265000, 305000, 355000
]

const xpInfo = computed(() => {
  const char = characterStore.character
  const level = char.level || 1
  const xp = char.experience || 0

  const minXp = xpThresholds[level - 1] ?? 0
  const maxXp = xpThresholds[level] ?? 355000

  let percentage = 0
  if (maxXp > minXp) {
    percentage = Math.max(0, Math.min(100, ((xp - minXp) / (maxXp - minXp)) * 100))
  } else {
    percentage = 100
  }

  return {
    minXp,
    maxXp,
    percentage
  }
})

const proficiencyBonus = computed(() => {
  const level = characterStore.character.level || 1
  return Math.floor((level - 1) / 4) + 2
})

const activeModifiers = computed(() => {
  const mods = {
    str: 0,
    dex: 0,
    con: 0,
    int: 0,
    wis: 0,
    cha: 0
  }

  const raceName = characterStore.character.race
  if (!raceName) return mods

  const raceNameLower = raceName.toLowerCase()
  const subraceName = characterStore.character.subrace

  // Find matching Race / Sub Race / Race Variant in loaded elements
  const allRaceElements = [
    ...(characterStore.elements.races || []),
    ...(characterStore.elements.subRaces || []),
    ...(characterStore.elements.raceVariants || [])
  ]

  const foundElements = allRaceElements.filter((el) => {
    if (el.type === 'Race' || el.type === 'Race Variant') {
      return el.name.toLowerCase() === raceNameLower
    }
    if (el.type === 'Sub Race' && subraceName) {
      return el.name.toLowerCase() === subraceName.toLowerCase()
    }
    return false
  })

  foundElements.forEach((el) => {
    if (el.rules) {
      el.rules.forEach((rule: any) => {
        if (rule.type === 'stat') {
          const statName = rule.name.toLowerCase()
          const val = parseInt(rule.value, 10) || 0

          if (
            rule.requirements &&
            rule.requirements.includes('CUSTOMIZED_ASI') &&
            !rule.requirements.startsWith('!')
          ) {
            return
          }

          if (statName === 'strength') mods.str += val
          else if (statName === 'dexterity') mods.dex += val
          else if (statName === 'constitution') mods.con += val
          else if (statName === 'intelligence') mods.int += val
          else if (statName === 'wisdom') mods.wis += val
          else if (statName === 'charisma') mods.cha += val
        }
      })
    }
  })

  return mods
})

const finalStats = computed(() => {
  const char = characterStore.character
  const mods = activeModifiers.value
  return {
    str: (char.str ?? 10) + mods.str,
    dex: (char.dex ?? 10) + mods.dex,
    con: (char.con ?? 10) + mods.con,
    int: (char.int ?? 10) + mods.int,
    wis: (char.wis ?? 10) + mods.wis,
    cha: (char.cha ?? 10) + mods.cha
  }
})

const initiativeStr = computed(() => {
  const dex = finalStats.value.dex
  const mod = Math.floor((dex - 10) / 2)
  return mod >= 0 ? `+${mod}` : `${mod}`
})

const armorClassValue = computed(() => {
  const dex = finalStats.value.dex
  const baseAc = 10 + Math.floor((dex - 10) / 2)

  const isWarforged = String(characterStore.character.race).toLowerCase() === 'warforged'
  const racialBonus = isWarforged ? 1 : 0

  return characterStore.character.armorClass && characterStore.character.armorClass.trim()
    ? characterStore.character.armorClass
    : String(baseAc + racialBonus)
})

const hpBreakdown = computed(() => {
  const con = finalStats.value.con
  const conMod = Math.floor((con - 10) / 2)
  const level = characterStore.character.level || 1
  const totalHp = characterStore.character.hp ?? 10

  const conHp = conMod * level
  const classHp = Math.max(0, totalHp - conHp)

  return {
    totalHp,
    conHp,
    classHp
  }
})

const passivePerception = computed(() => {
  const wis = finalStats.value.wis
  const wisMod = Math.floor((wis - 10) / 2)

  const isProficient = (characterStore.character.proficientSkills || []).includes('Perception')
  const finalMod = wisMod + (isProficient ? proficiencyBonus.value : 0)

  return 10 + finalMod
})

const conditionsStr = computed(() => {
  const race = String(characterStore.character.race).toLowerCase()
  if (race === 'warforged') {
    return 'Resistance (Poison)'
  }
  return 'None'
})

const abilitiesList = computed(() => {
  const stats = finalStats.value
  const getMod = (val: number) => {
    const m = Math.floor((val - 10) / 2)
    return m >= 0 ? `+${m}` : `${m}`
  }
  return [
    { label: 'str', value: stats.str, mod: getMod(stats.str) },
    { label: 'dex', value: stats.dex, mod: getMod(stats.dex) },
    { label: 'con', value: stats.con, mod: getMod(stats.con) },
    { label: 'int', value: stats.int, mod: getMod(stats.int) },
    { label: 'wis', value: stats.wis, mod: getMod(stats.wis) },
    { label: 'cha', value: stats.cha, mod: getMod(stats.cha) }
  ]
})

const skillAbilities: Record<string, string> = {
  Acrobatics: 'dex',
  'Animal Handling': 'wis',
  Arcana: 'int',
  Athletics: 'str',
  Deception: 'cha',
  History: 'int',
  Insight: 'wis',
  Intimidation: 'cha',
  Investigation: 'int',
  Medicine: 'wis',
  Nature: 'int',
  Perception: 'wis',
  Performance: 'cha',
  Persuasion: 'cha',
  Religion: 'int',
  'Sleight of Hand': 'dex',
  Stealth: 'dex',
  Survival: 'wis'
}

const skillsList = computed(() => {
  const stats = finalStats.value
  const char = characterStore.character
  return Object.keys(skillAbilities).map((skillName) => {
    const abilityKey = skillAbilities[skillName]
    const score = (stats as any)[abilityKey] ?? 10
    const baseMod = Math.floor((score - 10) / 2)

    const isProficient = (char.proficientSkills || []).includes(skillName)
    const finalMod = baseMod + (isProficient ? proficiencyBonus.value : 0)
    const modStr = finalMod >= 0 ? `+${finalMod}` : `${finalMod}`

    return {
      name: skillName,
      ability: abilityKey.toUpperCase(),
      modStr
    }
  })
})

const savingThrowsList = computed(() => {
  const stats = finalStats.value
  const char = characterStore.character
  const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha']
  const names: Record<string, string> = {
    str: 'Strength',
    dex: 'Dexterity',
    con: 'Constitution',
    int: 'Intelligence',
    wis: 'Wisdom',
    cha: 'Charisma'
  }

  return abilities.map((abilityKey) => {
    const score = (stats as any)[abilityKey] ?? 10
    const baseMod = Math.floor((score - 10) / 2)

    const isProficient = (char.proficientSavingThrows || []).includes(abilityKey)
    const finalMod = baseMod + (isProficient ? proficiencyBonus.value : 0)
    const modStr = finalMod >= 0 ? `+${finalMod}` : `${finalMod}`

    return {
      key: abilityKey,
      label: names[abilityKey],
      modStr
    }
  })
})

const saveCharacterAutomatically = async () => {
  if (localStorage.getItem('autoSave') === 'false') return
  if (!characterStore.character || !characterStore.character.filePath) return
  try {
    await characterStore.saveCharacter()
  } catch (e) {
    console.error('Failed to auto-save character:', e)
  }
}

onMounted(() => {
  window.mainApi.invoke('msgGetPortraits').then((portraits: string[]) => {
    if (portraits && portraits.length > 0) {
      items.value = portraits.map((src) => ({ src }))
    }
    model.value = 0
  })
})
</script>

<style scoped>
.name-title {
  color: #e5c158;
}
.stats-row {
  color: #e5c158;
  letter-spacing: 0.05em;
}
.white-text {
  color: #ffffff;
}
.profile-pic-container {
  border-radius: 50%;
  border: 4px solid #148f96;
  box-shadow: 0 0 20px rgba(150, 20, 20, 0.6);
  padding: 0;
  display: inline-block;
  overflow: hidden;
}
.additional-stats-table {
  color: #ffffff !important;
  width: 100%;
}
.additional-stats-table :deep(tr) {
  border-bottom: 1px solid rgba(128, 128, 128, 0.15) !important;
}
.additional-stats-table :deep(td) {
  border: none !important;
}
</style>
