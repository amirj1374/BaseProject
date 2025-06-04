import type { EnvConfig } from '@/types/models/env';

const currentEnv = import.meta.env.VITE_APP_ENV || "dev";

const configs: Record<string, EnvConfig> = {
  dev: {
    PORT: 8585,
    NODE_ENV: "development",
    API_URL: "http://192.168.31.170/back/back",
    SITE_URL: "/",
  },
  prelive: {
    PORT: 8080,
    NODE_ENV: "preLive",
    API_URL: "/v1/service/loan",
    SITE_URL: "/",
  },
  prod: {
    PORT: 80,
    NODE_ENV: "production",
    API_URL: "/v1/service/loan",
    SITE_URL: "/",
  },
};

const envConfig: EnvConfig = configs[currentEnv] || configs.dev;

export default envConfig;
