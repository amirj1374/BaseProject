import { api } from '@/services/api';
import { useBaseStore } from '@/stores/base';
import { useCustomerInfoStore } from '@/stores/customerInfo';
import { useCustomizerStore } from '@/stores/customizer';

// Global notification function
function showNotification(message: string, type: 'success' | 'error' | 'warning' = 'error') {
  // Try to find and trigger a global notification system
  const event = new CustomEvent('show-notification', {
    detail: { message, type }
  });
  window.dispatchEvent(event);
  
  // Fallback to console
  console.log(`[${type.toUpperCase()}] ${message}`);
}

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

    // Try to get user info with fallback handling
    let userInfo = null;
    try {
      const userInfoPromise = api.user.getUserInfo();
      
      // Set timeout for critical API call to prevent blocking LCP
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API timeout')), 5000)
      );
      
      userInfo = await Promise.race([userInfoPromise, timeoutPromise]) as any;
      customerInfoStore.setUserInfo(userInfo.data);
    } catch (userError) {
      console.warn('User info API failed, continuing with default settings:', userError);
      
      // Show error notification to user
      showNotification('خطا در بارگذاری اطلاعات کاربر. از تنظیمات پیش‌فرض استفاده می‌شود.', 'error');
      console.error('User info API error:', userError);
      
      // Set default user info to prevent app from breaking
      const defaultUserInfo = {
        id: 'guest',
        name: 'Guest User',
        sub: 'guest',
        emailVerified: false,
        issuer: 'system',
        branchName: 'Default',
        customizer: {
          actTheme: 'PurpleTheme',
          fontTheme: 'vazir',
          inputBg: false,
          themeMode: 'light',
          layoutType: 'SideBar'
        }
      } as any;
      customerInfoStore.setUserInfo(defaultUserInfo);
      userInfo = { data: defaultUserInfo };
    }

    // Set and validate customizer settings immediately
    if (userInfo.data.customizer) {
      customizer.actTheme = validateTheme(userInfo.data.customizer.actTheme);
      customizer.fontTheme = validateFontTheme(userInfo.data.customizer.fontTheme);
      customizer.inputBg = validateInputBg(userInfo.data.customizer.inputBg);
      customizer.themeMode = validateThemeMode(userInfo.data.customizer.themeMode);
      customizer.layoutType = validateLayoutType(userInfo.data.customizer.layoutType || 'SideBar');
    }

    // Always resolve initialization to prevent app from breaking
    resolveInit?.(userInfo.data);

    // Defer non-critical API calls to improve LCP - increased delay
    setTimeout(async () => {
      try {
        // Use requestIdleCallback for better performance
        const loadNonCriticalData = async () => {
          const [currency, collateral, regions, departmentLevel] = await Promise.allSettled([
            api.approval.fetchCurrencies(),
            api.approval.getCollateral(),
            api.approval.getRegions(),
            api.user.getDepartmentsLevel()
          ]);

          // Handle successful responses
          if (currency.status === 'fulfilled') {
            baseStore.setCurrencyList(currency.value.data);
          } else if (currency.status === 'rejected') {
            console.warn('Currency API failed:', currency.reason);
            showNotification('خطا در بارگذاری لیست ارزها', 'warning');
          }
          
          if (collateral.status === 'fulfilled') {
            baseStore.setCollateralList(collateral.value.data);
          } else if (collateral.status === 'rejected') {
            console.warn('Collateral API failed:', collateral.reason);
            showNotification('خطا در بارگذاری لیست وثیقه‌ها', 'warning');
          }
          
          if (regions.status === 'fulfilled') {
            baseStore.setRegionsList(regions.value.data);
          } else if (regions.status === 'rejected') {
            console.warn('Regions API failed:', regions.reason);
            showNotification('خطا در بارگذاری لیست مناطق', 'warning');
          }
          
          if (departmentLevel.status === 'fulfilled') {
            baseStore.setDepartmentLevel(departmentLevel.value.data);
          } else if (departmentLevel.status === 'rejected') {
            console.warn('Department Level API failed:', departmentLevel.reason);
            showNotification('خطا در بارگذاری اطلاعات بخش‌ها', 'warning');
          }
        };

        // Use requestIdleCallback if available, otherwise setTimeout
        if (window.requestIdleCallback) {
          window.requestIdleCallback(loadNonCriticalData, { timeout: 2000 });
        } else {
          setTimeout(loadNonCriticalData, 500);
        }
      } catch (error) {
        console.warn('Non-critical data loading failed:', error);
      }
    }, 200);

  } catch (error) {
    console.warn('Critical initialization error, using fallback:', error);
    
    // Show critical error notification
    showNotification('خطای بحرانی در بارگذاری برنامه. از تنظیمات پیش‌فرض استفاده می‌شود.', 'error');
    
    // Don't break the app - provide fallback data
    const fallbackUserInfo = {
      id: 'guest',
      name: 'Guest User',
      sub: 'guest',
      emailVerified: false,
      issuer: 'system',
      branchName: 'Default',
      customizer: {
        actTheme: 'PurpleTheme',
        fontTheme: 'vazir',
        inputBg: false,
        themeMode: 'light',
        layoutType: 'SideBar'
      }
    } as any;
    
    customerInfoStore.setUserInfo(fallbackUserInfo);
    
    // Set default customizer settings
    customizer.actTheme = 'PurpleTheme';
    customizer.fontTheme = 'vazir';
    customizer.inputBg = false;
    customizer.themeMode = 'light';
    customizer.layoutType = 'SideBar';
    
    // Always resolve to prevent app from breaking
    resolveInit?.(fallbackUserInfo);
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