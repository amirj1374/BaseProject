import axiosInstance from "@/services/axiosInstance";
import apiService from "@/services/apiService";
import approval from "@/services/modules/approval";
import cartable from "./modules/cartable";
import userApi from "./modules/user";


export const api = {
  person: apiService(axiosInstance, "person"),
  approval: approval(axiosInstance),
  user: userApi(axiosInstance),
  cartable: cartable(axiosInstance),
};
