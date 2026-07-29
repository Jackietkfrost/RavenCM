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
                {{ (characterStore.character[stat.key] || 10) + activeModifiers[stat.key].value }}
              </span>

              <!-- Modifier Badge (Oval overlapping bottom border) -->
              <div class="modifier-oval">
                {{
                  getModifierStr(
                    (characterStore.character[stat.key] || 10) + activeModifiers[stat.key].value
                  )
                }}
              </div>
            </div>

            <!-- If custom ASI is active: show shuffle icon and optional text -->
            <template v-if="asiSelectRules.length > 0">
              <div class="d-flex flex-column align-center mt-5" style="min-height: 48px">
                <v-icon :icon="mdiShuffle" size="18" class="text-grey-darken-1 mb-1" />
                <span
                  v-if="customAsiBonusForStat(stat.key)"
                  class="text-caption text-grey text-center font-weight-medium"
                  style="font-size: 0.68rem !important; line-height: 1.1"
                >
                  {{ customAsiBonusForStat(stat.key) }}
                </span>
              </div>
            </template>
            <!-- If custom ASI is NOT active: show standard racial bonus info -->
            <template v-else>
              <div
                v-if="activeModifiers[stat.key].value !== 0"
                class="text-center mt-5"
                style="min-height: 48px; max-width: 105px"
              >
                <div
                  v-for="(src, idx) in activeModifiers[stat.key].sources"
                  :key="idx"
                  class="mb-1 text-center"
                  style="line-height: 1.1"
                >
                  <div
                    class="text-caption text-success font-weight-bold"
                    style="font-size: 0.72rem !important"
                  >
                    +{{ src.value }} ({{ src.name }})
                  </div>
                  <div
                    class="text-caption text-grey text-truncate px-1"
                    style="font-size: 0.65rem !important"
                    :title="src.source"
                  >
                    ({{ src.source }})
                  </div>
                </div>
              </div>
              <div v-else class="mt-5" style="min-height: 48px"></div>
            </template>
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

    <!-- ASI Selectors Section -->
    <v-divider class="my-6" v-if="asiSelectRules.length > 0" />
    <v-row class="justify-center mt-2" v-if="asiSelectRules.length > 0">
      <v-col cols="12" md="8" lg="6">
        <div v-for="rule in asiSelectRules" :key="rule.name" class="mb-5">
          <div class="d-flex align-center mb-1">
            <span class="text-subtitle-2 font-weight-bold text-uppercase text-grey">
              {{ rule.name }}
            </span>
            <v-icon
              v-if="characterStore.character.asiChoices?.[rule.name]"
              :icon="mdiCheck"
              color="success"
              size="16"
              class="ml-2"
            />
          </div>
          <v-select
            v-model="characterStore.character.asiChoices[rule.name]"
            :items="getOptionsForRule(rule)"
            item-title="name"
            item-value="id"
            density="compact"
            variant="outlined"
            placeholder="Select Option..."
            clearable
            hide-details
          ></v-select>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="tsx">
import { useAppStore } from '@/renderer/store/appStore'
import { computed, watch, onMounted } from 'vue'
import { mdiChevronUp, mdiChevronDown, mdiCheck, mdiShuffle } from '@mdi/js'

const characterStore = useAppStore()

const getActiveASIRules = () => {
  const activeIds = new Set<string>()
  const activeRules: any[] = []

  const character = characterStore.character
  if (character.race) {
    const el = characterStore.elements.races?.find((r: any) => r.name === character.race)
    if (el) {
      activeIds.add(el.id)
      if (el.rules) activeRules.push(...el.rules)
    }
  }
  if (character.subrace) {
    const el = characterStore.elements.subRaces?.find((s: any) => s.name === character.subrace)
    if (el) {
      activeIds.add(el.id)
      if (el.rules) activeRules.push(...el.rules)
    }
  }

  // Include chosen ASI selections in activeIds so their rules/requirements are evaluated reactively
  if (character.asiChoices) {
    Object.values(character.asiChoices).forEach((choiceVal: string) => {
      const foundEl = characterStore.elements.abilityScoreImprovements?.find(
        (el: any) => el.id === choiceVal || el.name === choiceVal
      )
      if (foundEl) {
        activeIds.add(foundEl.id)
        if (foundEl.rules) activeRules.push(...foundEl.rules)
      }
    })
  }

  const isRuleActive = (rule: any) => {
    if (!rule.requirements) return true
    const reqs = rule.requirements.split(',').map((r: string) => r.trim())
    return reqs.every((req: string) => {
      if (req.startsWith('!')) {
        return !activeIds.has(req.slice(1))
      } else {
        return activeIds.has(req)
      }
    })
  }

  return activeRules.filter(
    (rule: any) =>
      rule.type === 'select' &&
      rule.selectType === 'Ability Score Improvement' &&
      isRuleActive(rule)
  )
}

const asiSelectRules = computed(() => {
  return getActiveASIRules()
})

watch(
  asiSelectRules,
  (newRules) => {
    if (characterStore.character.asiChoices) {
      const activeNames = new Set(newRules.map((r: any) => r.name))
      Object.keys(characterStore.character.asiChoices).forEach((key) => {
        if (!activeNames.has(key)) {
          delete characterStore.character.asiChoices[key]
        }
      })
    }
  },
  { deep: true }
)

const getOptionsForRule = (rule: any) => {
  const list = characterStore.elements.abilityScoreImprovements || []
  if (!rule.supports) return list

  const allowed = rule.supports.split(/\|\||,/).map((s: string) => s.trim().toLowerCase())
  return list.filter((item: any) => {
    if (!item.supports) return false
    const itemSupports = item.supports.split(/\|\||,/).map((s: string) => s.trim().toLowerCase())
    return itemSupports.some((sup: string) => allowed.includes(sup))
  })
}

onMounted(() => {
  characterStore.fetchElementsIfNeeded()
  if (!characterStore.character.asiChoices) {
    characterStore.character.asiChoices = {}
  }
})

const customAsiBonusForStat = (statKey: string) => {
  const selectedAsiIds = Object.values(characterStore.character.asiChoices || {})
  const chosenAsiElements = (characterStore.elements.abilityScoreImprovements || []).filter(
    (el: any) => selectedAsiIds.includes(el.id) || selectedAsiIds.includes(el.name)
  )

  let totalVal = 0
  const statNameMap = {
    str: 'strength',
    dex: 'dexterity',
    con: 'constitution',
    int: 'intelligence',
    wis: 'wisdom',
    cha: 'charisma'
  }
  const fullStatName = statNameMap[statKey as keyof typeof statNameMap]

  chosenAsiElements.forEach((el) => {
    if (el.rules) {
      el.rules.forEach((rule: any) => {
        if (rule.type === 'stat' && rule.name.toLowerCase() === fullStatName) {
          totalVal += parseInt(rule.value, 10) || 0
        }
      })
    }
  })

  if (totalVal > 0) {
    return `Ability Score Increase (${totalVal})`
  }
  return ''
}

const statList = [
  { key: 'str', label: 'Strength' },
  { key: 'dex', label: 'Dexterity' },
  { key: 'con', label: 'Constitution' },
  { key: 'int', label: 'Intelligence' },
  { key: 'wis', label: 'Wisdom' },
  { key: 'cha', label: 'Charisma' }
] as const

const activeModifiers = computed(() => {
  const stats = {
    str: { value: 0, sources: [] as { name: string; source: string; value: number }[] },
    dex: { value: 0, sources: [] as { name: string; source: string; value: number }[] },
    con: { value: 0, sources: [] as { name: string; source: string; value: number }[] },
    int: { value: 0, sources: [] as { name: string; source: string; value: number }[] },
    wis: { value: 0, sources: [] as { name: string; source: string; value: number }[] },
    cha: { value: 0, sources: [] as { name: string; source: string; value: number }[] }
  }

  const raceName = characterStore.character.race
  if (!raceName) return stats

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

  const matchingRaces = allRaceElements.filter((el) => {
    if (el.type === 'Race' || el.type === 'Race Variant') {
      const isMatchName = el.name.toLowerCase() === raceNameLower
      const isMatchSource =
        selectedRaceSource &&
        el.source &&
        el.source.toLowerCase() === selectedRaceSource.toLowerCase()
      return isMatchName && (selectedRaceSource ? isMatchSource : true)
    }
    return false
  })

  const matchingSubraces = subraceName
    ? allRaceElements.filter((el) => {
        if (el.type === 'Sub Race') {
          const isMatchName = el.name.toLowerCase() === subraceName.toLowerCase()
          const isMatchSource =
            selectedSubraceSource &&
            el.source &&
            el.source.toLowerCase() === selectedSubraceSource.toLowerCase()
          return isMatchName && (selectedSubraceSource ? isMatchSource : true)
        }
        return false
      })
    : []

  const foundElements: any[] = []
  if (matchingRaces.length > 0) {
    if (selectedRaceSource) {
      foundElements.push(...matchingRaces)
    } else {
      foundElements.push(matchingRaces[0])
    }
  }
  if (matchingSubraces.length > 0) {
    if (selectedSubraceSource) {
      foundElements.push(...matchingSubraces)
    } else {
      foundElements.push(matchingSubraces[0])
    }
  }

  // Apply stats for the chosen ASI elements
  const selectedAsiIds = Object.values(characterStore.character.asiChoices || {})
  const chosenAsiElements = (characterStore.elements.abilityScoreImprovements || []).filter(
    (el: any) => selectedAsiIds.includes(el.id) || selectedAsiIds.includes(el.name)
  )

  const elementsToProcess = [...foundElements, ...chosenAsiElements]

  elementsToProcess.forEach((el) => {
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

          let targetKey: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha' | null = null
          if (statName === 'strength') targetKey = 'str'
          else if (statName === 'dexterity') targetKey = 'dex'
          else if (statName === 'constitution') targetKey = 'con'
          else if (statName === 'intelligence') targetKey = 'int'
          else if (statName === 'wisdom') targetKey = 'wis'
          else if (statName === 'charisma') targetKey = 'cha'

          if (targetKey && val !== 0) {
            stats[targetKey].value += val
            stats[targetKey].sources.push({
              name: el.name,
              source: el.source || '',
              value: val
            })
          }
        }
      })
    }
  })

  return stats
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
