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
        equipment: []
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
    async addIndexUrl(url: string) {
      try {
        const result = await window.mainApi.invoke('msgDownloadIndex', url)
        console.log('Download result:', result)
        
        if (result.success) {
          console.log(`✅ ${result.message}`)
          // You could add a toast notification or update UI state here
          return result
        } else {
          console.error('❌ Download failed:', result.message)
          // You could show an error notification here
          return result
        }
      } catch (error) {
        console.error('❌ Error downloading index:', error)
        return { success: false, message: 'Failed to download index', error: String(error) }
      }
    }
  }
})
