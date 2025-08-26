# Three Environment System Documentation

## 🎯 **Overview**

This project now supports **three distinct environments** with separate configurations for development, pre-live testing, and production deployment. **All environments use port 5050** and configuration is read directly from environment files for easy management.

## 🌍 **Environments**

### **1. Development (dev)**
- **Purpose**: Local development and testing
- **API URL**: `http://192.168.31.170/back`
- **Base URL**: `/`
- **Port**: 5050
- **Debug**: Enabled
- **Title**: "Samap Development"

### **2. Pre-Live (prelive)**
- **Purpose**: Staging and pre-production testing
- **API URL**: `http://192.168.250.55/back`
- **Base URL**: `/vue/free/prelive/`
- **Port**: 5050
- **Debug**: Enabled
- **Title**: "Samap Pre-Live"

### **3. Live (live)**
- **Purpose**: Production deployment
- **API URL**: `https://api.samap.com/v1/service/loan`
- **Base URL**: `/vue/free/`
- **Port**: 5050
- **Debug**: Disabled
- **Title**: "Samap Production"

## 📁 **Project Structure**

```
Samap/
├── env.dev                    # Development environment variables
├── env.prelive               # Pre-live environment variables
├── env.live                  # Live environment variables
├── src/
│   ├── config/
│   │   └── envConfig.ts      # Centralized environment configuration
│   └── services/
│       └── apiService.ts     # API service with environment support
├── scripts/
│   └── deploy.sh             # Deployment script
└── package.json              # Updated scripts for three environments
```

## 🚀 **Usage**

### **Development Commands**

#### **Start Development Server**
```bash
# Development environment
yarn dev
# or
./scripts/deploy.sh dev dev

# Pre-live environment
yarn dev:prelive
# or
./scripts/deploy.sh prelive dev

# Live environment
yarn dev:live
# or
./scripts/deploy.sh live dev
```

#### **Build for Environment**
```bash
# Development build
yarn build:dev
# or
./scripts/deploy.sh dev build

# Pre-live build
yarn build:prelive
# or
./scripts/deploy.sh prelive build

# Live build
yarn build:live
# or
./scripts/deploy.sh live build
```

#### **Preview Build**
```bash
# Development preview
yarn preview:dev
# or
./scripts/deploy.sh dev preview

# Pre-live preview
yarn preview:prelive
# or
./scripts/deploy.sh prelive preview

# Live preview
yarn preview:live
# or
./scripts/deploy.sh live preview
```

#### **Build and Preview**
```bash
# One command to build and preview
./scripts/deploy.sh dev build-and-preview
./scripts/deploy.sh prelive build-and-preview
./scripts/deploy.sh live build-and-preview
```

### **Environment Information**
```bash
# Show environment details
./scripts/deploy.sh dev info
./scripts/deploy.sh prelive info
./scripts/deploy.sh live info
```

## ⚙️ **Configuration**

### **Environment Variables**

Each environment has its own configuration file. **To change any setting, simply edit the corresponding environment file:**

#### **Development (env.dev)**
```bash
VITE_APP_ENV=dev
VITE_APP_TITLE=Samap Development
VITE_API_URL=http://192.168.31.170/back
VITE_BASE_URL=/
VITE_DEBUG=true
VITE_PORT=5050
```

#### **Pre-Live (env.prelive)**
```bash
VITE_APP_ENV=prelive
VITE_APP_TITLE=Samap Pre-Live
VITE_API_URL=http://192.168.250.55/back
VITE_BASE_URL=/vue/free/prelive/
VITE_DEBUG=true
VITE_PORT=5050
```

#### **Live (env.live)**
```bash
VITE_APP_ENV=live
VITE_APP_TITLE=Samap Production
VITE_API_URL=https://api.samap.com/v1/service/loan
VITE_BASE_URL=/vue/free/
VITE_DEBUG=false
VITE_PORT=5050
```

### **Centralized Configuration**

The `src/config/envConfig.ts` file now reads directly from environment variables:

```typescript
// Read directly from environment variables
const envConfig: EnvConfig = {
  PORT: parseInt(import.meta.env.VITE_PORT) || 5050,
  NODE_ENV: import.meta.env.VITE_APP_ENV || "dev",
  API_URL: import.meta.env.VITE_API_URL || "http://192.168.31.170/back",
  SITE_URL: import.meta.env.VITE_BASE_URL || "/",
  APP_TITLE: import.meta.env.VITE_APP_TITLE || "Samap",
  DEBUG: import.meta.env.VITE_DEBUG === 'true' || false,
  BASE_URL: import.meta.env.VITE_BASE_URL || "/",
  ENVIRONMENT: import.meta.env.VITE_APP_ENV || "dev"
};
```

## 🔧 **API Service**

The centralized API service automatically uses the correct environment configuration:

```typescript
import { apiConfig } from '@/config/envConfig';

// API endpoints are automatically configured for the current environment
export const centralizedApiService = {
  users: {
    getAll: () => axiosInstance.get(apiConfig.endpoints.users),
    authenticate: (credentials) => 
      axiosInstance.post(apiConfig.endpoints.auth, credentials),
  },
  cartable: {
    getCreditApproval: (cartableId) => 
      axiosInstance.get(`${apiConfig.endpoints.cartable}/credit-approval/${cartableId}`),
  },
  // ... more endpoints
};
```

## 🌐 **Access URLs**

| Environment | Development Server | Preview Server | Build Output |
|-------------|-------------------|----------------|--------------|
| **Development** | http://localhost:5050 | http://localhost:5050 | `dist/` |
| **Pre-Live** | http://localhost:5050 | http://localhost:5050 | `dist/` |
| **Live** | http://localhost:5050 | http://localhost:5050 | `dist/` |

## 📋 **Package.json Scripts**

```json
{
  "scripts": {
    "dev": "vite --mode dev",
    "dev:prelive": "vite --mode prelive",
    "dev:live": "vite --mode live",
    "build:dev": "vue-tsc --noEmit && vite build --mode dev",
    "build:prelive": "vue-tsc --noEmit && vite build --mode prelive",
    "build:live": "vue-tsc --noEmit && vite build --mode live",
    "preview:dev": "vite preview --port 5050 --host",
    "preview:prelive": "vite preview --port 5050 --host",
    "preview:live": "vite preview --port 5050 --host"
  }
}
```

## 🎯 **Workflow Examples**

### **Development Workflow**
```bash
# 1. Start development server
yarn dev

# 2. Build for testing
yarn build:dev

# 3. Preview build
yarn preview:dev
```

### **Pre-Live Testing Workflow**
```bash
# 1. Build for pre-live
yarn build:prelive

# 2. Preview pre-live build
yarn preview:prelive

# 3. Test with pre-live API
```

### **Production Deployment Workflow**
```bash
# 1. Build for production
yarn build:live

# 2. Preview production build
yarn preview:live

# 3. Deploy to production server
```

## 🔍 **Environment Detection**

The application automatically detects the current environment and logs configuration details:

```javascript
// Console output in development
🌍 Environment Configuration: {
  environment: "dev",
  apiUrl: "http://192.168.31.170/back",
  baseUrl: "/",
  appTitle: "Samap Development",
  debug: true,
  port: 5050
}
```

## ✅ **Benefits**

- ✅ **Environment Isolation**: Separate configurations for each environment
- ✅ **Easy Switching**: Simple commands to switch between environments
- ✅ **Consistent API**: Centralized API service with environment-specific URLs
- ✅ **Debug Control**: Automatic debug mode based on environment
- ✅ **Build Optimization**: Environment-specific build optimizations
- ✅ **Deployment Ready**: Production-ready builds with proper configurations
- ✅ **Easy Configuration**: Just edit environment files to change settings
- ✅ **Unified Port**: All environments use port 5050 for consistency

## 🔧 **Configuration Management**

### **How to Change Settings**

To change any configuration setting, simply edit the corresponding environment file:

1. **Change API URL**: Edit `VITE_API_URL` in the environment file
2. **Change Base URL**: Edit `VITE_BASE_URL` in the environment file
3. **Change App Title**: Edit `VITE_APP_TITLE` in the environment file
4. **Enable/Disable Debug**: Edit `VITE_DEBUG` in the environment file

### **Example: Change API URL for Development**

Edit `env.dev`:
```bash
# Before
VITE_API_URL=http://192.168.31.170/back

# After
VITE_API_URL=http://192.168.31.171/back
```

Then restart the development server:
```bash
yarn dev
```

## 🚨 **Troubleshooting**

### **Environment Not Loading**
1. Check environment file exists: `env.dev`, `env.prelive`, `env.live`
2. Verify environment variables are set correctly
3. Check console for configuration logs

### **API Connection Issues**
1. Verify API URL in environment configuration
2. Check network connectivity to API server
3. Ensure API server is running

### **Build Issues**
1. Run `yarn typecheck` to check TypeScript errors
2. Check for missing dependencies
3. Verify environment configuration

### **Port Already in Use**
1. Check if another process is using port 5050
2. Kill the process or change the port in the environment file
3. Restart the development server

Your project now has a **complete three-environment system** with **unified port 5050** and **easy configuration management**! 🚀
