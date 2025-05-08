import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('appstore', () => {
  const count = ref(0)

  function increaseCount(amount: number) {
    count.value += amount
  }

  return {
    count,
    increaseCount
  }
})
