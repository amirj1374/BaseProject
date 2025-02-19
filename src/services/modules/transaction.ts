import type { AxiosInstance } from "axios";

export default (axiosInstance: AxiosInstance) => ({
  fetchTransaction(id: string) {
    return axiosInstance.get(`/personTransaction-requests/${id}`);
  },

  createTransaction(data: any) {
    return axiosInstance.post("/personTransaction-requests", data);
  },

  updateTransaction(id: string, data: any) {
    return axiosInstance.put(`/personTransaction-requests/${id}`, data);
  },

  deleteTransaction(id: string) {
    return axiosInstance.delete(`/personTransaction-requests/${id}`);
  },
});
