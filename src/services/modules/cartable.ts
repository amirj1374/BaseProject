import type { SubmitReferencePayload, SubmitSignPayload, ValidUserPayload } from "@/types/cartable/cartableTypes";
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
    return axiosInstance.get(`/api/v1/cartable/${payload.id}/get-valid-users?actionType=${payload.actionType}&roleCode=${payload.roleCode}`,{
      timeout: 40000,
    });
  },
  submitReference(payload: SubmitReferencePayload) {
    return axiosInstance.post("/api/v1/cartable/submit", payload);
  },
  getSamapRole() {
    return axiosInstance.get("/api/v1/role/samap");
  },
  getLotusRole() {
    return axiosInstance.get("/api/v1/role/lotus");
  },

  submitSign(payload: SubmitSignPayload) {
    return axiosInstance.post("/api/v1/cartable/sign", payload);
  },

});
