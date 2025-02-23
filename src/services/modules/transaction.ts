import type { AxiosInstance } from "axios";

export default (axiosInstance: AxiosInstance) => ({
  fetchTransaction() {
    return axiosInstance.get(`/enumerationController/getWarrantyContractTypes`);
  },

  insertPersonByNationalCode(data: any) {
    return axiosInstance.post("/PersonInfoController/insertPersonByNationalCode", data);
  },

  updateTransaction(id: string, data: any) {
    return axiosInstance.put(`/personTransaction-requests/${id}`, data);
  },

  deleteTransaction(id: string) {
    return axiosInstance.delete(`/personTransaction-requests/${id}`);
  },
});
