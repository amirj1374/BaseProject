import { defineStore } from 'pinia'
import type { CustomerDto, LoanRequestDetail, SummaryDto, GuarantorDto } from '@/types/approval/approvalType'

export const useApprovalStore = defineStore('approvalStore', {
  state: () => ({
    customerInfo: {} as CustomerDto,
    summaryRequest: {} as SummaryDto,
    loanRequestDetailList: [] as LoanRequestDetail[],
    guarantor: [] as GuarantorDto[],
    loanRequestId: '' as string,
    trackingCode: '' as string,
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

    setLoanRequestId(payload: string) {
      this.loanRequestId = payload
    },

    setTrackingCode(payload: string) {
      this.trackingCode = payload
    },

    addLoanRequestDetail(payload: LoanRequestDetail) {
      this.loanRequestDetailList.push(payload)
    },

    resetAll() {
      this.customerInfo = {} as CustomerDto
      this.summaryRequest = {} as SummaryDto
      this.loanRequestDetailList = []
      this.guarantor = [] as GuarantorDto[]
      this.loanRequestId = ''
      this.trackingCode = ''
    },

    setGuarantor(payload: GuarantorDto[]) {
      this.guarantor = payload;
    }
  }
})
