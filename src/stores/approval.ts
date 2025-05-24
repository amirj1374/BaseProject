import { defineStore } from 'pinia'
import type { CustomerDto, SummaryDto } from '@/types/approval/approvalType'

export const useApprovalStore = defineStore('approvalStore', {
  state: () => ({
    customerInfo: {} as CustomerDto,
    summaryRequest: {} as SummaryDto
  }),

  actions: {
    setCustomerInfo(payload: Partial<CustomerDto>) {
      this.customerInfo = { ...this.customerInfo, ...payload }
    },

    setSummaryRequest(payload: Partial<SummaryDto>) {
      this.summaryRequest = { ...this.summaryRequest, ...payload }
    },

    resetAll() {
      this.customerInfo = {} as CustomerDto
      this.summaryRequest = {} as SummaryDto
    }
  }
})
