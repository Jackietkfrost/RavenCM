<template>
  <v-container fluid class="pa-0">
    <v-row>
      <!-- Left Column (Welcome, New Character, What's New) -->
      <v-col cols="12" md="4" lg="3">
        <div class="welcome-section mb-6">
          <h3 class="text-subtitle-1 font-weight-bold text-uppercase mb-2 text-primary">
            Welcome to Raven
          </h3>
          <p class="text-body-2 text-medium-emphasis">
            Your characters are ready for you to load, level up, and manage. Additionally, your characters can be grouped together and those marked as favorite are listed first in the group they are in.
          </p>
        </div>

        <!-- New Character Card Button -->
        <v-card
          class="new-character-card mb-6 d-flex flex-column justify-center"
          @click="handleStartCreateCharacter"
          ripple
          flat
        >
          <div class="new-character-content text-left">
            <div class="text-overline font-weight-black text-white" style="line-height: 1.2;">NEW CHARACTER</div>
            <div class="text-caption text-white-70">CREATE A NEW CHARACTER</div>
          </div>
        </v-card>

        <!-- What's New Section -->
        <div class="whats-new-section">
          <h3 class="text-subtitle-1 font-weight-bold text-uppercase mb-2 text-primary">
            What's New
          </h3>
          <v-divider class="mb-2" />
          <p class="text-body-2 text-medium-emphasis">
            There are no new articles available.
          </p>
        </div>
      </v-col>

      <!-- Right Column (Characters List or Empty State) -->
      <v-col cols="12" md="8" lg="9" class="ps-md-8">
        <!-- Empty State -->
        <div v-if="!hasCharacters" class="text-center py-12">
          <v-icon :icon="mdiAccountGroup" size="200" class="mb-4 text-grey-darken-1 opacity-70" />
          <h2 class="text-h4 font-weight-bold mb-2">No Characters Yet..</h2>
          <p class="text-body-1 text-medium-emphasis mb-6">
            You should create your first D&D character to get started
          </p>
          <v-btn
            color="secondary"
            size="large"
            :prepend-icon="mdiPlus"
            @click="handleStartCreateCharacter"
          >
            {{ t('menu.create-character') }}
          </v-btn>
        </div>

        <!-- Character Lists Grouped by Campaign Group -->
        <div v-else>
          <div
            v-for="(chars, groupName) in groupedCharacters"
            :key="groupName"
            class="mb-8"
          >
            <h3 class="text-subtitle-1 font-weight-bold text-uppercase mb-2 text-primary">
              {{ groupName }}
            </h3>
            <v-divider class="mb-4" />
            
            <v-row>
              <v-col
                v-for="character in chars"
                :key="character.name"
                cols="12"
                sm="6"
                md="4"
                lg="3"
              >
                <v-card
                  class="character-card position-relative overflow-hidden text-left"
                  outline
                  hover
                  @click="handleSelectCharacter(character)"
                  @contextmenu.prevent="onContextMenu($event, character)"
                >
                  <!-- Edit Button top-left -->
                  <v-btn
                    icon
                    size="24"
                    variant="flat"
                    color="rgba(0, 0, 0, 0.6)"
                    class="action-btn edit-btn"
                    style="position: absolute; top: 4px; left: 4px; z-index: 10; border-radius: 4px; padding: 2px;"
                    @click.stop
                  >
                    <v-icon :icon="mdiPencil" size="14" color="white" />
                  </v-btn>

                  <!-- Delete Button top-right -->
                  <v-btn
                    icon
                    size="24"
                    variant="flat"
                    color="rgba(0, 0, 0, 0.6)"
                    class="action-btn delete-btn"
                    style="position: absolute; top: 4px; right: 4px; z-index: 10; border-radius: 4px; padding: 2px;"
                    @click.stop
                  >
                    <v-icon :icon="mdiClose" size="14" color="white" />
                  </v-btn>

                  <!-- Image and Info bottom bar -->
                  <v-img
                    :src="character.avatar || '/images/icon-64px.png'"
                    height="180"
                    cover
                    style="background-color: rgba(var(--v-theme-surface-variant), 0.2);"
                  >
                    <div
                      class="translucent-bottom-bar px-3 py-2 d-flex flex-column justify-center"
                      style="position: absolute; bottom: 0; left: 0; right: 0; background-color: rgba(0, 0, 0, 0.65); height: 60px;"
                    >
                      <div class="text-subtitle-2 font-weight-bold text-uppercase text-truncate yellow-text">
                        {{ character.name }}
                      </div>
                      <div class="text-caption text-uppercase text-truncate cyan-text mt-0.5" style="font-size: 0.72rem; letter-spacing: 0.02em;">
                        Level {{ character.level }} {{ character.race }} {{ character.class }}
                      </div>
                    </div>
                  </v-img>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Context Menu Activator Target -->
    <div
      :style="{
        position: 'fixed',
        left: menuX + 'px',
        top: menuY + 'px',
        width: '1px',
        height: '1px',
        pointerEvents: 'none',
        zIndex: 9999
      }"
      ref="menuActivator"
    ></div>

    <!-- Context Menu Dropdown -->
    <v-menu
      v-model="showMenu"
      :activator="menuActivator"
      offset="0"
    >
      <v-list density="compact" width="160">
        <v-list-item disabled>
          <v-list-item-title>Select</v-list-item-title>
        </v-list-item>
        <v-list-item disabled>
          <v-list-item-title>Modify</v-list-item-title>
        </v-list-item>
        <v-list-item disabled>
          <v-list-item-title>Delete</v-list-item-title>
        </v-list-item>
        <v-list-item @click="handleShowLocation(selectedCharForMenu)">
          <v-list-item-title>Show Location</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-container>
</template>

<script setup lang="tsx">
import { useAppStore } from '@/renderer/store/appStore'
import { mdiAccountGroup, mdiPlus, mdiPencil, mdiClose } from '@mdi/js'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const characterStore = useAppStore()

const hasCharacters = computed(() => characterStore.getCharacters.length > 0)

// Context menu state
const showMenu = ref(false)
const menuX = ref(0)
const menuY = ref(0)
const selectedCharForMenu = ref<any>(null)
const menuActivator = ref<HTMLElement | null>(null)

// Group characters reactively by their group/campaign attribute
const groupedCharacters = computed(() => {
  const groups: Record<string, any[]> = {}
  characterStore.characters.forEach((char: any) => {
    const groupName = char.group || 'Characters'
    if (!groups[groupName]) {
      groups[groupName] = []
    }
    groups[groupName].push(char)
  })
  return groups
})

const handleStartCreateCharacter = async (): Promise<void> => {
  characterStore.toggleCreateCharacter()
}

const handleSelectCharacter = (character: any) => {
  characterStore.setCharacter(character)
}

const onContextMenu = (event: MouseEvent, character: any) => {
  event.preventDefault()
  selectedCharForMenu.value = character
  menuX.value = event.clientX
  menuY.value = event.clientY
  showMenu.value = true
}

const handleShowLocation = (character: any) => {
  if (character && character.filePath) {
    window.mainApi.send('msgShowItemInFolder', character.filePath)
  }
}
</script>

<style scoped>
.new-character-card {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-button)) 100%);
  border: 2px dashed rgba(255, 255, 255, 0.4) !important;
  border-radius: 4px;
  cursor: pointer;
  height: 80px;
  padding: 12px 20px;
  transition: all 0.3s ease;
}

.new-character-card:hover {
  border-color: rgba(255, 255, 255, 0.8) !important;
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.text-white-70 {
  color: rgba(255, 255, 255, 0.7);
}

.character-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  transition: all 0.2s ease;
  border-radius: 4px;
}

.character-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.yellow-text {
  color: #ffca28;
}

.cyan-text {
  color: #80deea;
}

.action-btn {
  transition: all 0.2s ease;
}

.action-btn:hover {
  background-color: rgba(0, 0, 0, 0.85) !important;
  transform: scale(1.05);
}
</style>
