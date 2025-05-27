import { defineStore } from 'pinia'
import type { CustomerDto, LoanRequestDetail, SummaryDto, GuarantorDto } from '@/types/approval/approvalType'

export const useApprovalStore = defineStore('approvalStore', {
  state: () => ({
    customerInfo: {} as CustomerDto,
    summaryRequest: {} as SummaryDto,
    loanRequestDetailList: [] as LoanRequestDetail[], // <-- make this an array
    guarantor: [] as GuarantorDto[]
  }),

  actions: {
    setCustomerInfo(payload: Partial<CustomerDto>) {
      this.customerInfo = { ...this.customerInfo, ...payload }
    },

    setSummaryRequest(payload: Partial<SummaryDto>) {
      this.summaryRequest = { ...this.summaryRequest, ...payload }
    },

    setLoanRequestDetailList(payload: LoanRequestDetail[]) {
      this.loanRequestDetailList = payload
    },

    addLoanRequestDetail(payload: LoanRequestDetail) {
      this.loanRequestDetailList.push(payload)
    },

    resetAll() {
      this.customerInfo = {} as CustomerDto
      this.summaryRequest = {} as SummaryDto
      this.loanRequestDetailList = [] // <-- clear the list
    },

    setGuarantor(payload: GuarantorDto[]) {
      this.guarantor = payload;
    }
  }
})
