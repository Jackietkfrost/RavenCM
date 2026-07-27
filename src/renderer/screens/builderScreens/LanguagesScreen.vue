<template>
  <v-container fluid class="pa-4">
    <!-- Header section -->
    <v-row class="mb-4 align-center">
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="searchQuery"
          variant="outlined"
          density="compact"
          :placeholder="t('Search')"
          :prepend-inner-icon="mdiMagnify"
          clearable
          hide-details
        ></v-text-field>
      </v-col>
      <v-col class="d-flex justify-end" cols="12" sm="6">
        <v-btn icon variant="text">
          <v-icon :icon="mdiFilterMenuOutline" />
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <!-- Left column: Language selection slots list -->
      <v-col style="flex: 0 0 70%; max-width: 70%">
        <div
          v-if="languageSelectionSlots.length === 0"
          class="d-flex flex-column align-center justify-center py-12 text-grey"
        >
          <div class="text-subtitle-1">No language choices granted by your current selections.</div>
        </div>
        <v-card
          v-for="(slot, index) in languageSelectionSlots"
          :key="slot.key"
          variant="outlined"
          class="mb-4"
          style="border-color: rgba(128, 128, 128, 0.2)"
        >
          <v-card-title class="py-3">
            <v-row no-gutters class="align-center">
              <v-col class="cursor-pointer" cols="6" @click="() => toggleSlot(index)">
                {{ slot.name }}
              </v-col>
              <v-col class="text--secondary" cols="5">
                <v-text-field
                  readonly
                  class="languages-box cursor-pointer"
                  :model-value="selectedLanguages[index] || ''"
                  variant="plain"
                  density="compact"
                  clearable
                  single-line
                  persistent-clear
                  hide-details
                  :dirty="!!selectedLanguages[index]"
                  @click.stop="() => toggleSlot(index)"
                  @click:clear="() => onClearSlot(index)"
                ></v-text-field>
              </v-col>
              <v-col
                class="d-flex justify-end cursor-pointer"
                cols="1"
                @click="() => toggleSlot(index)"
              >
                <v-icon
                  :icon="expandedSlotIndex === index ? mdiChevronUp : mdiChevronDown"
                  class="ml-auto"
                />
              </v-col>
            </v-row>
          </v-card-title>
          <v-data-table-virtual
            v-if="expandedSlotIndex === index"
            :headers="headers"
            :items="getFilteredItemsForSlot(slot)"
            :item-value="(item) => item.id"
            hover
            fixed-header
            height="300px"
            @dblclick:row="(event, row) => handleSlotDoubleClick(index, row.item)"
            @click:row="(event, row) => handleSlotClick(index, row.item)"
            :row-props="(data) => getRowPropsForSlot(index, data)"
          >
          </v-data-table-virtual>
        </v-card>
      </v-col>

      <!-- Right column: Language details pane -->
      <v-col style="flex: 0 0 30%; max-width: 30%">
        <v-card
          variant="outlined"
          class="d-flex flex-column"
          style="border-color: rgba(128, 128, 128, 0.2); height: calc(100vh - 220px)"
        >
          <template v-if="selectedLanguage">
            <!-- Header section of details pane -->
            <div
              class="d-flex justify-space-between align-center px-4 py-3 border-bottom"
              style="
                background-color: rgba(var(--v-theme-surface-variant), 0.05);
                border-bottom: 1px solid rgba(128, 128, 128, 0.2);
              "
            >
              <div class="text-h5 font-weight-bold text-uppercase" style="letter-spacing: 0.05em">
                {{ selectedLanguage.name }}
              </div>
              <div class="text-caption text-grey">
                {{ selectedLanguage.source }}
              </div>
            </div>

            <!-- Scrollable content area -->
            <div class="flex-grow-1 overflow-y-auto px-4 py-4 description-content">
              <div v-html="selectedLanguage.htmlDescription"></div>
            </div>
          </template>
          <template v-else>
            <div class="d-flex flex-column align-center justify-center fill-height text-grey py-12">
              <div class="text-subtitle-1">Select a language to view details</div>
            </div>
          </template>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="tsx">
import { useAppStore } from '@/renderer/store/appStore'
import { mdiChevronDown, mdiChevronUp, mdiFilterMenuOutline, mdiMagnify } from '@mdi/js'
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const characterStore = useAppStore()
const languages = characterStore.elements.languages
const headers = ref([
  { title: 'Language', key: 'name', align: 'start' as const },
  { title: 'Source', key: 'source', align: 'end' as const }
])
const searchQuery = ref('')
const selectedLanguage = ref<any>(null)
const expandedSlotIndex = ref<number | null>(0)

// Calculate dynamic language choice slots based on active character build rules
const languageSelectionSlots = computed(() => {
  const activeRules: any[] = []
  const activeIds = new Set<string>()

  // 1. Race rules & ID
  if (characterStore.character.race) {
    const raceEl = characterStore.elements.races.find(
      (r: any) => r.name === characterStore.character.race
    )
    if (raceEl) {
      activeIds.add(raceEl.id)
      if (raceEl.rules) activeRules.push(...raceEl.rules)
    }
  }

  // 2. Subrace rules & ID
  if (characterStore.character.subrace) {
    const subraceEl = (characterStore.elements.subRaces || []).find(
      (s: any) => s.name === characterStore.character.subrace
    )
    if (subraceEl) {
      activeIds.add(subraceEl.id)
      if (subraceEl.rules) activeRules.push(...subraceEl.rules)
    }
  }

  // 3. Class rules & ID
  if (characterStore.character.class) {
    const classEl = characterStore.elements.classes.find(
      (c: any) => c.name === characterStore.character.class
    )
    if (classEl) {
      activeIds.add(classEl.id)
      if (classEl.rules) activeRules.push(...classEl.rules)
    }
  }

  // 4. Subclass/Archetype rules & ID
  if (characterStore.character.archetype) {
    const archetypeEl = characterStore.elements.archetypes.find(
      (a: any) => a.name === characterStore.character.archetype
    )
    if (archetypeEl) {
      activeIds.add(archetypeEl.id)
      if (archetypeEl.rules) activeRules.push(...archetypeEl.rules)
    }
  }

  // 5. Background rules & ID
  if (characterStore.character.background && characterStore.character.background.name) {
    const backgroundEl = characterStore.elements.backgrounds.find(
      (b: any) => b.name === characterStore.character.background.name
    )
    if (backgroundEl) {
      activeIds.add(backgroundEl.id)
      if (backgroundEl.rules) activeRules.push(...backgroundEl.rules)
    }
  }

  // 6. Feats rules & ID
  if (characterStore.character.feat) {
    const featEl = characterStore.elements.feats.find(
      (f: any) => f.name === characterStore.character.feat
    )
    if (featEl) {
      activeIds.add(featEl.id)
      if (featEl.rules) activeRules.push(...featEl.rules)
    }
  }

  // Evaluator for requirement strings
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

  // Filter for active select rules of type Language
  const languageRules = activeRules.filter(
    (rule: any) => rule.type === 'select' && rule.selectType === 'Language' && isRuleActive(rule)
  )

  // Expand each rule into individual slots based on rule.number
  const slots: { name: string; supports: string; key: string }[] = []
  languageRules.forEach((rule, ruleIdx) => {
    const num = parseInt(rule.number, 10) || 1
    for (let i = 0; i < num; i++) {
      slots.push({
        name: rule.name || 'Language',
        supports: rule.supports || '',
        key: `${rule.name || 'language'}-${ruleIdx}-${i}`
      })
    }
  })

  return slots
})

// Read/write wrapper around the store's character languages array
const selectedLanguages = computed({
  get() {
    const langs = characterStore.character.languages
    return Array.isArray(langs) ? langs : []
  },
  set(newVal) {
    characterStore.character.languages = newVal
  }
})

const toggleSlot = (index: number) => {
  expandedSlotIndex.value = expandedSlotIndex.value === index ? null : index
}

// Compute names of languages already granted by race or subrace rules
const raceLanguages = computed(() => {
  const currentRaceName = characterStore.character.race
  if (!currentRaceName) return []

  const raceEl = characterStore.elements.races.find((r: any) => r.name === currentRaceName)
  if (!raceEl || !raceEl.rules) return []

  const grantedIds = new Set<string>()
  raceEl.rules.forEach((rule: any) => {
    if (rule.type === 'grant' && rule.grantType === 'Language') {
      grantedIds.add(rule.id.toUpperCase())
    }
  })

  const currentSubrace = characterStore.character.subrace
  if (currentSubrace) {
    const subraceEl = (characterStore.elements.subRaces || []).find(
      (s: any) => s.name === currentSubrace
    )
    if (subraceEl && subraceEl.rules) {
      subraceEl.rules.forEach((rule: any) => {
        if (rule.type === 'grant' && rule.grantType === 'Language') {
          grantedIds.add(rule.id.toUpperCase())
        }
      })
    }
  }

  const names: string[] = []
  grantedIds.forEach((id) => {
    const lang = (characterStore.elements.languages || []).find(
      (l: any) => l.id.toUpperCase() === id
    )
    if (lang) {
      names.push(lang.name.toLowerCase())
    }
  })

  return names
})

const getFilteredItemsForSlot = (slot: any) => {
  const activeOnly = (languages || []).filter((item: any) =>
    characterStore.isSourceActive(item.source)
  )

  // Filter by supports tags (e.g. Standard||Exotic)
  let list = activeOnly
  if (slot.supports) {
    const allowed = slot.supports.split('||').map((s: string) => s.trim().toLowerCase())
    list = activeOnly.filter((item: any) => {
      if (!item.supports) return false
      const itemSupports = item.supports.split(',').map((s: string) => s.trim().toLowerCase())
      return itemSupports.some((sup: string) => allowed.includes(sup))
    })
  }

  // Filter out languages already spoken/granted by race or subrace
  const spoken = raceLanguages.value
  list = list.filter((item: any) => !spoken.includes(item.name.toLowerCase()))

  // Filter by search query
  if (!searchQuery.value) return list
  const query = searchQuery.value.toLowerCase()
  return list.filter(
    (item: any) =>
      item.name.toLowerCase().includes(query) ||
      (item.source && item.source.toLowerCase().includes(query))
  )
}

const handleSlotDoubleClick = (index: number, item: any) => {
  const current = [...selectedLanguages.value]
  while (current.length <= index) {
    current.push('')
  }
  current[index] = item.name
  selectedLanguages.value = current
  expandedSlotIndex.value = null
}

const handleSlotClick = (index: number, item: any) => {
  selectedLanguage.value = item
}

const getRowPropsForSlot = (index: number, data: any) => {
  const isSelected = selectedLanguage.value && selectedLanguage.value.id === data.item.id
  return {
    class: isSelected ? 'v-theme--selected' : ''
  }
}

const onClearSlot = (index: number) => {
  const current = [...selectedLanguages.value]
  if (current.length > index) {
    current[index] = ''
  }
  selectedLanguages.value = current
  setTimeout(() => {
    expandedSlotIndex.value = index
  }, 50)
}

onMounted(() => {
  const allLangs = (languages || []).filter((item: any) =>
    characterStore.isSourceActive(item.source)
  )
  if (allLangs && allLangs.length > 0) {
    selectedLanguage.value = allLangs[0]
  }
})
</script>

<style scoped>
.languages-box {
  cursor: pointer;
}

:deep(.v-data-table__tr) {
  cursor: pointer;
}

:deep(.v-theme--selected) {
  background-color: rgba(var(--v-theme-primary), 0.15) !important;
  color: rgb(var(--v-theme-primary)) !important;
}

.description-content :deep(h3) {
  font-size: 1.3rem;
  font-weight: bold;
  margin-top: 16px;
  margin-bottom: 8px;
  color: rgb(var(--v-theme-primary));
  text-transform: uppercase;
}

.description-content :deep(h4) {
  font-size: 1.1rem;
  font-weight: bold;
  margin-top: 14px;
  margin-bottom: 6px;
  color: rgb(var(--v-theme-primary));
  text-transform: uppercase;
}

.description-content :deep(h5) {
  font-size: 0.95rem;
  font-weight: bold;
  margin-top: 12px;
  margin-bottom: 4px;
  color: rgb(var(--v-theme-secondary));
}

.description-content :deep(p) {
  margin-bottom: 12px;
  font-size: 0.9rem;
  line-height: 1.5;
}

.description-content :deep(.flavor) {
  font-style: italic;
  color: #c5a880;
}

.description-content :deep(.indent) {
  text-indent: 15px;
}

.description-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  font-size: 0.85rem;
}

.description-content :deep(th),
.description-content :deep(td) {
  border: 1px solid rgba(128, 128, 128, 0.2);
  padding: 6px 8px;
  text-align: center;
}

.description-content :deep(th) {
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
  font-weight: bold;
}

.description-content :deep(ul) {
  margin-bottom: 12px;
  padding-left: 20px;
}

.description-content :deep(li) {
  margin-bottom: 4px;
  font-size: 0.9rem;
}
</style>
