import { defineStore } from 'pinia'
import type { CollateralDto, CurrenciesDto } from '@/types/approval/approvalType';

export const useBaseStore = defineStore('baseStore', {
  state: () => ({
    currency: [] as CurrenciesDto[],
    collateral: [] as CollateralDto[]
  }),

  actions: {
    setCurrencyList(payload: CurrenciesDto[]) {
      this.currency = payload
    },
    setCollateralList(payload: CollateralDto[]) {
      this.collateral = payload
    },
    resetAll() {
      this.currency = [] as CurrenciesDto[]
    },
  }
})
