<template>
  <v-container fluid class="pa-4">
    <v-row no-gutters class="mb-4">
      <v-col cols="11" sm="6">
        <v-text-field
          :prepend-inner-icon="mdiMagnify"
          variant="solo"
          density="compact"
          label="Search"
          v-model="searchQuery"
          clearable
          hide-details
        ></v-text-field>
      </v-col>
      <v-col class="d-flex justify-end" cols="1" sm="6">
        <v-btn icon variant="text">
          <v-icon :icon="mdiFilterMenuOutline" />
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <!-- Left column: Background list and sub-selection cards -->
      <v-col
        style="flex: 0 0 70%; max-width: 70%; max-height: calc(100vh - 220px)"
        class="overflow-y-auto"
      >
        <!-- Main Background Card -->
        <v-card variant="outlined" style="border-color: rgba(128, 128, 128, 0.2)">
          <v-card-title class="py-3">
            <v-row no-gutters class="align-center">
              <v-col class="cursor-pointer" cols="6" @click="() => (isExpanded = !isExpanded)">
                {{ t('BuildScreen.background') }}
              </v-col>
              <v-col class="text--secondary" cols="5">
                <v-text-field
                  readonly
                  class="background-box cursor-pointer"
                  v-model="textFieldValue"
                  variant="plain"
                  density="compact"
                  clearable
                  single-line
                  persistent-clear
                  hide-details
                  :dirty="
                    !!(
                      characterStore.character.background &&
                      characterStore.character.background.name
                    )
                  "
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
                  v-if="characterStore.character.background && characterStore.character.background.name === item.name && characterStore.character.background.source === item.source"
                  :icon="mdiCheck"
                  color="success"
                  class="ml-2"
                  size="small"
                />
              </div>
            </template>
            <template #[descriptionSlotName]="{ item }">
              <span class="text-italic text-grey">
                {{ item.setters?.short || '' }}
              </span>
            </template>
          </v-data-table-virtual>
        </v-card>

        <!-- Dynamic Sub-Selection Accordion Cards (Background Variant, Background Feature) -->
        <v-card
          v-for="(slot, index) in backgroundSelectionSlots"
          :key="slot.key"
          variant="outlined"
          class="mt-4"
          style="border-color: rgba(128, 128, 128, 0.2)"
        >
          <v-card-title class="py-3">
            <v-row no-gutters class="align-center">
              <v-col class="cursor-pointer" cols="6" @click="() => toggleSlot(index)">
                {{ slot.name }}
                <span class="text-caption text-grey ml-1"
                  >({{ slot.optional ? 'Optional' : 'Required' }})</span
                >
              </v-col>
              <v-col class="text--secondary" cols="5">
                <v-text-field
                  readonly
                  class="background-box cursor-pointer"
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
            :headers="subHeaders"
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
                  v-if="(slot.selectType === 'Background Variant' && characterStore.character.backgroundVariant === item.name && characterStore.character.backgroundVariantSource === item.source) || (slot.selectType !== 'Background Variant' && characterStore.character.backgroundFeature === item.name && characterStore.character.backgroundFeatureSource === item.source)"
                  :icon="mdiCheck"
                  color="success"
                  class="ml-2"
                  size="small"
                />
              </div>
            </template>
            <template #[descriptionSlotName]="{ item }">
              <span class="text-italic text-grey">
                {{ item.setters?.short || '' }}
              </span>
            </template>
          </v-data-table-virtual>
        </v-card>
      </v-col>

      <!-- Right column: Background details pane -->
      <v-col style="flex: 0 0 30%; max-width: 30%">
        <v-card
          variant="outlined"
          class="d-flex flex-column"
          style="border-color: rgba(128, 128, 128, 0.2); height: calc(100vh - 220px)"
        >
          <template v-if="activeDetailsItem">
            <!-- Header section of details pane -->
            <div
              class="d-flex justify-space-between align-center px-4 py-3 border-bottom"
              style="
                background-color: rgba(var(--v-theme-surface-variant), 0.05);
                border-bottom: 1px solid rgba(128, 128, 128, 0.2);
              "
            >
              <div class="text-h5 font-weight-bold text-uppercase" style="letter-spacing: 0.05em">
                {{ activeDetailsItem.name }}
              </div>
              <div class="text-caption text-grey">
                {{ activeDetailsItem.source }}
              </div>
            </div>

            <!-- Scrollable content area -->
            <div class="flex-grow-1 overflow-y-auto px-4 py-4 description-content">
              <div v-html="activeDetailsItem.htmlDescription"></div>
            </div>
          </template>
          <template v-else>
            <div class="d-flex flex-column align-center justify-center fill-height text-grey py-12">
              <div class="text-subtitle-1">Select a background to view details</div>
            </div>
          </template>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="tsx">
import { useAppStore } from '@/renderer/store/appStore'
import { mdiChevronDown, mdiChevronUp, mdiFilterMenuOutline, mdiMagnify, mdiCheck } from '@mdi/js'
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const characterStore = useAppStore()
const isExpanded = ref(
  !(characterStore.character.background && characterStore.character.background.name)
)
const textFieldValue = ref(
  characterStore.character.background && characterStore.character.background.name
    ? characterStore.character.background.name
    : ''
)
const backgrounds = characterStore.elements.backgrounds
const headers = ref([
  { title: 'Background', key: 'name', align: 'start' as const },
  { title: 'Description', key: 'short', align: 'start' as const },
  { title: 'Source', key: 'source', align: 'end' as const }
])
const subHeaders = ref([
  { title: 'Option', key: 'name', align: 'start' as const },
  { title: 'Description', key: 'short', align: 'start' as const },
  { title: 'Source', key: 'source', align: 'end' as const }
])
const items = ref(backgrounds)
const searchQuery = ref('')
const selectedBackground = ref<any>(null)
const selectedSubItem = ref<any>(null)
const expandedSlotIndex = ref<number | null>(null)
const descriptionSlotName = 'item.short'

const activeDetailsItem = computed(() => {
  return selectedSubItem.value || selectedBackground.value
})

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

// Calculate dynamic background sub-selection slots based on XML rules
const backgroundSelectionSlots = computed(() => {
  const currentBgName = characterStore.character.background?.name
  if (!currentBgName) return []

  const baseBg = characterStore.elements.backgrounds.find((b: any) => b.name === currentBgName)

  const slots: {
    name: string
    selectType: string
    supports: string
    key: string
    optional?: boolean
  }[] = []

  if (baseBg && baseBg.rules) {
    // Filter for select rules where selectType is "Background Variant" or "Background Feature"
    const selectRules = baseBg.rules.filter(
      (rule: any) =>
        rule.type === 'select' &&
        (rule.selectType === 'Background Variant' || rule.selectType === 'Background Feature')
    )

    selectRules.forEach((rule: any, idx: number) => {
      slots.push({
        name:
          rule.name ||
          (rule.selectType === 'Background Variant' ? 'Background Variant' : 'Background Feature'),
        selectType: rule.selectType,
        supports: rule.supports || '',
        key: `bg-select-${rule.selectType}-${idx}`,
        optional: rule.optional === 'true' || rule.optional === true
      })
    })
  }

  // Fallback: Check elements database dynamically if no rules match
  if (slots.length === 0) {
    const hasVariants = (characterStore.elements.backgroundVariants || []).some(
      (v: any) =>
        v.supports &&
        v.supports
          .toLowerCase()
          .split(',')
          .map((s: string) => s.trim().toLowerCase())
          .includes(currentBgName.toLowerCase())
    )
    if (hasVariants) {
      slots.push({
        name: 'Background Variant',
        selectType: 'Background Variant',
        supports: currentBgName,
        key: `bg-select-Background Variant-auto`,
        optional: true
      })
    }

    const hasFeatures = (characterStore.elements.backgroundFeatures || []).some(
      (f: any) =>
        f.supports &&
        f.supports
          .toLowerCase()
          .split(',')
          .map((s: string) => s.trim().toLowerCase())
          .includes(currentBgName.toLowerCase())
    )
    if (hasFeatures) {
      slots.push({
        name: 'Background Feature',
        selectType: 'Background Feature',
        supports: currentBgName,
        key: `bg-select-Background Feature-auto`,
        optional: true
      })
    }
  }

  return slots
})

const getFilteredItemsForSlot = (slot: any) => {
  const allEl =
    slot.selectType === 'Background Variant'
      ? characterStore.elements.backgroundVariants || []
      : characterStore.elements.backgroundFeatures || []

  const currentBgName = characterStore.character.background?.name || ''

  const matched = allEl.filter((item: any) => {
    if (!item.supports) return false
    const itemSupportsLower = item.supports.toLowerCase()
    const slotSupportsLower = slot.supports.toLowerCase()

    if (itemSupportsLower === slotSupportsLower) return true

    const slotTerms = slotSupportsLower.split('||').map((s: string) => s.trim())
    const itemTerms = itemSupportsLower.split(',').map((s: string) => s.trim())

    return slotTerms.some((term: string) => {
      const andTerms = term.split(',').map((s: string) => s.trim())
      return andTerms.every(
        (t: string) => itemTerms.includes(t) || t === currentBgName.toLowerCase()
      )
    })
  })

  const activeOnly = matched.filter((item: any) => characterStore.isSourceActive(item.source))
  return activeOnly
}

const getSlotValue = (slot: any) => {
  const currentVal =
    slot.selectType === 'Background Variant'
      ? characterStore.character.backgroundVariant || ''
      : characterStore.character.backgroundFeature || ''
  if (!currentVal) return ''
  const isMatch = getFilteredItemsForSlot(slot).some((item: any) => item.name === currentVal)
  return isMatch ? currentVal : ''
}

const toggleSlot = (index: number | null) => {
  expandedSlotIndex.value = expandedSlotIndex.value === index ? null : index
}

watch(
  () => characterStore.character.background,
  (newBg) => {
    textFieldValue.value = (newBg && newBg.name) || ''
    selectedSubItem.value = null
    if (!newBg || !newBg.name) {
      characterStore.character.backgroundVariant = ''
      characterStore.character.backgroundVariantSource = ''
      characterStore.character.backgroundFeature = ''
      characterStore.character.backgroundFeatureSource = ''
    }
    setTimeout(() => {
      if (backgroundSelectionSlots.value.length > 0) {
        expandedSlotIndex.value = 0
      } else {
        expandedSlotIndex.value = null
      }
    }, 50)
  },
  { deep: true }
)

const handleDoubleClick = (event: any, { item }: any) => {
  characterStore.character.background = item
  characterStore.character.backgroundVariant = ''
  characterStore.character.backgroundVariantSource = ''
  characterStore.character.backgroundFeature = ''
  characterStore.character.backgroundFeatureSource = ''
  textFieldValue.value = item.name
  isExpanded.value = false
}

const handleRowClick = (event: any, { item }: any) => {
  selectedBackground.value = item
  selectedSubItem.value = null
}

const handleSlotDoubleClick = (slot: any, item: any) => {
  if (slot.selectType === 'Background Variant') {
    characterStore.character.backgroundVariant = item.name
    characterStore.character.backgroundVariantSource = item.source
  } else {
    characterStore.character.backgroundFeature = item.name
    characterStore.character.backgroundFeatureSource = item.source
  }
  expandedSlotIndex.value = null
}

const handleSlotClick = (slot: any, item: any) => {
  selectedSubItem.value = item
}

const onClearSlot = (slot: any) => {
  if (slot.selectType === 'Background Variant') {
    characterStore.character.backgroundVariant = ''
    characterStore.character.backgroundVariantSource = ''
  } else {
    characterStore.character.backgroundFeature = ''
    characterStore.character.backgroundFeatureSource = ''
  }
}

const getRowPropsForSlot = (slot: any, data: any) => {
  const isSelected = selectedSubItem.value && selectedSubItem.value.id === data.item.id
  return {
    class: isSelected ? 'v-theme--selected' : ''
  }
}

const rowProps = (data: any) => {
  const isSelected = selectedBackground.value && selectedBackground.value.id === data.item.id
  return {
    class: isSelected ? 'v-theme--selected' : ''
  }
}

const onClear = (event: any) => {
  if (event && event.stopPropagation) event.stopPropagation()
  characterStore.character.background = {
    name: '',
    description: '',
    id: '',
    source: ''
  }
  characterStore.character.backgroundVariant = ''
  characterStore.character.backgroundVariantSource = ''
  characterStore.character.backgroundFeature = ''
  characterStore.character.backgroundFeatureSource = ''
  textFieldValue.value = ''
  selectedBackground.value = null
  selectedSubItem.value = null
  expandedSlotIndex.value = null
  setTimeout(() => {
    isExpanded.value = true
  }, 50)
}

onMounted(() => {
  if (filteredItems.value && filteredItems.value.length > 0) {
    selectedBackground.value = filteredItems.value[0]
  }
  if (characterStore.character.background?.name && backgroundSelectionSlots.value.length > 0) {
    expandedSlotIndex.value = 0
  }
})
</script>

<style scoped>
.background-box {
  cursor: pointer;
}

:deep(.v-data-table__tr) {
  cursor: pointer;
}

:deep(.v-theme--selected) {
  background-color: rgba(var(--v-theme-primary), 0.15) !important;
  color: rgb(var(--v-theme-primary)) !important;
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

.description-content :deep(ul) {
  margin-bottom: 12px;
  padding-left: 20px;
}

.description-content :deep(li) {
  margin-bottom: 4px;
  font-size: 0.9rem;
}
</style>
