import { defineStore } from 'pinia'
import { CharacterInfo, ElementsInfo } from '../utils/dnd-typing'

interface State {
  count: number
  character: CharacterInfo
  originalCharacter: CharacterInfo | null
  characters: CharacterInfo[]
  elements: ElementsInfo
  createCharacter: boolean
  showSettings: boolean
  drawerMode: 'create' | 'view'
  currentStartStage: any
  currentBuildStage: any
  currentMagicStage: any
  currentEquipmentStage: any
  currentManageStage: any
  activeSources: Record<string, boolean>
  autoGenerateTrigger: number
}

export const useAppStore = defineStore('appstore', {
  state: (): State => {
    return {
      count: 0,
      showSettings: false,
      originalCharacter: null,
      character: {
        name: '',
        avatar: '',
        class: '',
        race: '',
        subrace: '',
        group: '',
        pronouns: '',
        level: 1,
        background: {
          name: '',
          description: '',
          id: '',
          source: ''
        },
        backgroundVariant: '',
        backgroundFeature: '',
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
        playerName: localStorage.getItem('defaultPlayerName') || '',
        experience: 0,
        deity: '',
        age: '',
        height: '',
        weight: '',
        eyes: '',
        skin: '',
        hair: '',
        additionalFeatures: '',
        armorClass: '',
        str: 10,
        dex: 10,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10,
        hp: 10,
        speed: 30,
        proficientSkills: [],
        proficientSavingThrows: []
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
        classFeatures: [],
        archetypes: [],
        archetypeFeatures: [],
        proficiencies: [],
        weapons: [],
        armors: [],
        deities: [],
        sources: [],
        subRaces: [],
        raceVariants: [],
        backgroundVariants: [],
        backgroundFeatures: []
      },
      createCharacter: false,
      drawerMode: 'create',
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
    getCharacterPayload() {
      if (!this.character) return null
      return JSON.parse(
        JSON.stringify({
          characterName: this.character.name,
          race: this.character.race || '',
          subrace: this.character.subrace || '',
          backgroundVariant: this.character.backgroundVariant || '',
          backgroundFeature: this.character.backgroundFeature || '',
          class: this.character.class || '',
          archetype: this.character.archetype || '',
          background: this.character.background?.name || '',
          level: this.character.level || 1,
          group: this.character.group || '',
          pronouns: this.character.pronouns || '',
          playerName: this.character.playerName || '',
          characterExperience: this.character.experience || 0,
          generationOption: this.character.abilityGenerationOption || 'Roll 4d6 - Discard Lowest',
          abilityGenerationOption:
            this.character.abilityGenerationOption || 'Roll 4d6 - Discard Lowest',
          filePath: this.character.filePath || '',
          deity: this.character.deity || '',
          age: this.character.age || '',
          height: this.character.height || '',
          weight: this.character.weight || '',
          eyes: this.character.eyes || '',
          skin: this.character.skin || '',
          hair: this.character.hair || '',
          additionalFeatures: this.character.additionalFeatures || '',
          str: this.character.str || 10,
          dex: this.character.dex || 10,
          con: this.character.con || 10,
          int: this.character.int || 10,
          wis: this.character.wis || 10,
          cha: this.character.cha || 10,
          hp: this.character.hp || 10,
          speed: this.character.speed || 30,
          proficientSkills: this.character.proficientSkills || [],
          proficientSavingThrows: this.character.proficientSavingThrows || []
        })
      )
    },
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
      if (
        this.character.background &&
        this.character.background.name &&
        !isAvailable(this.elements.backgrounds, this.character.background.name)
      ) {
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
      if (data && data.name) {
        this.character = JSON.parse(JSON.stringify(data))
        this.validateSelectedElements()
        this.originalCharacter = JSON.parse(JSON.stringify(this.character))
      } else {
        this.character = {
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
          subrace: '',
          backgroundVariant: '',
          backgroundFeature: '',
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
          playerName: localStorage.getItem('defaultPlayerName') || '',
          experience: 0,
          deity: '',
          age: '',
          height: '',
          weight: '',
          eyes: '',
          skin: '',
          hair: '',
          additionalFeatures: '',
          armorClass: '',
          str: 10,
          dex: 10,
          con: 10,
          int: 10,
          wis: 10,
          cha: 10,
          hp: 10,
          speed: 30,
          proficientSkills: [],
          proficientSavingThrows: []
        }
        this.originalCharacter = null
        this.validateSelectedElements()
      }
    },
    hasUnsavedChanges(): boolean {
      if (!this.character || !this.character.name || !this.originalCharacter) return false

      const keysToCompare: (keyof CharacterInfo)[] = [
        'name',
        'class',
        'race',
        'subrace',
        'backgroundVariant',
        'backgroundFeature',
        'pronouns',
        'level',
        'archetype',
        'alignment',
        'gender',
        'playerName',
        'experience',
        'deity',
        'age',
        'height',
        'weight',
        'eyes',
        'skin',
        'hair',
        'additionalFeatures',
        'armorClass',
        'str',
        'dex',
        'con',
        'int',
        'wis',
        'cha',
        'hp',
        'speed',
        'feat',
        'proficiency',
        'abilityGenerationOption',
        'averageHitPoints',
        'feats',
        'multiclassing'
      ]

      for (const key of keysToCompare) {
        let val1 = this.character[key]
        let val2 = this.originalCharacter[key]

        // Normalize falsy values based on type to prevent false dirty states from undefined/null
        if (typeof val1 === 'boolean' || typeof val2 === 'boolean') {
          val1 = !!val1
          val2 = !!val2
        } else if (typeof val1 === 'number' || typeof val2 === 'number') {
          val1 = val1 || 0
          val2 = val2 || 0
        } else {
          val1 = val1 || ''
          val2 = val2 || ''
        }

        if (val1 !== val2) {
          console.log(
            `Unsaved change detected in key "${key}": "${this.originalCharacter[key]}" -> "${this.character[key]}"`
          )
          return true
        }
      }

      const bg1 = this.character.background?.name || ''
      const bg2 = this.originalCharacter.background?.name || ''
      if (bg1 !== bg2) {
        console.log(`Unsaved change detected in background: "${bg2}" -> "${bg1}"`)
        return true
      }

      const compareArrays = (arr1: any[] | undefined, arr2: any[] | undefined) => {
        const a1 = (arr1 || []).map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).sort()
        const a2 = (arr2 || []).map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).sort()
        if (a1.length !== a2.length) return true
        return a1.some((val, idx) => val !== a2[idx])
      }

      const arraysToCompare: { name: string; val1: any[] | undefined; val2: any[] | undefined }[] =
        [
          {
            name: 'proficientSkills',
            val1: this.character.proficientSkills,
            val2: this.originalCharacter.proficientSkills
          },
          {
            name: 'proficientSavingThrows',
            val1: this.character.proficientSavingThrows,
            val2: this.originalCharacter.proficientSavingThrows
          },
          {
            name: 'languages',
            val1: this.character.languages,
            val2: this.originalCharacter.languages
          },
          { name: 'spells', val1: this.character.spells, val2: this.originalCharacter.spells },
          {
            name: 'inventory',
            val1: this.character.inventory,
            val2: this.originalCharacter.inventory
          },
          {
            name: 'equipment',
            val1: this.character.equipment,
            val2: this.originalCharacter.equipment
          }
        ]

      for (const arr of arraysToCompare) {
        if (compareArrays(arr.val1, arr.val2)) {
          console.log(`Unsaved change detected in array "${arr.name}":`, arr.val2, '->', arr.val1)
          return true
        }
      }

      return false
    },
    async saveCharacter() {
      if (!this.character || !this.character.name)
        return { success: false, error: 'No character name' }
      try {
        const payload = this.getCharacterPayload()
        const res = await window.mainApi.invoke('msgSaveCharacter', payload)

        if (res && res.success && res.filePath) {
          this.character.filePath = res.filePath
          this.originalCharacter = JSON.parse(JSON.stringify(this.character))
        }

        // Refresh character list
        const chars = await window.mainApi.invoke('msgGetCharacters')
        this.characters = chars

        return res
      } catch (e) {
        console.error('Error saving character in store:', e)
        return { success: false, error: e }
      }
    },
    async addIndexUrl(url: string) {
      await window.mainApi.invoke('msgDownloadIndex', url)
    },
    triggerAutoGeneratePreview() {
      this.autoGenerateTrigger += 1
    }
  }
})
