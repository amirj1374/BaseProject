import type { AxiosInstance } from "axios";
import type {
  ConsiderationPayload,
  DepositAccount,
  FetchCustomerPayload,
  FetchGuarantorPayload,
  FetchInquiryPayload,
  SaveGeneralPayload,
  SummaryDto,
  UploadFile
} from '@/types/approval/approvalType';


export default (axiosInstance: AxiosInstance) => ({
  fetchCustomer(data: FetchCustomerPayload) {
    return axiosInstance.get(`/api/v1/customer-info/pure`, { params: data });
  },
  getLoanRequestDetail(loanRequestId: string) {
    return axiosInstance.get(`/api/v1/loan-requests`, { params: {loanRequestId},});
  },
  fetchSummary(data: SummaryDto) {
    return axiosInstance.post(`/api/v1/loan-requests/summary-request`, data);
  },
  fetchGuarantor(data: FetchGuarantorPayload) {
    return axiosInstance.get(`/api/v1/guarantor/pure`, { params:data });
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

  getCollateral() {
    return axiosInstance.get("/api/v1/general/collateral");
  },

  saveGeneral(data: SaveGeneralPayload) {
    return axiosInstance.post(`/api/v1/general`, data);
  },
  getSapInquiry(payload: FetchInquiryPayload) {
    return axiosInstance.post('/api/v1/sap-inquiry', payload, {
      timeout: 50000
    });
  },
  getIndirectObligation(loanRequestId: string) {
    return axiosInstance.get('/api/v1/general/indirect-obligation', {
      params: { loanRequestId },
      timeout: 50000
    });
  },

  getDirectObligation(loanRequestId: string) {
    return axiosInstance.get('/api/v1/general/direct-obligation', {
      params: { loanRequestId },
      timeout: 50000
    });
  },

  getInquiryCheque(loanRequestId: string) {
    return axiosInstance.get('api/v1/inquery/inquiry-cheque', {
      params: { loanRequestId },
      timeout: 50000
    });
  },

  getAllDeposit(loanRequestId: string) {
    return axiosInstance.get('/api/v1/deposit-info/get-all-deposit', {params: {loanRequestId}});
  },

  saveDeposit(loanRequestId: string, depositList: DepositAccount) {
    return axiosInstance.post('/api/v1/deposit-info/save-selected-deposit', { loanRequestId, depositList });
  },

  getConsideration(loanRequestId: string) {
    return axiosInstance.get('/api/v1/consideration', {
      params: { loanRequestId }
    });
  },

    saveConsideration(payload: ConsiderationPayload, loanRequestId: string) {
      return axiosInstance.post('/api/v1/consideration',{payload,loanRequestId});
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
  getLcProduct(lcContractType: string) {
    return axiosInstance.get(`/api/v1/general/product-type?lcContractType=${lcContractType}`);
  },

  getAllDoc(loanRequestId: string) {
    return axiosInstance.get(`api/v1/general/get-all-doc?loanRequestId=${loanRequestId}`);
  },

  saveDoc(formData: FormData) {
    return axiosInstance.post('/api/v1/general/save-doc', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000
    });
  },
  getResult(loanRequestId: string) {
    return axiosInstance.get("api/v1/1016/base", {
      params: {loanRequestId},
      responseType: 'text', // 👈 Required for binary data like PDFs
    },);
  },
  logout() {
    return axiosInstance.get("logout");
  },
});
