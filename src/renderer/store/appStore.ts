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
        spells: [],
        averageHitPoints: false,
        feats: true,
        multiclassing: true,
        inventory: [],
        equipment: [],
        gender: 'Male',
        playerName: '',
        experience: 0,
        deity: '',
        age: '',
        height: '',
        weight: '',
        eyes: '',
        skin: '',
        hair: '',
        additionalFeatures: '',
        armorClass: ''
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
        archetypeFeatures: [],
        proficiencies: [],
        weapons: [],
        armors: [],
        deities: [],
        sources: []
      },
      createCharacter: false,
      activeSources: {} as Record<string, boolean>,
      currentStartStage: 'character-collection',
      currentBuildStage: 'race',
      currentMagicStage: 'spells',
      currentEquipmentStage: 'equipment',
      currentManageStage: 'character',
      autoGenerateTrigger: 0
    }
  },
  getters: {
    getIsCreatingCharacter: (state) => state.createCharacter,
    getCharacters: (state) => state.characters
  },
  actions: {
    isSourceActive(sourceName: string): boolean {
      const srcElement = (this.elements.sources || []).find((s: any) => s.name === sourceName)
      if (!srcElement) return true
      return this.activeSources[srcElement.id] !== false
    },
    validateSelectedElements() {
      if (!this.character || !this.character.name) return

      // Helper to check if source is active for a given item name
      const isAvailable = (list: any[], name: string) => {
        if (!name) return false
        const found = list.find((item: any) => item.name.toLowerCase() === name.toLowerCase())
        if (!found) return false
        return this.isSourceActive(found.source)
      }

      // Check Race
      if (this.character.race && !isAvailable(this.elements.races, this.character.race)) {
        this.character.race = ''
      }

      // Check Class
      if (this.character.class && !isAvailable(this.elements.classes, this.character.class)) {
        this.character.class = ''
      }

      // Check Background
      if (this.character.background && this.character.background.name && !isAvailable(this.elements.backgrounds, this.character.background.name)) {
        this.character.background = {
          name: '',
          description: '',
          id: '',
          source: ''
        }
      }

      // Check Feat
      if (this.character.feat && !isAvailable(this.elements.feats, this.character.feat)) {
        this.character.feat = ''
      }

      // Check Languages
      if (this.character.languages && this.character.languages.length > 0) {
        this.character.languages = this.character.languages.filter((langName: string) => 
          isAvailable(this.elements.languages, langName)
        )
      }

      // Check Spells
      if (this.character.spells && this.character.spells.length > 0) {
        this.character.spells = this.character.spells.filter((spell: any) => {
          const name = typeof spell === 'string' ? spell : spell.name
          return isAvailable(this.elements.spells, name)
        })
      }
    },
    increaseCount(amount: number) {
      this.count += amount
    },
    toggleCreateCharacter() {
      this.createCharacter = !this.createCharacter
    },
    setCharacter(data: CharacterInfo) {
      this.character = data
      this.validateSelectedElements()
    },
    addIndexUrl(url: string) {
      window.mainApi.invoke('msgDownloadIndex', url)
    },
    triggerAutoGeneratePreview() {
      this.autoGenerateTrigger += 1
    }
  }
})
