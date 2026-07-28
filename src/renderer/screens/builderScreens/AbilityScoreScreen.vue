<template>
  <v-container class="py-4">
    <v-row class="justify-center">
      <v-col
        cols="2"
        v-for="stat in statList"
        :key="stat.key"
        class="d-flex align-center justify-center mb-4 px-1"
      >
        <div class="d-flex align-start justify-center w-100">
          <!-- Left side: Card and centered bonus text block -->
          <div class="d-flex flex-column align-center">
            <!-- D&D Style Stat Card -->
            <div class="stat-card">
              <!-- Stat Title -->
              <span class="stat-title">{{ stat.label }}</span>

              <!-- Total Score (Big Number) -->
              <span class="total-score-text">
                {{ (characterStore.character[stat.key] || 10) + activeModifiers[stat.key] }}
              </span>

              <!-- Modifier Badge (Oval overlapping bottom border) -->
              <div class="modifier-oval">
                {{
                  getModifierStr(
                    (characterStore.character[stat.key] || 10) + activeModifiers[stat.key]
                  )
                }}
              </div>
            </div>

            <!-- Racial Bonus Info Centered Below the Card -->
            <div
              v-if="activeModifiers[stat.key] !== 0"
              class="text-center mt-5"
              style="min-height: 38px"
            >
              <div class="text-caption text-success font-weight-bold">
                +{{ activeModifiers[stat.key] }} (Racial)
              </div>
              <div
                class="text-caption text-grey text-truncate"
                style="font-size: 0.72rem !important; line-height: 1.1; max-width: 95px"
                :title="characterStore.character.subrace || characterStore.character.race"
              >
                {{ characterStore.character.subrace || characterStore.character.race }}
              </div>
            </div>
            <div v-else class="mt-5" style="min-height: 38px"></div>
          </div>

          <!-- Right side: Base Score Controls (Up/Down Chevrons and value) -->
          <div class="base-controls-panel d-flex flex-column align-center justify-center ml-2 mt-4">
            <v-btn
              icon
              variant="text"
              density="compact"
              class="chevron-btn"
              :disabled="(characterStore.character[stat.key] ?? 10) >= 20"
              @click="incrementStat(stat.key)"
            >
              <v-icon :icon="mdiChevronUp" size="18" />
            </v-btn>

            <span class="base-score-text">
              {{ characterStore.character[stat.key] ?? 10 }}
            </span>

            <v-btn
              icon
              variant="text"
              density="compact"
              class="chevron-btn"
              :disabled="(characterStore.character[stat.key] ?? 10) <= 3"
              @click="decrementStat(stat.key)"
            >
              <v-icon :icon="mdiChevronDown" size="18" />
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="tsx">
import { useAppStore } from '@/renderer/store/appStore'
import { computed } from 'vue'
import { mdiChevronUp, mdiChevronDown } from '@mdi/js'

const characterStore = useAppStore()

const statList = [
  { key: 'str', label: 'Strength' },
  { key: 'dex', label: 'Dexterity' },
  { key: 'con', label: 'Constitution' },
  { key: 'int', label: 'Intelligence' },
  { key: 'wis', label: 'Wisdom' },
  { key: 'cha', label: 'Charisma' }
] as const

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
  const selectedRaceSource = characterStore.character.raceSource
  const selectedSubraceSource = characterStore.character.subraceSource

  // Find matching Race / Sub Race / Race Variant in loaded elements
  const allRaceElements = [
    ...(characterStore.elements.races || []),
    ...(characterStore.elements.subRaces || []),
    ...(characterStore.elements.raceVariants || [])
  ]

  const foundElements = allRaceElements.filter((el) => {
    if (el.type === 'Race' || el.type === 'Race Variant') {
      const isMatchName = el.name.toLowerCase() === raceNameLower
      const isMatchSource = !selectedRaceSource || (el.source && el.source.toLowerCase() === selectedRaceSource.toLowerCase())
      return isMatchName && isMatchSource
    }
    if (el.type === 'Sub Race' && subraceName) {
      const isMatchName = el.name.toLowerCase() === subraceName.toLowerCase()
      const isMatchSource = !selectedSubraceSource || (el.source && el.source.toLowerCase() === selectedSubraceSource.toLowerCase())
      return isMatchName && isMatchSource
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

const getModifierStr = (score?: number) => {
  const s = score ?? 10
  const mod = Math.floor((s - 10) / 2)
  return mod >= 0 ? `+${mod}` : `${mod}`
}

const incrementStat = (key: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha') => {
  if (characterStore.character[key] === undefined) {
    characterStore.character[key] = 10
  }
  const val = characterStore.character[key]!
  if (val < 20) {
    characterStore.character[key] = val + 1
  }
}

const decrementStat = (key: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha') => {
  if (characterStore.character[key] === undefined) {
    characterStore.character[key] = 10
  }
  const val = characterStore.character[key]!
  if (val > 3) {
    characterStore.character[key] = val - 1
  }
}
</script>

<style scoped>
.stat-card {
  width: 95px;
  height: 105px;
  border: 2px solid rgba(255, 255, 255, 0.85);
  border-radius: 8px;
  background: rgba(30, 30, 38, 0.65);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
}

.stat-title {
  position: absolute;
  top: 6px;
  font-size: 0.62rem;
  font-weight: bold;
  letter-spacing: 0.05em;
  color: rgb(var(--v-theme-header));
  text-transform: uppercase;
}

.total-score-text {
  font-size: 2.2rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
  margin-top: 8px;
}

.modifier-oval {
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: #1e1e24;
  border: 2px solid rgba(255, 255, 255, 0.85) !important;
  border-radius: 999px;
  padding: 1px 12px;
  font-size: 0.85rem;
  font-weight: bold;
  color: rgb(var(--v-theme-subheader));
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
  min-width: 50px;
  text-align: center;
  white-space: nowrap;
}

.base-controls-panel {
  user-select: none;
}

.base-score-text {
  font-size: 0.85rem;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.5);
  margin: 1px 0;
}

.chevron-btn {
  opacity: 0.6;
  transition: opacity 0.2s;
  width: 24px;
  height: 24px;
}

.chevron-btn:hover {
  opacity: 1;
}
</style>
