import { api } from '@/services/api';
import { useBaseStore } from '@/stores/base';
import { useCustomerInfoStore } from '@/stores/customerInfo';
import { useCustomizerStore } from '@/stores/customizer';
import envConfig from '@/config/envConfig';
import type { UserInfoResponse } from '@/types/models/userInfo';

// Validation arrays
const validThemes = [
  'ModernTheme', 'PurpleTheme', 'SteelTealGreen', 'OrangeTheme', 'TealTheme', 'SilverTheme', 'RedTheme',
  'DarkModernTheme', 'DarkPurpleTheme', 'DarkSteelTealGreen', 'DarkOrangeTheme', 'DarkTealTheme', 'DarkSilverTheme', 'DarkRedTheme'
];

const validLayoutTypes = ['SideBar', 'NavBar'];
const validFontThemes = ['vazir', 'yekanLight', 'iranSans', 'kalamehLight'];
const validThemeModes = ['light', 'dark'];

// Validation functions
function validateTheme(theme: string): string {
  return validThemes.includes(theme) ? theme : 'PurpleTheme';
}

function validateLayoutType(layout: string): string {
  return validLayoutTypes.includes(layout) ? layout : 'SideBar';
}

function validateFontTheme(font: string): string {
  return validFontThemes.includes(font) ? font : 'vazir';
}

function validateThemeMode(mode: string): string {
  return validThemeModes.includes(mode) ? mode : 'light';
}

function validateInputBg(inputBg: boolean): boolean {
  return typeof inputBg === 'boolean' ? inputBg : false;
}

// Global initialization promise
let initializationPromise: Promise<any> | null = null;
let resolveInit: ((value: any) => void) | null = null;
let rejectInit: ((reason?: any) => void) | null = null;
let isInitializing = false;

export async function initializeApp() {
  // If already initializing, return the existing promise
  if (initializationPromise) {
    return initializationPromise;
  }

  // Create promise immediately for router guard
  initializationPromise = new Promise((resolve, reject) => {
    resolveInit = resolve;
    rejectInit = reject;
  });

  // Mark as initializing
  isInitializing = true;

  return initializationPromise;
}

export async function startInitialization() {
  if (!isInitializing) {
    return;
  }

  // Initialize stores
  const customerInfoStore = useCustomerInfoStore();
  const customizer = useCustomizerStore();
  const baseStore = useBaseStore();

  // Demo mode: skip API calls and initialize with safe defaults
  if (envConfig.ENVIRONMENT === 'demo') {
    try {
      const demoUser: UserInfoResponse = {
        name: 'Demo User',
        sub: 'demo-sub',
        emailVerified: false,
        issuer: null,
        branchName: 'Demo Branch',
        preferredUsername: 'demo',
        nonce: 'demo-nonce',
        sid: 'demo-sid',
        branchCode: '000',
        audience: [],
        acr: '0',
        azp: 'demo-app',
        authTime: new Date().toISOString(),
        fullName: 'Demo User',
        position: 'Demo',
        expiration: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        sessionState: 'demo-state',
        issuedAt: new Date().toISOString(),
        jti: 'demo-jti',
        authorities: [],
        username: 'demo',
        email: null,
        roles: [],
        lotusRoles: [],
        customizer: {
          fontTheme: customizer.fontTheme,
          inputBg: customizer.inputBg,
          layoutType: customizer.layoutType,
          actTheme: customizer.actTheme,
          themeMode: customizer.themeMode,
          menuOrientation: customizer.menuOrientation
        }
      };

      customerInfoStore.setUserInfo(demoUser);
      baseStore.setCurrencyList([]);
      baseStore.setCollateralList([]);
      baseStore.setRegionsList([]);
      baseStore.setDepartmentLevel([]);

      resolveInit?.(demoUser);
    } catch (error) {
      customerInfoStore.setError(error instanceof Error ? error.message : 'Demo initialization error');
      rejectInit?.(error);
    } finally {
      customizer.SET_LOADING(false);
      isInitializing = false;
    }

    return;
  }

  try {
    customerInfoStore.clearError();
    
    // Sequential API calls - one after another
    const userInfo = await api.user.getUserInfo();
    customerInfoStore.setUserInfo(userInfo.data);
    
    // Set and validate customizer settings
    if (userInfo.data.customizer) {
      customizer.actTheme = validateTheme(userInfo.data.customizer.actTheme);
      customizer.fontTheme = validateFontTheme(userInfo.data.customizer.fontTheme);
      customizer.inputBg = validateInputBg(userInfo.data.customizer.inputBg);
      customizer.themeMode = validateThemeMode(userInfo.data.customizer.themeMode);
      customizer.layoutType = validateLayoutType(userInfo.data.customizer.layoutType || 'SideBar');
    }

    const currency = await api.approval.fetchCurrencies();
    baseStore.setCurrencyList(currency.data);
    
    const collateral = await api.approval.getCollateral();
    baseStore.setCollateralList(collateral.data);
    
    const regions = await api.approval.getRegions();
    baseStore.setRegionsList(regions.data);

    const departmentLevel = await api.user.getDepartmentsLevel();
    baseStore.setDepartmentLevel(departmentLevel.data);
    
    resolveInit?.(userInfo.data);
    
  } catch (error) {
    customerInfoStore.setError(error instanceof Error ? error.message : 'Failed to load application data');
    rejectInit?.(error);
  } finally {
    // Always set loading to false when done
    customizer.SET_LOADING(false);
    isInitializing = false;
  }
}

// Function to check if app is initialized
export function isAppInitialized(): boolean {
  return initializationPromise !== null && !isInitializing;
}

// Function to wait for initialization
export function waitForInitialization(): Promise<any> {
  if (initializationPromise) {
    return initializationPromise;
  }
  return Promise.resolve();
} 