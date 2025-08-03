import { defineStore } from 'pinia'
import type { CollateralDto, CurrenciesDto, RegionsDto } from '@/types/approval/approvalType';

export const useBaseStore = defineStore('baseStore', {
  state: () => ({
    currency: [] as CurrenciesDto[],
    collateral: [] as CollateralDto[],
    regions: [] as RegionsDto[]
  }),

  actions: {
    setCurrencyList(payload: CurrenciesDto[]) {
      this.currency = payload
    },
    setCollateralList(payload: CollateralDto[]) {
      this.collateral = payload
    },
    setRegionsList(payload: RegionsDto[]) {
      this.regions = payload
    },
    resetAll() {
      this.currency = [] as CurrenciesDto[]
    },
  }
})
