import type { AxiosInstance } from "axios";
import type { FetchCustomerPayload, FetchGuarantorPayload } from '@/types/approval/approvalType';


export default (axiosInstance: AxiosInstance) => ({
  fetchCustomer(data: FetchCustomerPayload) {
    return axiosInstance.post(`/api/v1/loan-requests`, data);
  },
  fetchGuarantor(data: FetchGuarantorPayload) {
    return axiosInstance.post(`/api/v1/guarantor`, data);
  },
  fetchCurrencies() {
    return axiosInstance.post("/api/v1/general/currencies");
  },
  getContractType(loanRequestType: string) {
    return axiosInstance.get("/api/v1/general/get-contract-type", {
      params: {loanRequestType}
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

  deleteTransaction(id: string) {
    return axiosInstance.delete(`/personTransaction-requests/${id}`);
  },
});
