import { defineStore } from 'pinia'
type CharacterInfo = {
  name: string
  avatar: string | null
  class: string | null
  race: string | null
  pronouns: string | null
  level: number
  background: string | null
  archetype: string | null
  alignment: string | null
  languages: string | null
  proficiency: string | null
  feat: string | null
  abilityGenerationOption: string
}

type RaceInfo = {
  name: string
  type: string
  source: string
  id: string
  description: string
}
interface State {
  count: number
  character: CharacterInfo
  characters: any
  races: RaceInfo[]
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
      character: {
        name: '',
        avatar: null,
        class: null,
        race: null,
        pronouns: null,
        level: 1,
        background: null,
        archetype: null,
        alignment: null,
        languages: null,
        proficiency: null,
        feat: null,
        abilityGenerationOption: ''
      },
      characters: [],
      races: [],
      createCharacter: false,
      currentStartStage: 'character-collection',
      currentBuildStage: 'race',
      currentMagicStage: 'spells',
      currentEquipmentStage: 'equipment',
      currentManageStage: 'character'
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
    },
    addIndexUrl(url: string) {
      window.mainApi.invoke('msgDownloadIndex', url)
    }
  }
})
