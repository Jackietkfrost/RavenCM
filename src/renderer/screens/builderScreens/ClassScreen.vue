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
      <!-- Left column: Class list table -->
      <v-col cols="7">
        <v-card variant="outlined" style="border-color: rgba(128, 128, 128, 0.2)">
          <v-card-title class="py-3">
            <v-row no-gutters @click="() => (isExpanded = !isExpanded)" class="align-center">
              <v-col class="" cols="4"> {{ t('BuildScreen.class') }} </v-col>
              <v-col class="text--secondary" cols="6">
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
                  :dirty="
                    characterStore.character.class
                      ? characterStore.character.class.length > 0
                      : false
                  "
                  @click:clear="onClear"
                ></v-text-field>
              </v-col>
              <v-col class="d-flex justify-end" cols="2">
                <v-icon
                  :icon="isExpanded ? mdiChevronUp : mdiChevronDown"
                  class="ml-auto"
                  @click="() => (isExpanded = !isExpanded)"
                >
                  {{ isExpanded ? mdiChevronUp : mdiChevronDown }}
                </v-icon>
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
            height="calc(100vh - 280px)"
            @dblclick:row="handleDoubleClick"
            @click:row="handleRowClick"
            :row-props="rowProps"
          >
          </v-data-table-virtual>
        </v-card>
      </v-col>

      <!-- Right column: Class details pane -->
      <v-col cols="5">
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
              <div class="text-subtitle-1">Select a class to view details</div>
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
const isExpanded = ref(true)
const textFieldValue = ref(characterStore.character.class ? characterStore.character.class : '')
const classes = characterStore.elements.classes
const headers = ref([
  { title: 'Class', key: 'name', align: 'start' as const },
  { title: 'Source', key: 'source', align: 'end' as const }
])
const items = ref(classes)
const searchQuery = ref('')
const selectedClass = ref<any>(null)

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

const handleDoubleClick = (event: any, { item }: any) => {
  characterStore.character.class = item.name
  textFieldValue.value = item.name
  isExpanded.value = !isExpanded.value
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

const onClear = () => {
  characterStore.character.class = ''
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
