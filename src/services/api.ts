import axiosInstance from "@/services/axiosInstance";
import apiService from "@/services/apiService";
import approval from "@/services/modules/approval";
import cartable from "./modules/cartable";


export const api = {
  person: apiService(axiosInstance, "person"),
  approval: approval(axiosInstance),
  user: apiService(axiosInstance, "user"),
  cartable: cartable(axiosInstance),
};
