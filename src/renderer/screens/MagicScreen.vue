<template>
  <v-app-bar color="subheader" density="compact" height="50" sticky>
    <v-btn :class="{ active: isCurrentStage('spells') }">Spellcasting</v-btn>
    <v-btn v-if="classSupportsSpells" disabled class="ml-2">
      {{ characterStore.character.class }}
    </v-btn>
  </v-app-bar>

  <template v-if="characterStore.character.class && classSupportsSpells">
    <v-container fluid class="pa-4">
      <!-- Search Bar -->
      <v-row no-gutters class="mb-4">
        <v-col cols="12" sm="6">
          <v-text-field
            :prepend-inner-icon="mdiMagnify"
            variant="solo"
            density="compact"
            label="Search spells"
            v-model="searchQuery"
            clearable
            hide-details
          ></v-text-field>
        </v-col>
      </v-row>

      <v-row>
        <!-- Left side: Tables -->
        <v-col cols="7" class="d-flex flex-column gap-y-4">
          <!-- Spells List -->
          <v-card variant="outlined" style="border-color: rgba(128, 128, 128, 0.2)" class="mb-4">
            <v-card-title class="text-subtitle-1 font-weight-bold py-2 border-bottom">
              Available Spells
            </v-card-title>
            <v-data-table-virtual
              :headers="spellsHeaders"
              :items="filteredSpells"
              :item-value="(item) => item.id"
              fixed-header
              height="calc(100vh - 460px)"
              hover
              @dblclick:row="handleDoubleClick"
              @click:row="handleRowClick"
              :row-props="rowProps"
            >
            </v-data-table-virtual>
          </v-card>

          <!-- Selected Spells -->
          <v-card variant="outlined" style="border-color: rgba(128, 128, 128, 0.2)">
            <v-card-title class="text-subtitle-1 font-weight-bold py-2 border-bottom d-flex justify-space-between align-center">
              <span>Character's Prepared Spells</span>
              <span class="text-caption text-grey">Double-click a spell below to remove it</span>
            </v-card-title>
            <v-data-table-virtual
              :headers="selectedSpellsHeaders"
              :items="selectedSpells"
              height="180"
              hover
              @dblclick:row="handleRemoveSpell"
            >
            </v-data-table-virtual>
          </v-card>
        </v-col>

        <!-- Right side: Description pane -->
        <v-col cols="5">
          <v-card
            variant="outlined"
            class="d-flex flex-column"
            style="border-color: rgba(128, 128, 128, 0.2); height: calc(100vh - 220px)"
          >
            <template v-if="selectedSpell">
              <!-- Header section of details pane -->
              <div
                class="d-flex justify-space-between align-center px-4 py-3 border-bottom"
                style="
                  background-color: rgba(var(--v-theme-surface-variant), 0.05);
                  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
                "
              >
                <div class="d-flex flex-column">
                  <span class="text-h5 font-weight-bold text-uppercase" style="letter-spacing: 0.05em">
                    {{ selectedSpell.name }}
                  </span>
                  <span class="text-caption text-grey">
                    Level {{ selectedSpell.level }} • {{ selectedSpell.school }}
                  </span>
                </div>
                <div class="text-caption text-grey">
                  {{ selectedSpell.source }}
                </div>
              </div>

              <!-- Scrollable content area -->
              <div class="flex-grow-1 overflow-y-auto px-4 py-4 description-content">
                <div v-html="selectedSpell.htmlDescription"></div>
              </div>
            </template>
            <template v-else>
              <div class="d-flex flex-column align-center justify-center fill-height text-grey py-12">
                <div class="text-subtitle-1">Select a spell to view details</div>
              </div>
            </template>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  <template v-else>
    <v-container fluid class="pa-4 d-flex align-center justify-center" style="height: calc(100vh - 120px)">
      <div class="text-center text-grey">
        <div class="text-h6">Choose a class that can use spells for options.</div>
      </div>
    </v-container>
  </template>
</template>

<script setup lang="tsx">
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../store/appStore'
import { mdiMagnify } from '@mdi/js'

const characterStore = useAppStore()
const searchQuery = ref('')
const selectedSpell = ref<any>(null)

const isCurrentStage = (stage: string): boolean => {
  return characterStore.currentMagicStage === stage
}

const spellsHeaders = ref([
  { title: 'Spell', key: 'name', align: 'start' as const },
  { title: 'Level', key: 'level', align: 'center' as const },
  { title: 'School', key: 'school', align: 'center' as const },
  { title: 'Source', key: 'source', align: 'end' as const }
])

const selectedSpellsHeaders = ref([
  { title: 'Selected Spell', key: 'name', align: 'start' as const },
  { title: 'Level', key: 'level', align: 'center' as const },
  { title: 'School', key: 'school', align: 'center' as const },
  { title: 'Source', key: 'source', align: 'end' as const }
])

const allSpells = computed(() => characterStore.elements.spells || [])
const selectedSpells = computed(() => characterStore.character.spells || [])

// Check if chosen class has spellcasting support in elements XMLs
const classSupportsSpells = computed(() => {
  const currentClass = characterStore.character.class
  if (!currentClass) return false

  const allSpellsList = allSpells.value
  const classNameLower = currentClass.toLowerCase()
  return allSpellsList.some((spell: any) => {
    if (!spell.supports) return false
    const classes = spell.supports.split(',').map((s: string) => s.trim().toLowerCase())
    return classes.includes(classNameLower)
  })
})

const filteredSpells = computed(() => {
  const activeOnly = (allSpells.value || []).filter((item: any) => characterStore.isSourceActive(item.source))
  
  // Filter by supported class if a class is chosen
  let list = activeOnly
  const currentClass = characterStore.character.class
  if (currentClass) {
    const classNameLower = currentClass.toLowerCase()
    list = activeOnly.filter((spell: any) => {
      if (!spell.supports) return false
      const classes = spell.supports.split(',').map((s: string) => s.trim().toLowerCase())
      return classes.includes(classNameLower)
    })
  } else {
    return []
  }

  if (!searchQuery.value) return list
  const query = searchQuery.value.toLowerCase()
  return list.filter(
    (item: any) =>
      item.name.toLowerCase().includes(query) ||
      (item.school && item.school.toLowerCase().includes(query)) ||
      (item.source && item.source.toLowerCase().includes(query))
  )
})

const handleDoubleClick = (event: any, { item }: any) => {
  if (!characterStore.character.spells) {
    characterStore.character.spells = []
  }
  const exists = characterStore.character.spells.some((s: any) => s.id === item.id)
  if (!exists) {
    characterStore.character.spells.push(item)
  }
}

const handleRemoveSpell = (event: any, { item }: any) => {
  if (characterStore.character.spells) {
    characterStore.character.spells = characterStore.character.spells.filter(
      (s: any) => s.id !== item.id
    )
  }
}

const handleRowClick = (event: any, { item }: any) => {
  selectedSpell.value = item
}

const rowProps = (data: any) => {
  const isSelected = selectedSpell.value && selectedSpell.value.id === data.item.id
  return {
    class: isSelected ? 'v-theme--selected' : ''
  }
}

onMounted(() => {
  if (filteredSpells.value && filteredSpells.value.length > 0) {
    selectedSpell.value = filteredSpells.value[0]
  }
})
</script>

<style scoped>
.v-btn {
  opacity: 0.4;
}
.active {
  opacity: 1 !important;
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
