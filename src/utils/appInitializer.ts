import { api } from '@/services/api';
import { useBaseStore } from '@/stores/base';
import { useCustomerInfoStore } from '@/stores/customerInfo';
import { useCustomizerStore } from '@/stores/customizer';

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

  try {
    customerInfoStore.clearError();

    // Critical API call first (user info) - this is the most important
    const userInfo = await api.user.getUserInfo();
    customerInfoStore.setUserInfo(userInfo.data);

    // Set and validate customizer settings immediately
    if (userInfo.data.customizer) {
      customizer.actTheme = validateTheme(userInfo.data.customizer.actTheme);
      customizer.fontTheme = validateFontTheme(userInfo.data.customizer.fontTheme);
      customizer.inputBg = validateInputBg(userInfo.data.customizer.inputBg);
      customizer.themeMode = validateThemeMode(userInfo.data.customizer.themeMode);
      customizer.layoutType = validateLayoutType(userInfo.data.customizer.layoutType || 'SideBar');
    }

    // Resolve critical initialization immediately after user info
    resolveInit?.(userInfo.data);

    // Defer non-critical API calls to improve LCP
    setTimeout(async () => {
      try {
        // Parallel API calls for non-critical data
        const [currency, collateral, regions, departmentLevel] = await Promise.allSettled([
          api.approval.fetchCurrencies(),
          api.approval.getCollateral(),
          api.approval.getRegions(),
          api.user.getDepartmentsLevel()
        ]);

        // Handle successful responses
        if (currency.status === 'fulfilled') {
          baseStore.setCurrencyList(currency.value.data);
        }
        if (collateral.status === 'fulfilled') {
          baseStore.setCollateralList(collateral.value.data);
        }
        if (regions.status === 'fulfilled') {
          baseStore.setRegionsList(regions.value.data);
        }
        if (departmentLevel.status === 'fulfilled') {
          baseStore.setDepartmentLevel(departmentLevel.value.data);
        }
      } catch (error) {
        console.warn('Non-critical data loading failed:', error);
      }
    }, 100);

  } catch (error) {
    customerInfoStore.setError(error instanceof Error ? error.message : 'Failed to load application data');
    rejectInit?.(error);
  } finally {
    // Set loading to false immediately after critical data is loaded
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