import axios, { type AxiosInstance } from "axios";
import { apiConfig } from '@/config/envConfig';

// Helper function to get Keycloak token
const getKeycloakToken = (): string | null => {
  try {
    // Try to get Keycloak instance from window object (set by the plugin)
    const keycloakInstance = (window as any).$keycloak;
    if (keycloakInstance && keycloakInstance.token) {
      return keycloakInstance.token;
    }
    return null;
  } catch (error) {
    console.warn('Could not access Keycloak token:', error);
    return null;
  }
};

// Helper function to refresh Keycloak token
const refreshKeycloakToken = async (): Promise<boolean> => {
  try {
    const keycloakInstance = (window as any).$keycloak;
    if (keycloakInstance && keycloakInstance.keycloak && keycloakInstance.keycloak.updateToken) {
      const refreshed = await keycloakInstance.keycloak.updateToken(5);
      return refreshed;
    }
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

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
      // Add Keycloak token to requests
      const keycloakToken = getKeycloakToken();
      if (keycloakToken) {
        config.headers.Authorization = `Bearer ${keycloakToken}`;
      }
      
      // Fallback to localStorage token if Keycloak token is not available
      if (!keycloakToken) {
        const fallbackToken = localStorage.getItem("authToken");
        if (fallbackToken) {
          config.headers.Authorization = `Bearer ${fallbackToken}`;
        }
      }
      
      return config;
    },
    (error) => {
      // Handle request errors
      return Promise.reject(error);
    }
  );

  // Interceptors for responses
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Try to refresh the Keycloak token
          const tokenRefreshed = await refreshKeycloakToken();
          
          if (tokenRefreshed) {
            // Token refreshed successfully, retry the original request
            const newToken = getKeycloakToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return instance(originalRequest);
            }
          }
          
          // If token refresh failed, redirect to Keycloak login
          console.error("Token refresh failed, redirecting to Keycloak login...");
          const keycloakInstance = (window as any).$keycloak;
          if (keycloakInstance && keycloakInstance.login) {
            await keycloakInstance.login();
          } else {
            // Fallback to manual redirect
            window.location.href = "http://192.168.251.72:8080/realms/master/protocol/openid-connect/auth?client_id=FACILITY&redirect_uri=" + encodeURIComponent(window.location.origin) + "&response_type=code&scope=openid";
          }
        } catch (refreshError) {
          console.error("Token refresh error:", refreshError);
          // Fallback to old behavior
          window.location.href = "back/oauth2/authorization/master";
        }
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

const axiosInstance = createAxiosInstance();

export default axiosInstance;
