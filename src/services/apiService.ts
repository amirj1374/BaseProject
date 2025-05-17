import type { AxiosInstance } from "axios";

export default (axiosInstance: AxiosInstance, resource: string) => ({
  fetch(filters?: Record<string, any>) {
    return axiosInstance.get(`/api/v1/${resource}`, {
      params: { 
        ...filters,
      }
    });
  },

  create(data: Record<string, any>) {
    return axiosInstance.post(`/api/v1/${resource}`, data);
  },

  update(data: Record<string, any>) {
    return axiosInstance.put(`/api/v1/${resource}`, data);
  },

  delete(id: string | Record<string, any>) {
    return axiosInstance.delete(`/api/v1/${resource}/${id}`);
  },
});
