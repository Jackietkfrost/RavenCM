<template>
  <v-container fluid class="pa-4">
    <v-row>
      <v-col cols="7">
        <v-card variant="outlined" style="border-color: rgba(128, 128, 128, 0.2)">
          <v-card-title class="text-subtitle-1 font-weight-bold py-3 border-bottom">
            Additional Quest Items & Treasures
          </v-card-title>
          <v-card-text class="py-6 text-center text-grey">
            No additional quest items or treasures found.
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="5">
        <v-card
          variant="outlined"
          style="border-color: rgba(128, 128, 128, 0.2); height: calc(100vh - 220px)"
          class="d-flex align-center justify-center text-grey"
        >
          Select an item to view details
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="tsx">
// Additional items placeholder component
</script>
