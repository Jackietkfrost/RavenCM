import { defineStore } from 'pinia'
type CharacterInfo = {
  name: string
  avatar: string
  class?: string
  race?: string
  pronouns: string
  level: number
  background?: string
  archetype?: string
  alignment?: string
  languages?: string
  proficiency?: string
  feat?: string
  abilityGenerationOption: string
}
interface State {
  count: number
  character: CharacterInfo | null
  characters: any
  createCharacter: boolean
  currentStartStage: any
  currentBuildStage: any
  currentMagicStage: any
  currentEquipmentStage: any
  currentManageStage: any
}

export const useAppStore = defineStore('appstore', {
  state: (): State => {
    return {
      count: 0,
      character: null,
      characters: [],
      createCharacter: false,
      currentStartStage: null,
      currentBuildStage: null,
      currentMagicStage: null,
      currentEquipmentStage: null,
      currentManageStage: null
    }
  },
  getters: {
    getIsCreatingCharacter: (state) => state.createCharacter,
    getCharacters: (state) => state.characters
  },
  actions: {
    increaseCount(amount: number) {
      this.count += amount
    },
    toggleCreateCharacter() {
      this.createCharacter = !this.createCharacter
    },
    setCharacter(data: CharacterInfo) {
      this.character = data
    }
  }
})
