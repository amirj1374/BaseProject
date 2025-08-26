import axios, { type AxiosInstance } from "axios";
import { apiConfig } from '@/config/envConfig';

const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: apiConfig.baseURL,
    timeout: 5000, // Optional: Request timeout in milliseconds
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Interceptors for requests
  instance.interceptors.request.use(
    (config) => {
      // You can modify the create before sending, e.g., add tokens
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      // Handle create errors
      return Promise.reject(error);
    }
  );

  // Interceptors for responses
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        // Example: Redirect to login if unauthorized
        window.location.href = "back/oauth2/authorization/master"
        console.error("Unauthorized, redirecting to login...");
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

const axiosInstance = createAxiosInstance();

export default axiosInstance;
