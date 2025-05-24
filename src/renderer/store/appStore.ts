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
  abilityGenerationOption: string
}
interface State {
  count: number
  character: CharacterInfo | null
  characters: any
  createCharacter: boolean
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
      currentBuildStage: null,
      currentMagicStage: null,
      currentEquipmentStage: null,
      currentManageStage: null
    }
  },
  getters: {
    getIsCreatingCharacter: (state) => state.createCharacter
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
