<template>
  <v-app-bar color="primary" density="comfortable" elevation="24">
    <v-item-group mandatory class="mx-2"
      ><v-item class="mr-2">Start</v-item><v-item class="mr-2">Builder</v-item></v-item-group
    >
    <template #append>
      <v-btn
        :prepend-icon="mdiHome"
        variant="text"
        :class="{ active: isCurrentRoute('/') }"
        @click="handleRoute('/')"
      >
        {{ t('title.main') }}
      </v-btn>
      <v-btn
        :prepend-icon="mdiFitToScreenOutline"
        variant="text"
        :class="{ active: isCurrentRoute('/second') }"
        @click="handleRoute('/second')"
      >
        {{ t('title.builder') }}
      </v-btn>
      <v-btn icon @click="handleOpenGitHub"><v-icon :icon="mdiGithub" /></v-btn>
    </template>
  </v-app-bar>
  <v-app-bar color="primary" density="compact" height="50">
    <v-item-group class="mx-2" mandatory>
      <v-item>Character Collection</v-item>
      <v-item class="mr-2">Sources</v-item>
      <v-item class="mr-2">Additional Sources</v-item></v-item-group
    >
  </v-app-bar>
</template>
<script setup lang="tsx">
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { mdiFitToScreenOutline, mdiGithub, mdiHome } from '@mdi/js'
import { openExternal } from '@/renderer/utils'

const router = useRouter()
const route: any = useRoute()
// const titleKey: string = (route?.meta?.titleKey || 'title.main') as string

const { t } = useI18n()

const handleRoute = (path: string): void => {
  router.push(path)
}

const isCurrentRoute = (path: string): boolean => {
  return path === route.path
}

const handleOpenGitHub = async (): Promise<void> => {
  await openExternal('https://github.com/Jackietkfrost/RavenCM')
}
</script>
<style scoped>
.v-btn {
  opacity: 0.4;
}
.active {
  opacity: 1 !important;
}
</style>
