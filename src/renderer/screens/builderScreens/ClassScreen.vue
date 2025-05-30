<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="11" sm="6">
        <v-text-field
          :prepend-inner-icon="mdiMagnify"
          variant="solo"
          density="compact"
          label="Search"
        ></v-text-field>
      </v-col>
      <v-col class="d-flex justify-end" cols="1" sm="6">
        <v-btn icon>
          <v-icon :icon="mdiFilterMenuOutline" />
        </v-btn>
      </v-col>
    </v-row>
    <v-card>
      <v-card-title>
        <v-row no-gutters @click="() => (isExpanded = !isExpanded)">
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
                characterStore.character.class ? characterStore.character.class.length > 0 : false
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
        :items="items"
        :item-value="(item) => item.id"
        hover
        @dblclick:row="handleDoubleClick"
      >
      </v-data-table-virtual>
    </v-card>
  </v-container>
</template>

<script setup lang="tsx">
import { useAppStore } from '@/renderer/store/appStore'
import { mdiChevronDown, mdiChevronUp, mdiFilterMenuOutline, mdiMagnify } from '@mdi/js'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const characterStore = useAppStore()
const isExpanded = ref(true)
const textFieldValue = ref(characterStore.character.class ? characterStore.character.class : '')
const classes = characterStore.classes
const headers = ref([
  { title: 'Class', key: 'name', align: 'start' as const },
  { title: '', key: 'description', align: 'center' as const },
  { title: 'Source', key: 'source', align: 'end' as const }
])
const items = ref(classes)

const handleDoubleClick = (event: any, { item }: any) => {
  characterStore.character.class = item.name
  textFieldValue.value = item.name
  isExpanded.value = !isExpanded.value
}

const onClear = () => {
  characterStore.character.class = ''
}
</script>
<style scoped>
.class-box {
  cursor: pointer;
}
</style>
