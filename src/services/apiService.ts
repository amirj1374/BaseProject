import type { AxiosInstance } from "axios";

export default (axiosInstance: AxiosInstance, resource: string) => ({
  fetch(filters: Record<string, any> = {}, page: number = 1, limit: number = 10) {
    return axiosInstance.get(`/api/v1/${resource}`, {
      params: { ...filters, page, limit },
    });
  },

  create(data: Record<string, any>) {
    return axiosInstance.post(`/api/v1/${resource}`, data);
  },

  update(id: string, data: Record<string, any>) {
    return axiosInstance.put(`/api/v1/${resource}/${id}`, data);
  },

  delete(id: string | Record<string, any>) {
    return axiosInstance.delete(`/api/v1/${resource}`, { data: { id } });
  },
});
