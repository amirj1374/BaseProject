import type { AxiosInstance } from "axios";
import type {
  ConsiderationPayload,
  DepositAccount,
  FetchCustomerPayload,
  FetchGuarantorPayload, SummaryDto, UploadFile
} from '@/types/approval/approvalType';


export default (axiosInstance: AxiosInstance) => ({
  fetchCustomer(data: FetchCustomerPayload) {
    return axiosInstance.post(`/api/v1/loan-requests`, data);
  },
  fetchSummary(data: SummaryDto) {
    return axiosInstance.post(`/api/v1/loan-requests/summary-request`, data);
  },
  fetchGuarantor(data: FetchGuarantorPayload) {
    return axiosInstance.post(`/api/v1/guarantor`, data);
  },
  fetchCurrencies() {
    return axiosInstance.post("/api/v1/general/currencies",);
  },
  getContractType(loanRequestType: string) {
    return axiosInstance.get("/api/v1/general/get-contract-type", {
      params: {loanRequestType},
      timeout: 60000 // مثلاً 10 ثانیه
    });
  },
  getFacilities(contractId: number, loanRequestTypeCode: string) {
    return axiosInstance.get("/api/v1/general/get-facilities", {
      params: {contractId, loanRequestTypeCode}
    });
  },

  getCalculatedDay( year: number | null , month: number | null, day: number | null,) {
    return axiosInstance.post("/api/v1/general/calculate-day", {year, month, day});
  },

  getDepositInfo(loanRequestId: number) {
    return axiosInstance.get("/api/v1/deposit-info", {
      params: {loanRequestId}
    });
  },

  getCollateral() {
    return axiosInstance.get("/api/v1/general/collateral");
  },
  saveLoanRequest(loanRequestDetailList: {}) {
    return axiosInstance.post("/api/v1/loan-request-detail", loanRequestDetailList);
  },

  getInquiry(loanRequestId: string) {
    return axiosInstance.post('/api/v1/sap-inquiry', { loanRequestId });
  },

  getAllDeposit(loanRequestId: string) {
    return axiosInstance.post('/api/v1/deposit-info/get-all-deposit', { loanRequestId });
  },

  saveDeposit(loanRequestId: string, depositList: DepositAccount) {
    return axiosInstance.post('/api/v1/deposit-info/save-selected-deposit', { loanRequestId, depositList });
  },

  saveConsideration(payload: ConsiderationPayload, loanRequestId: string) {
    return axiosInstance.post('/api/v1/deposit-info/save-selected-deposit',{payload,loanRequestId});
  },

  uploadExcel(payload: UploadFile) {
    return axiosInstance.post(`/api/v1/general/save-doc`, payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': '*/*',
      },
      timeout: 60000
    });
  },
  deleteTransaction(id: string) {
    return axiosInstance.delete(`/personTransaction-requests/${id}`);
  },
});
