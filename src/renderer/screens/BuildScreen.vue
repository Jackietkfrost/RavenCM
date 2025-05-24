<template>
  <v-app-bar color="primary" density="compact" height="50">
    <v-btn
      variant="text"
      :class="{ active: characterStore.currentBuildStage === 'race' }"
      @click="handlePage('race')"
      >{{ t('BuildScreen.race') }}</v-btn
    >
    <v-btn
      variant="text"
      :class="{ active: characterStore.currentBuildStage === 'class' }"
      @click="handlePage('class')"
      >{{ t('BuildScreen.class') }}</v-btn
    >
    <v-btn
      variant="text"
      :class="{ active: characterStore.currentBuildStage === 'background' }"
      @click="handlePage('background')"
      >{{ t('BuildScreen.background') }}</v-btn
    >
    <v-btn
      variant="text"
      :class="{ active: characterStore.currentBuildStage === 'ability-scores' }"
      @click="handlePage('ability-scores')"
      >{{ t('BuildScreen.ability-scores') }}</v-btn
    >
    <v-btn
      variant="text"
      :class="{ active: characterStore.currentBuildStage === 'languages' }"
      @click="handlePage('languages')"
      >{{ t('BuildScreen.languages') }}</v-btn
    >
    <v-btn
      variant="text"
      :class="{ active: characterStore.currentBuildStage === 'proficiency' }"
      @click="handlePage('proficiency')"
      >{{ t('BuildScreen.proficiency') }}</v-btn
    >
    <v-btn
      variant="text"
      :class="{ active: characterStore.currentBuildStage === 'feats' }"
      @click="handlePage('feats')"
      >{{ t('BuildScreen.feats') }}</v-btn
    >
  </v-app-bar>
  <v-container>
    <v-row no-gutters>
      <v-col cols="11" sm="6">
        <v-text-field :prepend-inner-icon="mdiMagnify" variant="solo" label="Search"></v-text-field>
      </v-col>
      <v-col class="d-flex justify-end" cols="1" sm="6">
        <v-btn icon>
          <v-icon :icon="mdiFilterMenuOutline" />
        </v-btn>
      </v-col>
    </v-row>
    <v-expansion-panels>
      <v-expansion-panel>
        <v-expansion-panel-title>
          <v-row no-gutters>
            <v-col class="d-flex justify-start" cols="4"> RACE </v-col>
            <v-col class="text--secondary" cols="8">
              <v-fade-transition leave-absolute>
                <v-row style="width: 100%" no-gutters>
                  <v-col class="d-flex justify-start" cols="6">
                    {{ characterStore.character?.race ?? '' }}
                  </v-col>
                </v-row>
              </v-fade-transition>
            </v-col>
          </v-row>
        </v-expansion-panel-title>
        <v-expansion-panel-text> </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<script setup lang="tsx">
import { mdiFilterMenuOutline, mdiMagnify } from '@mdi/js'
import { useAppStore } from '../store/appStore'
import { useI18n } from 'vue-i18n'
// import { ref } from 'vue'

const { t } = useI18n()
// const currentPage = ref(0)
const characterStore = useAppStore()

const handlePage = (value: string): void => {
  console.log(value)
  characterStore.currentBuildStage = value
}
</script>
