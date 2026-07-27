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
      <!-- Left column: Class and Subclass accordions -->
      <v-col
        style="flex: 0 0 70%; max-width: 70%; max-height: calc(100vh - 220px)"
        class="overflow-y-auto"
      >
        <!-- Class Accordion Card -->
        <v-card key="class-card" variant="outlined" style="border-color: rgba(128, 128, 128, 0.2)">
          <v-card-title class="py-3">
            <v-row no-gutters class="align-center">
              <v-col class="cursor-pointer" cols="6" @click="() => (isExpanded = !isExpanded)">
                {{ t('BuildScreen.class') }}
              </v-col>
              <v-col class="text--secondary" cols="5">
                <v-text-field
                  readonly
                  class="class-box cursor-pointer"
                  v-model="textFieldValue"
                  variant="plain"
                  density="compact"
                  clearable
                  single-line
                  persistent-clear
                  hide-details
                  :dirty="!!characterStore.character.class"
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
            key="class-table"
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
            <template #[descriptionSlotName]="{ item }">
              <span class="text-italic text-grey">
                {{ item.setters?.short || '' }}
              </span>
            </template>
          </v-data-table-virtual>
        </v-card>

        <!-- Subclass Accordion Card -->
        <v-card
          v-if="characterStore.character.class && availableArchetypes.length > 0"
          key="subclass-card"
          variant="outlined"
          class="mt-4"
          style="border-color: rgba(128, 128, 128, 0.2)"
        >
          <v-card-title class="py-3">
            <v-row no-gutters class="align-center">
              <v-col
                class="cursor-pointer"
                cols="6"
                @click="() => (isSubclassExpanded = !isSubclassExpanded)"
              >
                {{ subclassWording }}
              </v-col>
              <v-col class="text--secondary" cols="5">
                <v-text-field
                  readonly
                  class="class-box cursor-pointer"
                  v-model="subclassTextFieldValue"
                  variant="plain"
                  density="compact"
                  clearable
                  single-line
                  persistent-clear
                  hide-details
                  :dirty="!!subclassTextFieldValue"
                  @click.stop="() => (isSubclassExpanded = !isSubclassExpanded)"
                  @click:clear="onClearSubclass"
                ></v-text-field>
              </v-col>
              <v-col
                class="d-flex justify-end cursor-pointer"
                cols="1"
                @click="() => (isSubclassExpanded = !isSubclassExpanded)"
              >
                <v-icon
                  :icon="isSubclassExpanded ? mdiChevronUp : mdiChevronDown"
                  class="ml-auto"
                />
              </v-col>
            </v-row>
          </v-card-title>
          <v-data-table-virtual
            v-if="isSubclassExpanded"
            key="subclass-table"
            :headers="subclassHeaders"
            :items="availableArchetypes"
            :item-value="(item) => item.id"
            hover
            fixed-header
            height="250px"
            @dblclick:row="handleSubclassDoubleClick"
            @click:row="handleSubclassClick"
            :row-props="subclassRowProps"
          ></v-data-table-virtual>
        </v-card>
      </v-col>

      <!-- Right column: Class/Subclass details pane -->
      <v-col style="flex: 0 0 30%; max-width: 30%">
        <v-card
          variant="outlined"
          class="d-flex flex-column"
          style="border-color: rgba(128, 128, 128, 0.2); height: calc(100vh - 220px)"
        >
          <template v-if="selectedClass">
            <!-- Header section of details pane -->
            <div
              class="d-flex justify-space-between align-center px-4 py-3 border-bottom"
              style="
                background-color: rgba(var(--v-theme-surface-variant), 0.05);
                border-bottom: 1px solid rgba(128, 128, 128, 0.2);
              "
            >
              <div class="text-h5 font-weight-bold text-uppercase" style="letter-spacing: 0.05em">
                {{ selectedClass.name }}
              </div>
              <div class="text-caption text-grey">
                {{ selectedClass.source }}
              </div>
            </div>

            <!-- Scrollable content area -->
            <div class="flex-grow-1 overflow-y-auto px-4 py-4 description-content">
              <div v-html="selectedClass.htmlDescription"></div>
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

// Main Class states
const isExpanded = ref(true)
const textFieldValue = ref(characterStore.character.class ? characterStore.character.class : '')
const classes = characterStore.elements.classes
const headers = ref([
  { title: 'Class', key: 'name', align: 'start' as const },
  { title: 'Description', key: 'short', align: 'start' as const },
  { title: 'Source', key: 'source', align: 'end' as const }
])
const items = ref(classes)
const searchQuery = ref('')
const selectedClass = ref<any>(null)

// Subclass states
const isSubclassExpanded = ref(false)
const subclassTextFieldValue = ref('')
const descriptionSlotName = 'item.short'

// Compute the subclass groups (e.g., ["Otherworldly Patron"]) supported by the class
const subclassGroups = computed(() => {
  const currentClassName = characterStore.character.class
  if (!currentClassName) return []

  const baseClass = characterStore.elements.classes.find(
    (c: any) => c.name.toLowerCase() === currentClassName.toLowerCase()
  )
  if (!baseClass) return []

  const groups = new Set<string>()

  // 1. Scan class rules for direct subclass selection or granted features
  const classRules = baseClass.rules || []
  classRules.forEach((r: any) => {
    if (r.type === 'select' && r.selectType === 'Archetype' && r.supports) {
      groups.add(r.supports.toLowerCase())
    }
  })

  // 2. Scan granted Class Features for subclass selection rules
  const classFeatureIds = classRules
    .filter((r: any) => r.type === 'grant' && r.grantType === 'Class Feature')
    .map((r: any) => r.id)

  const classFeatures = characterStore.elements.classFeatures || []
  classFeatures.forEach((cf: any) => {
    if (classFeatureIds.includes(cf.id)) {
      const cfRules = cf.rules || []
      cfRules.forEach((r: any) => {
        if (r.type === 'select' && r.selectType === 'Archetype' && r.supports) {
          groups.add(r.supports.toLowerCase())
        }
      })
    }
  })

  return Array.from(groups)
})

// Compute available subclasses (Archetypes) for the selected class
const availableArchetypes = computed(() => {
  const groups = subclassGroups.value
  if (groups.length === 0) return []
  return (characterStore.elements.archetypes || []).filter(
    (arch: any) => arch.supports && groups.includes(arch.supports.toLowerCase())
  )
})

// Find the subclass wording dynamically from the Class element's select rules, class features, or supports
const subclassWording = computed(() => {
  const currentClassName = characterStore.character.class
  if (!currentClassName) return 'Subclass'

  const baseClass = characterStore.elements.classes.find(
    (c: any) => c.name.toLowerCase() === currentClassName.toLowerCase()
  )
  if (!baseClass) return 'Subclass'

  const classRules = baseClass.rules || []

  // 1. Check select rules directly in the class element
  const directSelect = classRules.find(
    (r: any) => r.type === 'select' && r.selectType === 'Archetype'
  )
  if (directSelect && directSelect.name) return directSelect.name

  // 2. Check subclass select rules inside granted Class Features
  const classFeatureIds = classRules
    .filter((r: any) => r.type === 'grant' && r.grantType === 'Class Feature')
    .map((r: any) => r.id)

  const classFeatures = characterStore.elements.classFeatures || []
  for (const cf of classFeatures) {
    if (classFeatureIds.includes(cf.id)) {
      const cfRules = cf.rules || []
      const cfSelect = cfRules.find((r: any) => r.type === 'select' && r.selectType === 'Archetype')
      if (cfSelect && cfSelect.name) return cfSelect.name
    }
  }

  // 3. Fallback to capitalized supports name of the matching archetypes
  const groups = subclassGroups.value
  if (groups.length > 0) {
    const matchingArch = (characterStore.elements.archetypes || []).find(
      (a: any) => a.supports && a.supports.toLowerCase() === groups[0]
    )
    if (matchingArch) return matchingArch.supports
  }

  return 'Subclass'
})

const subclassHeaders = computed(() => [
  { title: subclassWording.value, key: 'name', align: 'start' as const },
  { title: 'Source', key: 'source', align: 'end' as const }
])

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

// Watch character class selection changes to toggle subclass accordion
watch(
  () => characterStore.character.class,
  (newClass) => {
    textFieldValue.value = newClass || ''
    if (!newClass) {
      characterStore.character.archetype = ''
      isExpanded.value = true
      isSubclassExpanded.value = false
    } else {
      isExpanded.value = false
      setTimeout(() => {
        if (availableArchetypes.value.length > 0) {
          isSubclassExpanded.value = true
        } else {
          isSubclassExpanded.value = false
        }
      }, 50)
    }
  }
)

// Watch character subclass/archetype changes to update local text field
watch(
  () => characterStore.character.archetype,
  (newArchetype) => {
    subclassTextFieldValue.value = newArchetype || ''
  },
  { immediate: true }
)

// Main Class handlers
const handleDoubleClick = (event: any, { item }: any) => {
  characterStore.character.class = item.name
  textFieldValue.value = item.name
  isExpanded.value = false
}

const handleRowClick = (event: any, { item }: any) => {
  selectedClass.value = item
}

const rowProps = (data: any) => {
  const isSelected = selectedClass.value && selectedClass.value.id === data.item.id
  return {
    class: isSelected ? 'v-theme--selected' : ''
  }
}

const onClear = (event: any) => {
  if (event && event.stopPropagation) event.stopPropagation()
  characterStore.character.class = ''
  textFieldValue.value = ''
  selectedClass.value = null
  setTimeout(() => {
    isExpanded.value = true
  }, 50)
}

// Subclass handlers
const handleSubclassClick = (event: any, { item }: any) => {
  selectedClass.value = item
}

const handleSubclassDoubleClick = (event: any, { item }: any) => {
  characterStore.character.archetype = item.name
  selectedClass.value = item
  isSubclassExpanded.value = false
}

const subclassRowProps = (data: any) => {
  const isSelected = selectedClass.value && selectedClass.value.id === data.item.id
  return {
    class: isSelected ? 'v-theme--selected' : ''
  }
}

const onClearSubclass = (event: any) => {
  if (event && event.stopPropagation) event.stopPropagation()
  characterStore.character.archetype = ''
  setTimeout(() => {
    isSubclassExpanded.value = true
  }, 50)
}

onMounted(() => {
  if (filteredItems.value && filteredItems.value.length > 0) {
    selectedClass.value = filteredItems.value[0]
  }
})
</script>

<style scoped>
.class-box {
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
