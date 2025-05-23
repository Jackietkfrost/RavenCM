import { defineStore } from 'pinia'

interface State {
  count: number
  characters: any
}

export const useAppStore = defineStore('appstore', {
  state: ():State => {
    return {
      count: 0,
      characters: []
    }
  },
  getters:{},
  actions:{
    increaseCount(amount: number) {
    this.count += amount
  }
  }

})
