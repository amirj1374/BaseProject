import type { AxiosInstance } from "axios";

export default (axiosInstance: AxiosInstance) => ({
  getCartable(trackingCode: string) {
    return axiosInstance.get("/api/v1/cartable", { params: {trackingCode},});
  },

  saveCartable(trackingCode: string) {
    return axiosInstance.post("/api/v1/cartable", {trackingCode});
  },
});
