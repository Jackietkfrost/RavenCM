<template>
  <v-row>
    <v-col cols="2">
      <v-card color="primary" max-height="300">
        <v-card-title>Categories</v-card-title>
        <v-list bg-color="background" :items="items" mandatory> </v-list>
      </v-card>
    </v-col>
    <v-col cols="10">
      <v-data-table-virtual></v-data-table-virtual>
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="12">
      <v-data-table-virtual />
    </v-col>
  </v-row>
</template>

<script setup lang="tsx">
import { ref } from 'vue'

const items = ref([
  {title:'All Categories', value: '0'},
  {title:'TEST2', value: '2'},
  {title:'TEST3', value: '3'},
  {title:'TEST4', value: '4'},
  {title:'TEST5', value: '5'},
  {title:'TEST6', value: '6'},
  {title:'TEST7', value: '7'},
  {title:'TEST8', value: '8'},
  {title:'TEST9', value: '9'}])
</script>

<style scoped></style>
