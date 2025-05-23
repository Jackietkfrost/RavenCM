import { defineStore } from 'pinia'

interface State {
  count: number
  characters: any
  createCharacter: boolean
}

export const useAppStore = defineStore('appstore', {
  state: (): State => {
    return {
      count: 0,
      characters: [],
      createCharacter: false
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
    }
  }
})
