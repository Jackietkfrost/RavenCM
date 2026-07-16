<template>
  <v-container fluid class="pa-0">
    <v-row>
      <!-- Left Column (Welcome, New Character, What's New) -->
      <v-col cols="12" md="4" lg="3">
        <div class="welcome-section mb-6">
          <h3 class="text-subtitle-1 font-weight-bold text-uppercase mb-2 text-primary">
            Welcome to Raven CM
          </h3>
          <p class="text-body-2 text-medium-emphasis">
            Your characters are ready for you to load, level up, and manage. Additionally, your
            characters can be grouped together and those marked as favorite are listed first in the
            group they are in.
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
            <div class="text-overline font-weight-black text-white" style="line-height: 1.2"
              >NEW CHARACTER</div
            >
            <div class="text-caption text-white-70">CREATE A NEW CHARACTER</div>
          </div>
        </v-card>

        <div class="whats-new-section">
          <h3 class="text-subtitle-1 font-weight-bold text-uppercase mb-2 text-primary">
            What's New
          </h3>
          <v-divider class="mb-2" />
          <p class="text-body-2 text-medium-emphasis" style="white-space: pre-wrap;">
            {{ releaseNotes }}
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
          <div v-for="(chars, groupName) in groupedCharacters" :key="groupName" class="mb-8">
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
                    style="
                      position: absolute;
                      top: 4px;
                      left: 4px;
                      z-index: 10;
                      border-radius: 4px;
                      padding: 2px;
                    "
                    @click.stop="openEditGroupDialog(character)"
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
                    style="
                      position: absolute;
                      top: 4px;
                      right: 4px;
                      z-index: 10;
                      border-radius: 4px;
                      padding: 2px;
                    "
                    @click.stop="openDeleteConfirmDialog(character)"
                  >
                    <v-icon :icon="mdiClose" size="14" color="white" />
                  </v-btn>

                  <!-- Image and Info bottom bar -->
                  <v-img
                    :src="character.avatar || '/images/icon-64px.png'"
                    height="180"
                    cover
                    style="background-color: rgba(var(--v-theme-surface-variant), 0.2)"
                  >
                    <div
                      class="translucent-bottom-bar px-3 py-2 d-flex flex-column justify-center"
                      style="
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        background-color: rgba(0, 0, 0, 0.65);
                        height: 60px;
                      "
                    >
                      <div
                        class="text-subtitle-2 font-weight-bold text-uppercase text-truncate yellow-text"
                      >
                        {{ character.name }}
                      </div>
                      <div
                        class="text-caption text-uppercase text-truncate cyan-text mt-0.5"
                        style="font-size: 0.72rem; letter-spacing: 0.02em"
                      >
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

    <!-- Context Menu Dropdown -->
    <v-menu v-model="showMenu" :target="[menuX, menuY]">
      <v-list density="compact" width="160">
        <v-list-item @click="handleSelectCharacter(selectedCharForMenu)">
          <v-list-item-title>Select</v-list-item-title>
        </v-list-item>
        <v-list-item @click="openEditGroupDialog(selectedCharForMenu)">
          <v-list-item-title>Modify</v-list-item-title>
        </v-list-item>
        <v-list-item @click="openDeleteConfirmDialog(selectedCharForMenu)">
          <v-list-item-title>Delete</v-list-item-title>
        </v-list-item>
        <v-list-item @click="handleShowLocation(selectedCharForMenu)">
          <v-list-item-title>Show Location</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- Edit Group Dialog Popup -->
    <v-dialog v-model="showEditGroupDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">
          Edit Character Group
        </v-card-title>
        <v-card-text class="pt-2">
          <v-text-field
            label="Character Group"
            v-model="editGroupVal"
            variant="outlined"
            density="compact"
            hide-details
            class="mt-2"
          />
        </v-card-text>
        <v-card-actions class="justify-end px-6 pb-4">
          <v-btn
            variant="text"
            color="grey-darken-1"
            @click="showEditGroupDialog = false"
            class="text-none"
          >
            Cancel
          </v-btn>
          <v-btn
            variant="flat"
            color="primary"
            @click="handleSaveGroup"
            class="text-none"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirm Dialog Popup -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold text-error">
          Delete Character?
        </v-card-title>
        <v-card-text class="pt-2">
          Do you want to delete <strong>{{ selectedCharForDelete?.name }}</strong>? This action cannot be undone.
        </v-card-text>
        <v-card-actions class="justify-end px-6 pb-4">
          <v-btn
            variant="text"
            color="grey-darken-1"
            @click="showDeleteDialog = false"
            class="text-none"
          >
            Cancel
          </v-btn>
          <v-btn
            variant="flat"
            color="error"
            @click="handleConfirmDelete"
            class="text-none"
          >
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="tsx">
import { useAppStore } from '@/renderer/store/appStore'
import { mdiAccountGroup, mdiPlus, mdiPencil, mdiClose } from '@mdi/js'
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const characterStore = useAppStore()
const releaseNotes = ref('Loading release notes...')

onMounted(async () => {
  try {
    const notes = await window.mainApi.invoke('msgGetReleaseNotes')
    releaseNotes.value = notes
  } catch (e) {
    console.error(e)
    releaseNotes.value = 'Failed to load release notes.'
  }
})

const hasCharacters = computed(() => characterStore.getCharacters.length > 0)

const showMenu = ref(false)
const menuX = ref(0)
const menuY = ref(0)
const selectedCharForMenu = ref<any>(null)

// Edit Group Dialog state
const showEditGroupDialog = ref(false)
const editGroupVal = ref('')
const selectedCharForEdit = ref<any>(null)

// Delete Confirm Dialog state
const showDeleteDialog = ref(false)
const selectedCharForDelete = ref<any>(null)

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

const openEditGroupDialog = (character: any) => {
  if (character) {
    selectedCharForEdit.value = character
    editGroupVal.value = character.group || 'Characters'
    showEditGroupDialog.value = true
  }
}

const handleSaveGroup = async () => {
  if (selectedCharForEdit.value && selectedCharForEdit.value.filePath) {
    try {
      const res = await window.mainApi.invoke(
        'msgUpdateCharacterGroup',
        selectedCharForEdit.value.filePath,
        editGroupVal.value
      )
      if (res && res.success) {
        // Refresh character collection list
        const chars = await window.mainApi.invoke('msgGetCharacters')
        characterStore.characters = chars
      } else {
        console.error('Failed to update group:', res?.error)
      }
    } catch (e) {
      console.error('Error saving character group', e)
    }
  }
  showEditGroupDialog.value = false
}

const openDeleteConfirmDialog = (character: any) => {
  if (character) {
    selectedCharForDelete.value = character
    showDeleteDialog.value = true
  }
}

const handleConfirmDelete = async () => {
  if (selectedCharForDelete.value && selectedCharForDelete.value.filePath) {
    try {
      const res = await window.mainApi.invoke(
        'msgDeleteCharacter',
        selectedCharForDelete.value.filePath
      )
      if (res && res.success) {
        // If this character is currently loaded, clear it in the store
        if (
          characterStore.character &&
          characterStore.character.name === selectedCharForDelete.value.name
        ) {
          characterStore.setCharacter({} as any) // clear selection
        }

        // Refresh character collection list
        const chars = await window.mainApi.invoke('msgGetCharacters')
        characterStore.characters = chars
      } else {
        console.error('Failed to delete character:', res?.error)
      }
    } catch (e) {
      console.error('Error deleting character', e)
    }
  }
  showDeleteDialog.value = false
}
</script>

<style scoped>
.new-character-card {
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-primary)) 0%,
    rgb(var(--v-theme-button)) 100%
  );
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
