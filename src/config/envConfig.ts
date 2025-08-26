import type { EnvConfig } from '@/types/models/env';

// Simple configuration - just read from environment files
const envConfig: EnvConfig = {
  PORT: parseInt(import.meta.env.VITE_PORT),
  BASE_URL: import.meta.env.VITE_BASE_URL,
  APP_TITLE: import.meta.env.VITE_APP_TITLE,
  ENVIRONMENT: import.meta.env.VITE_APP_ENV
};

// Simple API configuration
export const apiConfig = {
  baseURL: envConfig.BASE_URL
};

// Show current environment info
console.log('🌍 Current Environment:', {
  environment: envConfig.ENVIRONMENT,
  baseUrl: envConfig.BASE_URL,
  appTitle: envConfig.APP_TITLE,
  port: envConfig.PORT
});

export default envConfig;
