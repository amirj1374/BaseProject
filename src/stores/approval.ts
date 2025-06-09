import { defineStore } from 'pinia'
import type { CustomerDto, LoanRequestDetail, SummaryDto, GuarantorDto, Facility, Guarantee, Lc, FacilitiesRequest, GuaranteeRequest, LcRequest } from '@/types/approval/approvalType'

export const useApprovalStore = defineStore('approvalStore', {
  state: () => ({
    customerInfo: {} as CustomerDto,
    loanRequestDetailList: null as LoanRequestDetail | null,
    guarantor: [] as GuarantorDto[],
    loanRequestId: '' as string,
    trackingCode: '' as string,
  }),

  actions: {
    setCustomerInfo(payload: Partial<CustomerDto>) {
      this.customerInfo = { ...this.customerInfo, ...payload }
    },

    setLoanRequestDetailList(payload: LoanRequestDetail) {
      this.loanRequestDetailList = payload
    },

    setLoanRequestId(payload: string) {
      this.loanRequestId = payload
    },

    setTrackingCode(payload: string) {
      this.trackingCode = payload
    },

    updateSummaryRequest(summary: SummaryDto) {
      if (!this.loanRequestDetailList) {
        this.loanRequestDetailList = {
          summaryRequest: summary,
          facilities: {} as FacilitiesRequest,
          guarantee: {} as GuaranteeRequest,
          lc: {} as LcRequest
        }
      } else {
        this.loanRequestDetailList.summaryRequest = summary
      }
    },

    updateFacilities(facilities: FacilitiesRequest) {
      if (!this.loanRequestDetailList) {
        this.loanRequestDetailList = {
          summaryRequest: {} as SummaryDto,
          facilities: {} as FacilitiesRequest,
          guarantee: {} as GuaranteeRequest,
          lc: {} as LcRequest
        }
      } else {
        this.loanRequestDetailList.facilities = facilities
      }
    },

    updateGuarantee(guarantee: Guarantee) {
      if (!this.loanRequestDetailList) {
        this.loanRequestDetailList = {
          summaryRequest: {} as SummaryDto,
          facilities: {} as FacilitiesRequest,
          guarantee: {} as GuaranteeRequest,
          lc: {} as LcRequest
        }
      } else {
        this.loanRequestDetailList.guarantee = guarantee
      }
    },

    updateLc(lc: Lc) {
      if (!this.loanRequestDetailList) {
        this.loanRequestDetailList = {
          summaryRequest: {} as SummaryDto,
          facilities: {} as FacilitiesRequest,
          guarantee: {} as GuaranteeRequest,
          lc: {} as LcRequest
        }
      } else {
        this.loanRequestDetailList.lc = lc
      }
    },

    resetAll() {
      this.customerInfo = {} as CustomerDto
      this.loanRequestDetailList = null
      this.guarantor = [] as GuarantorDto[]
      this.loanRequestId = ''
      this.trackingCode = ''
    },

    setGuarantor(payload: GuarantorDto[]) {
      this.guarantor = payload
    }
  }
})
