<template>
  <v-app-bar color="subheader" density="compact" height="50">
    <v-btn variant="text" :class="{ active: isCurrentStage('race') }" @click="handlePage('race')">{{
      t('BuildScreen.race')
    }}</v-btn>
    <v-btn
      variant="text"
      :class="{ active: isCurrentStage('class') }"
      @click="handlePage('class')"
      >{{ t('BuildScreen.class') }}</v-btn
    >
    <v-btn
      variant="text"
      :class="{ active: isCurrentStage('background') }"
      @click="handlePage('background')"
      >{{ t('BuildScreen.background') }}</v-btn
    >
    <v-btn
      variant="text"
      :class="{ active: isCurrentStage('ability-scores') }"
      @click="handlePage('ability-scores')"
      >{{ t('BuildScreen.ability-scores') }}</v-btn
    >
    <v-btn
      v-if="canChooseLanguages"
      variant="text"
      :class="{ active: isCurrentStage('languages') }"
      @click="handlePage('languages')"
      >{{ t('BuildScreen.languages') }}</v-btn
    >
    <v-btn
      variant="text"
      :class="{ active: isCurrentStage('proficiency') }"
      @click="handlePage('proficiency')"
      >{{ t('BuildScreen.proficiency') }}</v-btn
    >
    <v-btn
      variant="text"
      :class="{ active: isCurrentStage('feats') }"
      @click="handlePage('feats')"
      >{{ t('BuildScreen.feats') }}</v-btn
    >
  </v-app-bar>
  <v-container>
    <RaceScreen v-if="isCurrentStage('race')" />
    <ClassScreen v-if="isCurrentStage('class')" />
    <BackgroundScreen v-if="isCurrentStage('background')" />
    <AbilityScoresScreen v-if="isCurrentStage('ability-scores')" />
    <LanguagesScreen v-if="canChooseLanguages && isCurrentStage('languages')" />
    <ProficiencyScreen v-if="isCurrentStage('proficiency')" />
    <FeatsScreen v-if="isCurrentStage('feats')" />
  </v-container>
</template>

<script setup lang="tsx">
import { useAppStore } from '../store/appStore'
import { useI18n } from 'vue-i18n'
import RaceScreen from '@/renderer/screens/builderScreens/RaceScreen.vue'
import ClassScreen from '@/renderer/screens/builderScreens/ClassScreen.vue'
import BackgroundScreen from '@/renderer/screens/builderScreens/BackgroundScreen.vue'
import AbilityScoresScreen from '@/renderer/screens/builderScreens/AbilityScoreScreen.vue'
import LanguagesScreen from '@/renderer/screens/builderScreens/LanguagesScreen.vue'
import ProficiencyScreen from '@/renderer/screens/builderScreens/ProficiencyScreen.vue'
import FeatsScreen from '@/renderer/screens/builderScreens/FeatsScreen.vue'

import { computed, onMounted, watch } from 'vue'

const { t } = useI18n()
const characterStore = useAppStore()

const canChooseLanguages = computed(() => {
  const activeRules: any[] = []
  const activeIds = new Set<string>()

  // 1. Race rules & ID
  if (characterStore.character.race) {
    const raceEl = characterStore.elements.races.find(
      (r: any) => r.name === characterStore.character.race
    )
    if (raceEl) {
      activeIds.add(raceEl.id)
      if (raceEl.rules) activeRules.push(...raceEl.rules)
    }
  }

  // 2. Subrace rules & ID
  if (characterStore.character.subrace) {
    const subraceEl = (characterStore.elements.subRaces || []).find(
      (s: any) => s.name === characterStore.character.subrace
    )
    if (subraceEl) {
      activeIds.add(subraceEl.id)
      if (subraceEl.rules) activeRules.push(...subraceEl.rules)
    }
  }

  // 3. Class rules & ID
  if (characterStore.character.class) {
    const classEl = characterStore.elements.classes.find(
      (c: any) => c.name === characterStore.character.class
    )
    if (classEl) {
      activeIds.add(classEl.id)
      if (classEl.rules) activeRules.push(...classEl.rules)
    }
  }

  // 4. Subclass/Archetype rules & ID
  if (characterStore.character.archetype) {
    const archetypeEl = characterStore.elements.archetypes.find(
      (a: any) => a.name === characterStore.character.archetype
    )
    if (archetypeEl) {
      activeIds.add(archetypeEl.id)
      if (archetypeEl.rules) activeRules.push(...archetypeEl.rules)
    }
  }

  // 5. Background rules & ID
  if (characterStore.character.background && characterStore.character.background.name) {
    const backgroundEl = characterStore.elements.backgrounds.find(
      (b: any) => b.name === characterStore.character.background.name
    )
    if (backgroundEl) {
      activeIds.add(backgroundEl.id)
      if (backgroundEl.rules) activeRules.push(...backgroundEl.rules)
    }
  }

  // 6. Feats rules & ID
  if (characterStore.character.feat) {
    const featEl = characterStore.elements.feats.find(
      (f: any) => f.name === characterStore.character.feat
    )
    if (featEl) {
      activeIds.add(featEl.id)
      if (featEl.rules) activeRules.push(...featEl.rules)
    }
  }

  // Evaluator for requirement strings
  const isRuleActive = (rule: any) => {
    if (!rule.requirements) return true
    const reqs = rule.requirements.split(',').map((r: string) => r.trim())
    return reqs.every((req: string) => {
      if (req.startsWith('!')) {
        return !activeIds.has(req.slice(1))
      } else {
        return activeIds.has(req)
      }
    })
  }

  // Search if any rule is an active select of type Language
  return activeRules.some(
    (rule: any) => rule.type === 'select' && rule.selectType === 'Language' && isRuleActive(rule)
  )
})

watch(canChooseLanguages, (newVal) => {
  if (!newVal && characterStore.currentBuildStage === 'languages') {
    characterStore.currentBuildStage = 'race'
  }
})

onMounted(() => {
  if (!canChooseLanguages.value && characterStore.currentBuildStage === 'languages') {
    characterStore.currentBuildStage = 'race'
  }
})

const handlePage = (value: string): void => {
  console.log(value)
  characterStore.currentBuildStage = value
}

const isCurrentStage = (stage: string): boolean => {
  return characterStore.currentBuildStage === stage
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
