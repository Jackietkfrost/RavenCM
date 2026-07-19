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
      <v-col style="flex: 0 0 70%; max-width: 70%; max-height: calc(100vh - 220px);" class="overflow-y-auto">
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
              <v-col class="d-flex justify-end cursor-pointer" cols="1" @click="() => (isExpanded = !isExpanded)">
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
          </v-data-table-virtual>
        </v-card>

        <!-- Dynamic Sub-Selection Accordion Cards (Sub-Races, Variants, etc.) -->
        <v-card
          v-for="(slot, index) in raceSelectionSlots"
          :key="slot.key"
          variant="outlined"
          class="mt-4"
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
                  class="race-box cursor-pointer"
                  :model-value="getSlotValue(slot)"
                  variant="plain"
                  density="compact"
                  clearable
                  single-line
                  persistent-clear
                  hide-details
                  :dirty="!!getSlotValue(slot)"
                  @click.stop="() => toggleSlot(index)"
                  @click:clear="() => onClearSlot(slot)"
                ></v-text-field>
              </v-col>
              <v-col class="d-flex justify-end cursor-pointer" cols="1" @click="() => toggleSlot(index)">
                <v-icon :icon="expandedSlotIndex === index ? mdiChevronUp : mdiChevronDown" class="ml-auto" />
              </v-col>
            </v-row>
          </v-card-title>
          <v-data-table-virtual
            v-if="expandedSlotIndex === index"
            :headers="subraceHeaders"
            :items="getFilteredItemsForSlot(slot)"
            :item-value="(item) => item.id"
            hover
            fixed-header
            height="250px"
            @dblclick:row="(event, row) => handleSlotDoubleClick(index, row.item)"
            @click:row="(event, row) => handleSlotClick(index, row.item)"
            :row-props="(data) => getRowPropsForSlot(index, data)"
          ></v-data-table-virtual>
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
import { mdiChevronDown, mdiChevronUp, mdiFilterMenuOutline, mdiMagnify } from '@mdi/js'
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
const expandedSlotIndex = ref<number | null>(0)

// Calculate dynamic race sub-selection slots based on active character race rules
const raceSelectionSlots = computed(() => {
  if (!characterStore.character.race) return []
  const currentRaceName = characterStore.character.race

  const baseRace = characterStore.elements.races.find(
    (r: any) => r.name === currentRaceName
  )
  
  const slots: { name: string; selectType: string; supports: string; key: string }[] = []
  
  if (baseRace && baseRace.rules) {
    // Filter for select rules where selectType is "Sub Race" or "Race Variant"
    const selectRules = baseRace.rules.filter(
      (rule: any) => rule.type === 'select' && (rule.selectType === 'Sub Race' || rule.selectType === 'Race Variant')
    )

    selectRules.forEach((rule: any, idx: number) => {
      slots.push({
        name: rule.name || (rule.selectType === 'Sub Race' ? 'Sub-Race' : 'Race Variant'),
        selectType: rule.selectType,
        supports: rule.supports || '',
        key: `race-select-${rule.selectType}-${idx}`
      })
    })
  }

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
  const allEl = slot.selectType === 'Sub Race'
    ? (characterStore.elements.subRaces || [])
    : (characterStore.elements.raceVariants || [])

  // Filter items matching the supports restriction of the slot
  const matched = allEl.filter(
    (item: any) => item.supports && item.supports.toLowerCase() === slot.supports.toLowerCase()
  )

  // Filter by active sources
  const activeOnly = matched.filter((item: any) => characterStore.isSourceActive(item.source))
  return activeOnly
}

const getSlotValue = (slot: any) => {
  const currentVal = characterStore.character.subrace || ''
  if (!currentVal) return ''
  const isMatch = getFilteredItemsForSlot(slot).some((item: any) => item.name === currentVal)
  return isMatch ? currentVal : ''
}

const toggleSlot = (index: number) => {
  expandedSlotIndex.value = expandedSlotIndex.value === index ? null : index
}

// Watch character race changes to toggle slot expansions
watch(
  () => characterStore.character.race,
  (newRace) => {
    textFieldValue.value = newRace || ''
    if (!newRace) {
      characterStore.character.subrace = ''
      isExpanded.value = true
      expandedSlotIndex.value = null
    } else {
      isExpanded.value = false
      setTimeout(() => {
        if (raceSelectionSlots.value.length > 0) {
          expandedSlotIndex.value = 0
        } else {
          expandedSlotIndex.value = null
        }
      }, 50)
    }
  }
)

const filteredItems = computed(() => {
  const activeOnly = (items.value || []).filter((item: any) => characterStore.isSourceActive(item.source))
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
  characterStore.character.subrace = ''
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
  characterStore.character.subrace = ''
  textFieldValue.value = ''
  selectedRace.value = null
  setTimeout(() => {
    isExpanded.value = true
  }, 50)
}

// Sub-selection slot handlers
const handleSlotClick = (index: number, item: any) => {
  selectedRace.value = item
}

const handleSlotDoubleClick = (index: number, item: any) => {
  characterStore.character.subrace = item.name
  selectedRace.value = item
  expandedSlotIndex.value = null
}

const getRowPropsForSlot = (index: number, data: any) => {
  const isSelected = selectedRace.value && selectedRace.value.id === data.item.id
  return {
    class: isSelected ? 'v-theme--selected' : ''
  }
}

const onClearSlot = (slot: any) => {
  characterStore.character.subrace = ''
  selectedRace.value = null
  const idx = raceSelectionSlots.value.findIndex((s) => s.key === slot.key)
  if (idx !== -1) {
    setTimeout(() => {
      expandedSlotIndex.value = idx
    }, 50)
  }
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
