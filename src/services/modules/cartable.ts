import type { SubmitReferencePayload, ValidUserPayload } from "@/types/cartable/cartableTypes";
import type { AxiosInstance } from "axios";

export default (axiosInstance: AxiosInstance) => ({
  getCartable(trackingCode: string) {
    return axiosInstance.get("/api/v1/cartable", { params: {trackingCode},});
  },

  saveCartable(trackingCode: string) {
    return axiosInstance.post("/api/v1/cartable", {trackingCode});
  },

  getCartableDetail(id: number) {
    return axiosInstance.get(`/api/v1/cartable/${id}`);
  },

  getValidRoles(id: number) {
    return axiosInstance.get(`/api/v1/cartable/${id}/get-valid-roles`);
  },

  getValidUser(payload: ValidUserPayload) {
    return axiosInstance.get(`/api/v1/cartable/${payload.id}/get-valid-users?actionType=${payload.actionType}&roleCode=${payload.roleCode}`);
  },
  submitReference(payload: SubmitReferencePayload) {
    return axiosInstance.post("/api/v1/cartable/submit", payload);
  },
  getRole() {
    return axiosInstance.get("/api/v1/role/samap");
  },

});
