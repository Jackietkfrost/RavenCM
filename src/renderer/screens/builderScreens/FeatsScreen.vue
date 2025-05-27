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
    <v-expansion-panels>
      <v-expansion-panel>
        <v-expansion-panel-title>
          <v-row no-gutters>
            <v-col class="d-flex justify-start" cols="4"> {{ t('BuildScreen.feat') }} </v-col>
            <v-col class="text--secondary" cols="8">
              <v-fade-transition leave-absolute>
                <v-row style="width: 100%" no-gutters>
                  <v-col class="d-flex justify-start" cols="6">
                    {{ characterStore.character?.feat ?? '' }}
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
import { useAppStore } from '@/renderer/store/appStore'
import { mdiFilterMenuOutline, mdiMagnify } from '@mdi/js'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const characterStore = useAppStore()
</script>
