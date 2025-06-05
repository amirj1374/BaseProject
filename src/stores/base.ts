import { defineStore } from 'pinia'
import type { CurrenciesDto } from '@/types/approval/approvalType';

export const useBaseStore = defineStore('baseStore', {
  state: () => ({
    currency: [] as CurrenciesDto[],
  }),

  actions: {
    setCurrencyList(payload: CurrenciesDto[]) {
      this.currency = payload
    },
    resetAll() {
      this.currency = [] as CurrenciesDto[]
    },
  }
})
