<template>
  <v-container fluid class="pa-4">
    <!-- Top Action bar -->
    <v-row no-gutters class="align-center mb-4 pb-2 border-bottom">
      <v-col cols="12" md="4" class="d-flex align-center gap-x-2">
        <v-btn
          color="primary"
          variant="flat"
          size="small"
          :prepend-icon="mdiContentSave"
          @click="saveDefaultSources"
        >
          Save As Default
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          size="small"
          :prepend-icon="mdiDownload"
          @click="loadDefaultSources"
          class="ml-2"
        >
          Load Default
        </v-btn>
      </v-col>

      <v-col cols="12" md="8" class="d-flex justify-end align-center gap-x-4">
        <v-btn
          color="primary"
          variant="flat"
          size="small"
          class="mr-4 text-none"
          @click="applyRestrictionsBtn"
        >
          Apply Source Restrictions
        </v-btn>
        <v-checkbox
          label="Restrict Playtest Material"
          v-model="restrictPlaytest"
          hide-details
          density="compact"
          class="mr-4 mt-0"
        ></v-checkbox>
        <span class="text-caption text-grey ml-4 text-truncate" v-if="selectedSource">
          View Compendium: {{ selectedSource.name }}
        </span>
      </v-col>
    </v-row>

    <!-- Main Content Row -->
    <v-row style="height: calc(100vh - 220px);">
      <!-- Column 1: Categories -->
      <v-col cols="3" class="d-flex flex-column justify-space-between h-100">
        <div class="overflow-y-auto" style="max-height: calc(100vh - 300px);">
          <v-card
            v-for="cat in categories"
            :key="cat"
            class="mb-3 category-card text-left"
            :class="{ active: selectedCategory === cat }"
            @click="selectedCategory = cat"
            variant="outlined"
          >
            <div class="d-flex justify-space-between align-center px-4 py-3">
              <div class="d-flex flex-column">
                <span class="text-subtitle-2 font-weight-bold text-uppercase" style="letter-spacing: 0.05em">
                  {{ cat }}
                </span>
                <span class="text-caption text-grey mt-1">
                  {{ getCategoryStatus(cat) }}
                </span>
              </div>
              <v-checkbox-btn
                :model-value="isCategoryAllEnabled(cat)"
                @click.stop="toggleCategory(cat)"
                density="compact"
              ></v-checkbox-btn>
            </div>
          </v-card>
        </div>

        <!-- Legend at the bottom-left -->
        <div class="legend-panel pa-3 border-top mt-2">
          <div class="d-flex align-center mb-1 text-caption text-grey">
            <span class="dot playtest-dot mr-2"></span>
            Playtest Material
          </div>
          <div class="d-flex align-center mb-1 text-caption text-grey">
            <span class="dot incomplete-dot mr-2"></span>
            Incomplete Source
          </div>
          <div class="d-flex align-center text-caption text-grey">
            <span class="dot info-dot mr-2"></span>
            Additional Information
          </div>
        </div>
      </v-col>

      <!-- Column 2: Sources Grid -->
      <v-col cols="5" class="h-100 overflow-y-auto pr-3">
        <v-row no-gutters>
          <v-col
            v-for="source in filteredSources"
            :key="source.id"
            cols="12"
            class="mb-2"
          >
            <v-card
              class="source-card text-left"
              :class="{ selected: selectedSource && selectedSource.id === source.id }"
              @click="selectedSource = source"
              variant="outlined"
            >
              <div class="d-flex justify-space-between align-center px-3 py-2">
                <div class="d-flex flex-column flex-grow-1 mr-2 text-truncate">
                  <span class="text-subtitle-2 font-weight-bold text-truncate" style="line-height: 1.2;">
                    {{ source.name }}
                  </span>
                  <span class="text-caption text-grey text-truncate mt-0.5">
                    {{ source.setters?.author || 'Wizards of the Coast' }}
                  </span>
                </div>
                
                <div class="d-flex align-center">
                  <!-- Indicator dots bottom-right style -->
                  <div class="d-flex gap-x-1 mr-2">
                    <span
                      v-if="source.setters?.playtest === 'true'"
                      class="tag-box playtest-bg"
                      title="Playtest Material"
                    ></span>
                    <span
                      v-if="source.setters?.official !== 'true'"
                      class="tag-box incomplete-bg"
                      title="Incomplete / Unofficial"
                    ></span>
                  </div>
                  <v-checkbox-btn
                    v-model="enabledSources[source.id]"
                    density="compact"
                    @click.stop
                  ></v-checkbox-btn>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-col>

      <!-- Column 3: Source details preview -->
      <v-col cols="4" class="h-100">
        <v-card
          variant="outlined"
          class="d-flex flex-column h-100"
          style="border-color: rgba(128, 128, 128, 0.2);"
        >
          <template v-if="selectedSource">
            <!-- Header -->
            <div class="px-4 py-3 border-bottom d-flex flex-column">
              <span class="text-h6 font-weight-bold text-uppercase" style="letter-spacing: 0.05em; line-height: 1.2;">
                {{ selectedSource.name }}
              </span>
              <span
                v-if="selectedSource.setters?.playtest === 'true'"
                class="text-caption text-orange font-weight-bold mt-1 text-uppercase"
              >
                Playtest Material
              </span>
            </div>

            <!-- Body -->
            <div class="flex-grow-1 overflow-y-auto px-4 py-3 description-content">
              <div v-html="selectedSource.htmlDescription" class="mb-4"></div>

              <div class="mb-2" v-if="selectedSource.setters?.url">
                <div class="text-caption font-weight-bold text-uppercase text-grey">Source URL</div>
                <a
                  href="#"
                  @click.prevent="openExternalLink(selectedSource.setters.url)"
                  class="text-caption text-primary"
                >
                  {{ selectedSource.name }} URL
                </a>
              </div>

              <div class="mb-4" v-if="selectedSource.setters?.author">
                <div class="text-caption font-weight-bold text-uppercase text-grey">Author</div>
                <a
                  href="#"
                  @click.prevent="openExternalLink(selectedSource.setters.authorUrl || 'http://dnd.wizards.com')"
                  class="text-caption text-primary"
                >
                  {{ selectedSource.setters.author }}
                </a>
              </div>

              <!-- Cover Image Display -->
              <div v-if="selectedSource.setters?.image" class="mt-4 text-center">
                <v-img
                  :src="selectedSource.setters.image"
                  max-width="180"
                  max-height="250"
                  class="mx-auto rounded elevation-4"
                  cover
                >
                  <template #placeholder>
                    <div class="d-flex align-center justify-center fill-height bg-grey-darken-4">
                      <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
                    </div>
                  </template>
                </v-img>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="d-flex align-center justify-center fill-height text-grey">
              Select a source to view details
            </div>
          </template>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="tsx">
import { useAppStore } from '@/renderer/store/appStore'
import { mdiContentSave, mdiDownload } from '@mdi/js'
import { ref, computed, onMounted, watch } from 'vue'

const characterStore = useAppStore()
const selectedCategory = ref('')
const selectedSource = ref<any>(null)

const restrictPlaytest = ref(false)

const enabledSources = ref<Record<string, boolean>>({})

const applyRestrictionsBtn = () => {
  characterStore.activeSources = { ...enabledSources.value }
  characterStore.validateSelectedElements()
  saveDefaultSources()
}

const allSources = computed(() => {
  return characterStore.elements.sources || []
})

// Dynamic categories derived directly from unique source attributes in the loaded XML sources
const categories = computed(() => {
  const uniqueCats = new Set<string>()
  allSources.value.forEach((s: any) => {
    if (s.source) {
      uniqueCats.add(s.source)
    }
  })
  const arr = Array.from(uniqueCats)
  if (arr.length === 0) {
    return ['Core']
  }
  return arr.sort()
})

// Automatically select the first category if none is selected or the selected one is no longer present
watch(
  categories,
  (newCats) => {
    if (newCats && newCats.length > 0 && (!selectedCategory.value || !newCats.includes(selectedCategory.value))) {
      selectedCategory.value = newCats[0]
    }
  },
  { immediate: true }
)

// Helper to determine category of a source (drawing directly from source attribute in XML)
const getSourceCategory = (source: any): string => {
  return source.source || 'Core'
}

// Group sources by category dynamically
const sourcesByCategory = computed(() => {
  const map: Record<string, any[]> = {}
  
  categories.value.forEach((cat) => {
    map[cat] = []
  })
  
  allSources.value.forEach((s: any) => {
    const cat = getSourceCategory(s)
    if (map[cat]) {
      map[cat].push(s)
    } else {
      if (!map[cat]) {
        map[cat] = []
      }
      map[cat].push(s)
    }
  })
  
  return map
})

// Filter sources by current category and playtest restrictions
const filteredSources = computed(() => {
  let list = sourcesByCategory.value[selectedCategory.value] || []
  
  if (restrictPlaytest.value) {
    list = list.filter((s: any) => s.setters?.playtest !== 'true')
  }
  
  return list
})

// Category status helper string
const getCategoryStatus = (cat: string): string => {
  const list = sourcesByCategory.value[cat] || []
  const enabledCount = list.filter((s: any) => enabledSources.value[s.id]).length
  
  if (enabledCount === list.length) {
    return `All ${list.length} Sources Included`
  }
  return `${enabledCount} of ${list.length} Sources Included`
}

const isCategoryAllEnabled = (cat: string): boolean => {
  const list = sourcesByCategory.value[cat] || []
  if (list.length === 0) return false
  return list.every((s: any) => enabledSources.value[s.id])
}

const toggleCategory = (cat: string) => {
  const list = sourcesByCategory.value[cat] || []
  const allEnabled = isCategoryAllEnabled(cat)
  
  list.forEach((s: any) => {
    enabledSources.value[s.id] = !allEnabled
  })
}

const openExternalLink = (url: string) => {
  if (url) {
    window.mainApi.send('msgOpenExternalLink', url)
  }
}

// LocalStorage routines for Save/Load defaults
const saveDefaultSources = () => {
  localStorage.setItem('defaultSources', JSON.stringify(enabledSources.value))
}

const loadDefaultSources = () => {
  const data = localStorage.getItem('defaultSources')
  if (data) {
    try {
      enabledSources.value = JSON.parse(data)
    } catch (e) {
      console.error('Failed loading default sources', e)
    }
  }
}

// Watch sources to initialize selection
watch(filteredSources, (newList) => {
  if (newList && newList.length > 0) {
    if (!selectedSource.value || !newList.some((s: any) => s.id === selectedSource.value.id)) {
      selectedSource.value = newList[0]
    }
  } else {
    selectedSource.value = null
  }
}, { immediate: true })

onMounted(() => {
  const storeActive = characterStore.activeSources
  if (storeActive && Object.keys(storeActive).length > 0) {
    enabledSources.value = { ...storeActive }
  } else {
    loadDefaultSources()
  }

  allSources.value.forEach((s: any) => {
    if (enabledSources.value[s.id] === undefined) {
      enabledSources.value[s.id] = true
    }
  })
  
  if (filteredSources.value && filteredSources.value.length > 0) {
    selectedSource.value = filteredSources.value[0]
  }
})
</script>

<style scoped>
.border-bottom {
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
}
.border-top {
  border-top: 1px solid rgba(128, 128, 128, 0.2);
}
.gap-x-2 {
  column-gap: 8px;
}
.gap-x-1 {
  column-gap: 4px;
}

.category-card {
  border-color: rgba(128, 128, 128, 0.2);
  cursor: pointer;
  transition: all 0.2s ease;
}
.category-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.5);
  background-color: rgba(var(--v-theme-surface-variant), 0.02);
}
.category-card.active {
  border-color: rgb(var(--v-theme-primary)) !important;
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.source-card {
  border-color: rgba(128, 128, 128, 0.2);
  cursor: pointer;
  transition: all 0.2s ease;
}
.source-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.4);
  background-color: rgba(var(--v-theme-surface-variant), 0.02);
}
.source-card.selected {
  border-color: rgb(var(--v-theme-primary)) !important;
  background-color: rgba(var(--v-theme-primary), 0.05);
}

/* Legend items style */
.legend-panel {
  background-color: rgba(var(--v-theme-surface-variant), 0.05);
  border-radius: 4px;
}
.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.playtest-dot {
  background-color: #ff5722;
}
.incomplete-dot {
  background-color: #ffeb3b;
}
.info-dot {
  background-color: #2196f3;
}

.tag-box {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 2px;
}
.playtest-bg {
  background-color: #ff5722;
}
.incomplete-bg {
  background-color: #ffeb3b;
}

.description-content :deep(p) {
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 12px;
}
.description-content :deep(strong) {
  color: rgb(var(--v-theme-primary));
}
.description-content :deep(i) {
  font-style: italic;
}
</style>
