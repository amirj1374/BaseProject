import { defineStore } from 'pinia'
import type { CustomerDto, LoanRequestDetail, SummaryDto, GuarantorDto, Facility, Guarantee, Lc, FacilitiesRequest, GuaranteeRequest, LcRequest, GreenLicense } from '@/types/approval/approvalType'

export const useApprovalStore = defineStore('approvalStore', {
  state: () => ({
    customerInfo: {} as CustomerDto,
    loanRequestDetailList: null as LoanRequestDetail | null,
    guarantor: [] as GuarantorDto[],
    facilitiesItems: [] as Facility[],
    guaranteeItems: [] as Guarantee[],
    lcItems: [] as Lc[],
    greenLicenseItems: [] as GreenLicense[],
    loanRequestId: '' as string,
    trackingCode: '' as string,
    loanRequestStatus: '' as string,
  }),

  actions: {
    setCustomerInfo(payload: Partial<CustomerDto>) {
      // Allow arrays to be stored in customerInfo if provided; otherwise keep existing
      const { facilities, guarantee, lc, greenLicense, ...rest } = payload as any
      const existing = this.customerInfo
      this.customerInfo = {
        ...existing,
        ...rest,
        facilities: facilities !== undefined ? facilities : existing?.facilities,
        guarantee: guarantee !== undefined ? guarantee : existing?.guarantee,
        lc: lc !== undefined ? lc : existing?.lc,
        greenLicense: greenLicense !== undefined ? greenLicense : existing?.greenLicense,
      }
    },

    setRequestItems(payload: { facilities?: Facility[]; guarantee?: Guarantee[]; lc?: Lc[]; greenLicense?: GreenLicense[] }) {
      if (payload.facilities !== undefined) {
        this.facilitiesItems = payload.facilities
      }
      if (payload.guarantee !== undefined) {
        this.guaranteeItems = payload.guarantee
      }
      if (payload.lc !== undefined) {
        this.lcItems = payload.lc
      }
      if (payload.greenLicense !== undefined) {
        this.greenLicenseItems = payload.greenLicense
      }
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
      this.facilitiesItems = [] as Facility[]
      this.guaranteeItems = [] as Guarantee[]
      this.lcItems = [] as Lc[]
      this.greenLicenseItems = [] as GreenLicense[]
      this.loanRequestId = ''
      this.trackingCode = ''
      this.loanRequestStatus = ''
    },

    setGuarantor(payload: GuarantorDto[]) {
      this.guarantor = payload
    }
  }
})
