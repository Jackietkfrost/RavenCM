<template>
  <v-app-bar color="subheader" density="compact" height="50">
    <v-btn
      variant="text"
      :class="{ active: characterStore.currentEquipmentStage === 'equipment' }"
      @click="handlePage('equipment')"
      >{{ t('EquipmentScreen.equipment') }}</v-btn
    >
    <v-btn
      variant="text"
      :class="{ active: characterStore.currentEquipmentStage === 'inventory' }"
      @click="handlePage('inventory')"
      >{{ t('EquipmentScreen.inventory') }}</v-btn
    >
    <v-btn
      variant="text"
      :class="{ active: characterStore.currentEquipmentStage === 'additional' }"
      @click="handlePage('additional')"
    >
      {{ t('EquipmentScreen.additional') }}
    </v-btn>
  </v-app-bar>
  <v-container fluid>
    <EquipmentsScreen v-if="characterStore.currentEquipmentStage === 'equipment'" />
    <InventoryScreen v-else-if="characterStore.currentEquipmentStage === 'inventory'" />
    <AdditionalScreen v-else-if="characterStore.currentEquipmentStage === 'additional'" />
  </v-container>
</template>
<script setup lang="tsx">
import { useI18n } from 'vue-i18n'
import { useAppStore } from '../store/appStore'
import EquipmentsScreen from '../screens/equipmentScreens/EquipmentsScreen.vue'
import InventoryScreen from '../screens/equipmentScreens/InventoryScreen.vue'
import AdditionalScreen from '../screens/equipmentScreens/AdditionalScreen.vue'

const characterStore = useAppStore()

const handlePage = (page: string) => {
  characterStore.currentEquipmentStage = page
}

const { t } = useI18n()
</script>
