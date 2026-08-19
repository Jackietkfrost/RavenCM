<template>
  <v-container fluid class="pa-4">
    <v-row no-gutters class="mb-4">
      <v-col cols="12" sm="6">
        <v-text-field
          :prepend-inner-icon="mdiMagnify"
          variant="outlined"
          density="compact"
          label="Search"
          v-model="searchQuery"
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
      <!-- Left column: Accordions -->
      <v-col
        style="flex: 0 0 70%; max-width: 70%; max-height: calc(100vh - 220px)"
        class="overflow-y-auto"
      >
        <!-- Race Accordion Card -->
        <v-card key="race-card" variant="outlined" style="border-color: rgba(128, 128, 128, 0.2)">
          <v-card-title class="py-3">
            <v-row no-gutters class="align-center">
              <v-col class="cursor-pointer" cols="6" @click="() => (isExpanded = !isExpanded)">
                {{ t('BuildScreen.race') }}
              </v-col>
              <v-col class="text--secondary" cols="5">
                <v-text-field
                  readonly
                  class="race-box cursor-pointer"
                  v-model="textFieldValue"
                  variant="plain"
                  density="compact"
                  clearable
                  single-line
                  persistent-clear
                  hide-details
                  :dirty="!!characterStore.character.race"
                  @click.stop="() => (isExpanded = !isExpanded)"
                  @click:clear="onClear"
                ></v-text-field>
              </v-col>
              <v-col
                class="d-flex justify-end cursor-pointer"
                cols="1"
                @click="() => (isExpanded = !isExpanded)"
              >
                <v-icon :icon="isExpanded ? mdiChevronUp : mdiChevronDown" class="ml-auto" />
              </v-col>
            </v-row>
          </v-card-title>

          <v-data-table-virtual
            v-if="isExpanded"
            key="race-table"
            :headers="headers"
            :items="filteredItems"
            :item-value="(item) => item.id"
            hover
            fixed-header
            height="350px"
            @dblclick:row="handleDoubleClick"
            @click:row="handleRowClick"
            :row-props="rowProps"
          >
            <!-- eslint-disable-next-line vue/valid-v-slot -->
            <template #item.name="{ item }">
              <div class="d-flex align-center">
                {{ item.name }}
                <v-icon
                  v-if="
                    characterStore.character.race === item.name &&
                    characterStore.character.raceSource === item.source
                  "
                  :icon="mdiCheck"
                  color="success"
                  class="ml-2"
                  size="small"
                />
              </div>
            </template>
          </v-data-table-virtual>
        </v-card>

        <!-- Dynamic Sub-Selection Accordion Cards (Sub-Races, Variants, etc.) -->
        <v-card
          v-for="slot in raceSelectionSlots"
          :key="slot.key"
          variant="outlined"
          class="mt-4"
          style="border-color: rgba(128, 128, 128, 0.2)"
        >
          <v-card-title class="py-3">
            <v-row no-gutters class="align-center">
              <v-col class="cursor-pointer" cols="6" @click="() => toggleSlot(slot.key)">
                {{ slot.name }}
              </v-col>
              <v-col class="text--secondary" cols="5">
                <v-text-field
                  readonly
                  class="race-box cursor-pointer"
                  :model-value="getSlotValue(slot)"
                  variant="plain"
                  density="compact"
                  clearable
                  single-line
                  persistent-clear
                  hide-details
                  :dirty="!!getSlotValue(slot)"
                  @click.stop="() => toggleSlot(slot.key)"
                  @click:clear="() => onClearSlot(slot)"
                ></v-text-field>
              </v-col>
              <v-col
                class="d-flex justify-end cursor-pointer"
                cols="1"
                @click="() => toggleSlot(slot.key)"
              >
                <v-icon
                  :icon="isSlotExpanded(slot.key) ? mdiChevronUp : mdiChevronDown"
                  class="ml-auto"
                />
              </v-col>
            </v-row>
          </v-card-title>
          <v-data-table-virtual
            v-if="isSlotExpanded(slot.key)"
            :headers="subraceHeaders"
            :items="getFilteredItemsForSlot(slot)"
            :item-value="(item) => item.id"
            hover
            fixed-header
            height="250px"
            @dblclick:row="(event, row) => handleSlotDoubleClick(slot, row.item)"
            @click:row="(event, row) => handleSlotClick(slot, row.item)"
            :row-props="(data) => getRowPropsForSlot(slot, data)"
          >
            <!-- eslint-disable-next-line vue/valid-v-slot -->
            <template #item.name="{ item }">
              <div class="d-flex align-center">
                {{ item.name }}
                <v-icon
                  v-if="isSlotItemSelected(slot, item)"
                  :icon="mdiCheck"
                  color="success"
                  class="ml-2"
                  size="small"
                />
              </div>
            </template>
          </v-data-table-virtual>
        </v-card>
      </v-col>

      <!-- Right column: Details pane -->
      <v-col style="flex: 0 0 30%; max-width: 30%">
        <v-card
          variant="outlined"
          class="d-flex flex-column"
          style="border-color: rgba(128, 128, 128, 0.2); height: calc(100vh - 220px)"
        >
          <template v-if="selectedRace">
            <!-- Header section of details pane -->
            <div
              class="d-flex justify-space-between align-center px-4 py-3 border-bottom"
              style="
                background-color: rgba(var(--v-theme-surface-variant), 0.05);
                border-bottom: 1px solid rgba(128, 128, 128, 0.2);
              "
            >
              <div class="text-h5 font-weight-bold text-uppercase" style="letter-spacing: 0.05em">
                {{ selectedRace.name }}
              </div>
              <div class="text-caption text-grey">
                {{ selectedRace.source }}
              </div>
            </div>

            <!-- Scrollable content area -->
            <div class="flex-grow-1 overflow-y-auto px-4 py-4 description-content">
              <div v-html="selectedRace.htmlDescription"></div>
            </div>
          </template>
          <template v-else>
            <div class="d-flex flex-column align-center justify-center fill-height text-grey py-12">
              <div class="text-subtitle-1">Select an item to view details</div>
            </div>
          </template>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="tsx">
import { useAppStore } from '@/renderer/store/appStore'
import Constants from '@/renderer/utils/Constants'
import { mdiChevronDown, mdiChevronUp, mdiFilterMenuOutline, mdiMagnify, mdiCheck } from '@mdi/js'
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const characterStore = useAppStore()

// Main Race states
const isExpanded = ref(true)
const textFieldValue = ref(characterStore.character.race ? characterStore.character.race : '')
const races = characterStore.elements.races
const headers = ref([
  { title: 'Name', key: 'name', align: 'start' as const },
  { title: 'Source', key: 'source', align: 'end' as const }
])
const subraceHeaders = ref([
  { title: 'Name', key: 'name', align: 'start' as const },
  { title: 'Source', key: 'source', align: 'end' as const }
])
const items = ref(races)
const searchQuery = ref('')
const selectedRace = ref<any>(null)
const expandedSlots = ref<Record<string, boolean>>({})

const isSlotExpanded = (key: string) => {
  return expandedSlots.value[key] !== false
}

const toggleSlot = (key: string) => {
  expandedSlots.value[key] = !isSlotExpanded(key)
}

// Get the plural store key for dynamic element collections
const getPluralStoreKey = (selectType: string) => {
  const elementType = Object.keys(Constants.ELEMENTS_PLURAL).find(
    (key) => key.replace(/\s+/g, '').toLowerCase() === selectType.replace(/\s+/g, '').toLowerCase()
  )
  if (elementType) {
    const pluralName =
      Constants.ELEMENTS_PLURAL[elementType as keyof typeof Constants.ELEMENTS_PLURAL]
    return (
      pluralName.split(' ')[0].toLowerCase() +
      pluralName
        .split(' ')
        .slice(1)
        .map((p: string) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
        .join('')
    )
  }
  return null
}

const findElementById = (id: string) => {
  for (const array of Object.values(characterStore.elements)) {
    if (Array.isArray(array)) {
      const found = array.find((el: any) => el.id === id)
      if (found) return found
    }
  }
  return null
}

const getActiveSelectRules = () => {
  const activeIds = new Set<string>()
  const gatheredRules: any[] = []

  const character = characterStore.character

  // Helper to add element and its rules
  const registerElement = (el: any) => {
    if (!el || activeIds.has(el.id)) return
    activeIds.add(el.id)
    if (el.rules) {
      gatheredRules.push(...el.rules)
    }
  }

  // 1. Register main selections
  if (character.race) {
    const el = characterStore.elements.races?.find(
      (r: any) =>
        r.name === character.race &&
        (!character.raceSource || r.source === character.raceSource)
    )
    registerElement(el)
  }
  if (character.subrace) {
    const el = characterStore.elements.subRaces?.find(
      (s: any) =>
        s.name === character.subrace &&
        (!character.subraceSource || s.source === character.subraceSource)
    )
    registerElement(el)
  }
  if (character.background?.name) {
    const el = characterStore.elements.backgrounds?.find(
      (b: any) => b.name === character.background.name
    )
    registerElement(el)
  }
  if (character.backgroundVariant) {
    const el = characterStore.elements.backgroundVariants?.find(
      (v: any) => v.name === character.backgroundVariant
    )
    registerElement(el)
  }
  if (character.backgroundFeature) {
    const el = characterStore.elements.backgroundFeatures?.find(
      (f: any) => f.name === character.backgroundFeature
    )
    registerElement(el)
  }
  if (character.class) {
    const el = characterStore.elements.classes?.find((c: any) => c.name === character.class)
    registerElement(el)
  }
  if (character.archetype) {
    const el = characterStore.elements.archetypes?.find(
      (a: any) => a.name === character.archetype
    )
    registerElement(el)
  }

  // Register all chosen custom options/ASIs from asiChoices
  if (character.asiChoices) {
    Object.values(character.asiChoices).forEach((choiceVal: string) => {
      const foundEl = findElementById(choiceVal)
      registerElement(foundEl)
    })
  }

  // 2. Helper to check if a rule's requirements are met
  const isRuleActive = (rule: any) => {
    if (!rule.requirements) return true
    const reqs = rule.requirements.split(',').map((r: string) => r.trim())
    return reqs.every((req: string) => {
      if (req.startsWith('!')) {
        const targetId = req.slice(1)
        return (
          !activeIds.has(targetId) &&
          character.race !== targetId &&
          character.subrace !== targetId
        )
      } else {
        return activeIds.has(req) || character.race === req || character.subrace === req
      }
    })
  }

  // 3. Iteratively resolve grants
  let newGrantsFound = true
  while (newGrantsFound) {
    newGrantsFound = false
    const currentRules = [...gatheredRules]
    for (const rule of currentRules) {
      if (rule.type === 'grant' && rule.id && isRuleActive(rule)) {
        if (!activeIds.has(rule.id)) {
          const grantedEl = findElementById(rule.id)
          if (grantedEl) {
            registerElement(grantedEl)
            newGrantsFound = true
          }
        }
      }
    }
  }

  // 4. Return active select rules (excluding ASI and Languages)
  return gatheredRules.filter(
    (rule: any) =>
      rule.type === 'select' &&
      rule.selectType !== 'Ability Score Improvement' &&
      rule.selectType !== 'Language' &&
      isRuleActive(rule) &&
      (!rule.level || (character.level || 1) >= parseInt(rule.level, 10))
  )
}

// Calculate dynamic race sub-selection slots based on active character race rules
const raceSelectionSlots = computed(() => {
  if (!characterStore.character.race) return []
  const currentRaceName = characterStore.character.race

  const slots: { name: string; selectType: string; supports: string; key: string }[] = []

  const rules = getActiveSelectRules()
  rules.forEach((rule: any, idx: number) => {
    slots.push({
      name: rule.name || (rule.selectType === 'Sub Race' ? 'Sub-Race' : rule.selectType),
      selectType: rule.selectType,
      supports: rule.supports || '',
      key: `race-select-${rule.selectType}-${rule.name || idx}`
    })
  })

  // General check: if no slots found from select rules, check database dynamically for related subraces or variants
  if (slots.length === 0) {
    const hasSubraces = (characterStore.elements.subRaces || []).some(
      (sub: any) => sub.supports && sub.supports.toLowerCase() === currentRaceName.toLowerCase()
    )
    if (hasSubraces) {
      slots.push({
        name: 'Sub-Race',
        selectType: 'Sub Race',
        supports: currentRaceName,
        key: `race-select-Sub Race-auto`
      })
    }

    const hasVariants = (characterStore.elements.raceVariants || []).some(
      (v: any) => v.supports && v.supports.toLowerCase() === currentRaceName.toLowerCase()
    )
    if (hasVariants) {
      slots.push({
        name: 'Race Variant',
        selectType: 'Race Variant',
        supports: currentRaceName,
        key: `race-select-Race Variant-auto`
      })
    }
  }

  return slots
})

const getFilteredItemsForSlot = (slot: any) => {
  const storeKey = getPluralStoreKey(slot.selectType)
  const allEl = storeKey
    ? characterStore.elements[storeKey as keyof typeof characterStore.elements] || []
    : []

  // Filter items matching the supports restriction of the slot
  const matched = allEl.filter((item: any) => {
    if (!slot.supports) return true

    // Check if the supports restriction is a pipe or comma-separated list of supports/tags or direct name/id match
    const supportsList = slot.supports.split(/\|+|,/).map((s: string) => s.trim().toLowerCase())
    const itemSupports = item.supports
      ? item.supports.split(/\|+|,/).map((s: string) => s.trim().toLowerCase())
      : []
    const itemId = (item.id || '').toLowerCase()
    const itemName = (item.name || '').toLowerCase()
    const itemCategory = (item.category || '').toLowerCase()

    return supportsList.some((sup: string) => {
      return (
        itemSupports.includes(sup) || itemId === sup || itemName === sup || itemCategory === sup
      )
    })
  })

  // Filter by active sources
  const activeOnly = matched.filter((item: any) => characterStore.isSourceActive(item.source))
  return activeOnly
}

const getSlotValue = (slot: any) => {
  if (slot.selectType === 'Sub Race' || slot.selectType === 'Race Variant') {
    const currentVal = characterStore.character.subrace || ''
    if (!currentVal) return ''
    const isMatch = getFilteredItemsForSlot(slot).some((item: any) => item.name === currentVal)
    return isMatch ? currentVal : ''
  }
  const selectedVal = characterStore.character.asiChoices?.[slot.name]
  if (!selectedVal) return ''
  const isMatch = getFilteredItemsForSlot(slot).find(
    (item: any) => item.id === selectedVal || item.name === selectedVal
  )
  return isMatch ? isMatch.name : ''
}

// Watch character race changes
watch(
  () => characterStore.character.race,
  (newRace) => {
    textFieldValue.value = newRace || ''
    if (!newRace) {
      characterStore.character.subrace = ''
      isExpanded.value = true
    } else {
      isExpanded.value = false
    }
  }
)

const filteredItems = computed(() => {
  const activeOnly = (items.value || []).filter((item: any) =>
    characterStore.isSourceActive(item.source)
  )
  if (!searchQuery.value) return activeOnly
  const query = searchQuery.value.toLowerCase()
  return activeOnly.filter(
    (item: any) =>
      item.name.toLowerCase().includes(query) ||
      (item.source && item.source.toLowerCase().includes(query))
  )
})

// Main Race row handlers
const handleDoubleClick = (event: any, { item }: any) => {
  characterStore.character.race = item.name
  characterStore.character.raceSource = item.source
  characterStore.character.subrace = ''
  characterStore.character.subraceSource = ''
  textFieldValue.value = item.name
  selectedRace.value = item
  isExpanded.value = false
}

const handleRowClick = (event: any, { item }: any) => {
  selectedRace.value = item
}

const rowProps = (data: any) => {
  const isSelected = selectedRace.value && selectedRace.value.id === data.item.id
  return {
    class: isSelected ? 'v-theme--selected' : ''
  }
}

const onClear = (event: any) => {
  if (event && event.stopPropagation) event.stopPropagation()
  characterStore.character.race = ''
  characterStore.character.raceSource = ''
  characterStore.character.subrace = ''
  characterStore.character.subraceSource = ''
  textFieldValue.value = ''
  selectedRace.value = null
  setTimeout(() => {
    isExpanded.value = true
  }, 50)
}

// Sub-selection slot handlers
const handleSlotClick = (slot: any, item: any) => {
  selectedRace.value = item
}

const handleSlotDoubleClick = (slot: any, item: any) => {
  if (slot.selectType === 'Sub Race' || slot.selectType === 'Race Variant') {
    characterStore.character.subrace = item.name
    characterStore.character.subraceSource = item.source
  } else {
    if (!characterStore.character.asiChoices) {
      characterStore.character.asiChoices = {}
    }
    characterStore.character.asiChoices[slot.name] = item.id || item.name
  }
  selectedRace.value = item
  expandedSlots.value[slot.key] = false
}

const getRowPropsForSlot = (slot: any, data: any) => {
  const isSelected = selectedRace.value && selectedRace.value.id === data.item.id
  return {
    class: isSelected ? 'v-theme--selected' : ''
  }
}

const onClearSlot = (slot: any) => {
  if (slot.selectType === 'Sub Race' || slot.selectType === 'Race Variant') {
    characterStore.character.subrace = ''
    characterStore.character.subraceSource = ''
  } else {
    if (characterStore.character.asiChoices) {
      delete characterStore.character.asiChoices[slot.name]
    }
  }
  selectedRace.value = null
  expandedSlots.value[slot.key] = true
}

const isSlotItemSelected = (slot: any, item: any) => {
  if (slot.selectType === 'Sub Race' || slot.selectType === 'Race Variant') {
    return (
      characterStore.character.subrace === item.name &&
      characterStore.character.subraceSource === item.source
    )
  }
  const selectedVal = characterStore.character.asiChoices?.[slot.name]
  return selectedVal === item.id || selectedVal === item.name
}

onMounted(() => {
  if (filteredItems.value && filteredItems.value.length > 0) {
    selectedRace.value = filteredItems.value[0]
  }
})
</script>

<style scoped>
.race-box {
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
