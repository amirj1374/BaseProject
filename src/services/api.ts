import axiosInstance from "@/services/axiosInstance";
import apiService from "@/services/apiService";

export const api = {
  person: apiService(axiosInstance, "person"),
  transaction: apiService(axiosInstance, "transaction"),
  user: apiService(axiosInstance, "user"),
};
