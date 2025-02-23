import axiosInstance from "@/services/axiosInstance";
import apiService from "@/services/apiService";
import transaction from "@/services/modules/transaction";

export const api = {
  person: apiService(axiosInstance, "person"),
  transaction: transaction(axiosInstance),
  user: apiService(axiosInstance, "user"),
};
