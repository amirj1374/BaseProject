import { defineStore } from 'pinia'
import type { CustomerDto, LoanRequestDetail, SummaryDto, GuarantorDto, Facility, Guarantee, Lc, FacilitiesRequest, GuaranteeRequest, LcRequest, GreenLicense } from '@/types/approval/approvalType'

export const useApprovalStore = defineStore('approvalStore', {
  state: () => ({
    customerInfo: {} as CustomerDto,
    loanRequestDetailList: null as LoanRequestDetail | null,
    guarantor: [] as GuarantorDto[],
    loanRequestId: '' as string,
    trackingCode: '' as string,
    loanRequestStatus: '' as string,
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

    setLoanRequestStatus(payload: string) {
      this.loanRequestStatus = payload
    },  

    updateSummaryRequest(summary: SummaryDto) {
      if (!this.loanRequestDetailList) {
        this.loanRequestDetailList = {
          summaryRequest: summary,
          facilities: {} as FacilitiesRequest,
          guarantee: {} as GuaranteeRequest,
          lc: {} as LcRequest,
          greenLicense: {} as GreenLicense
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
          lc: {} as LcRequest,
          greenLicense: {} as GreenLicense
        }
      } else {
        this.loanRequestDetailList.facilities = facilities
      }
    },

    updateGuarantee(guarantee: GuaranteeRequest) {
      if (!this.loanRequestDetailList) {
        this.loanRequestDetailList = {
          summaryRequest: {} as SummaryDto,
          facilities: {} as FacilitiesRequest,
          guarantee: {} as GuaranteeRequest,
          lc: {} as LcRequest,
          greenLicense: {} as GreenLicense
        }
      } else {
        this.loanRequestDetailList.guarantee = guarantee
      }
    },

    updateLc(lc: LcRequest) {
      if (!this.loanRequestDetailList) {
        this.loanRequestDetailList = {
          summaryRequest: {} as SummaryDto,
          facilities: {} as FacilitiesRequest,
          guarantee: {} as GuaranteeRequest,
          lc: {} as LcRequest,
          greenLicense: {} as GreenLicense
        }
      } else {
        this.loanRequestDetailList.lc = lc
      }
    },

    updateGreenLicense(greenLicense: GreenLicense) {
      if (!this.loanRequestDetailList) {
        this.loanRequestDetailList = {
          summaryRequest: {} as SummaryDto,
          facilities: {} as FacilitiesRequest,
          guarantee: {} as GuaranteeRequest,
          lc: {} as LcRequest,
          greenLicense: {} as GreenLicense
        }
      } else {
        this.loanRequestDetailList.greenLicense = greenLicense
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
