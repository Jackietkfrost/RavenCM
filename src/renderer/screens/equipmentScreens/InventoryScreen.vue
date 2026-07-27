<template>
  <v-container fluid class="pa-4">
    <!-- Search Bar -->
    <v-row no-gutters class="mb-4">
      <v-col cols="12" sm="6">
        <v-text-field
          :prepend-inner-icon="mdiMagnify"
          variant="solo"
          density="compact"
          label="Search inventory"
          v-model="searchQuery"
          clearable
          hide-details
        ></v-text-field>
      </v-col>
    </v-row>

    <v-row>
      <!-- Left column: Inventory Table -->
      <v-col cols="7">
        <v-card variant="outlined" style="border-color: rgba(128, 128, 128, 0.2)">
          <v-card-title
            class="text-subtitle-1 font-weight-bold py-2 border-bottom d-flex justify-space-between align-center"
          >
            <span>Character's Inventory Items</span>
            <span class="text-caption text-grey">Double-click to remove item</span>
          </v-card-title>
          <v-data-table-virtual
            :headers="headers"
            :items="filteredItems"
            :item-value="(item) => item.instanceId || item.id"
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

      <!-- Right column: Item details pane -->
      <v-col cols="5">
        <v-card
          variant="outlined"
          class="d-flex flex-column"
          style="border-color: rgba(128, 128, 128, 0.2); height: calc(100vh - 220px)"
        >
          <template v-if="selectedItem">
            <!-- Header section of details pane -->
            <div
              class="d-flex justify-space-between align-center px-4 py-3 border-bottom"
              style="
                background-color: rgba(var(--v-theme-surface-variant), 0.05);
                border-bottom: 1px solid rgba(128, 128, 128, 0.2);
              "
            >
              <div class="d-flex flex-column">
                <span
                  class="text-h5 font-weight-bold text-uppercase"
                  style="letter-spacing: 0.05em"
                >
                  {{ selectedItem.name }}
                </span>
                <span class="text-caption text-grey"> Category: {{ selectedItem.type }} </span>
              </div>
              <div class="text-caption text-grey">
                {{ selectedItem.source }}
              </div>
            </div>

            <!-- Scrollable content area -->
            <div class="flex-grow-1 overflow-y-auto px-4 py-4 description-content">
              <div v-html="selectedItem.htmlDescription"></div>
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
import { mdiMagnify } from '@mdi/js'
import { ref, computed, onMounted } from 'vue'

const characterStore = useAppStore()
const searchQuery = ref('')
const selectedItem = ref<any>(null)

const headers = ref([
  { title: 'Name', key: 'name', align: 'start' as const },
  { title: 'Type', key: 'type', align: 'center' as const },
  { title: 'Source', key: 'source', align: 'end' as const }
])

const inventoryItems = computed(() => characterStore.character.inventory || [])

const filteredItems = computed(() => {
  const activeOnly = inventoryItems.value.filter((item: any) =>
    characterStore.isSourceActive(item.source)
  )
  if (!searchQuery.value) return activeOnly
  const query = searchQuery.value.toLowerCase()
  return activeOnly.filter(
    (item: any) =>
      item.name.toLowerCase().includes(query) ||
      (item.type && item.type.toLowerCase().includes(query)) ||
      (item.source && item.source.toLowerCase().includes(query))
  )
})

const handleDoubleClick = (event: any, { item }: any) => {
  if (characterStore.character.inventory) {
    characterStore.character.inventory = characterStore.character.inventory.filter(
      (i: any) => (i.instanceId || i.id) !== (item.instanceId || item.id)
    )
    if (
      selectedItem.value &&
      (selectedItem.value.instanceId || selectedItem.value.id) === (item.instanceId || item.id)
    ) {
      selectedItem.value = null
    }
  }
}

const handleRowClick = (event: any, { item }: any) => {
  selectedItem.value = item
}

const rowProps = (data: any) => {
  const isSelected =
    selectedItem.value &&
    (selectedItem.value.instanceId || selectedItem.value.id) ===
      (data.item.instanceId || data.item.id)
  return {
    class: isSelected ? 'v-theme--selected' : ''
  }
}

onMounted(() => {
  if (filteredItems.value && filteredItems.value.length > 0) {
    selectedItem.value = filteredItems.value[0]
  }
})
</script>

<style scoped>
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
