import { defineStore } from 'pinia'
import { CharacterInfo, ElementsInfo } from '../utils/dnd-typing'

interface State {
  count: number
  character: CharacterInfo
  characters: CharacterInfo[]
  elements: ElementsInfo
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
        avatar: '',
        class: '',
        race: '',
        pronouns: '',
        level: 1,
        background: {
          name: '',
          description: '',
          id: '',
          source: ''
        },
        archetype: '',
        alignment: '',
        languages: [],
        proficiency: '',
        feat: '',
        abilityGenerationOption: '',
        spells: []
      },
      characters: [],
      elements: {
        races: [],
        classes: [],
        spells: [],
        languages: [],
        items: [],
        companions: [],
        feats: [],
        grants: [],
        rules: [],
        magicItems: [],
        backgrounds: [],
        equipment: [],
        archetypes: [],
        archetypeFeatures: []
      },
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
