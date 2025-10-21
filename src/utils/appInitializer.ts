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
let hasCompletedInitialization = false;

// Function to load other APIs sequentially after initializer
async function loadOtherAPIs(baseStore: any) {
  console.log('🔄 Starting sequential API calls...');
  
  // 1. Fetch currencies first
  try {
    console.log('📡 Calling fetchCurrencies...');
    const currencyResponse = await api.approval.fetchCurrencies();
    baseStore.setCurrencyList(currencyResponse.data);
    console.log('✅ fetchCurrencies completed successfully');
  } catch (error) {
    console.warn('❌ Currency API failed:', error);
    showNotification('خطا در بارگذاری لیست ارزها', 'error');
  }

  // 2. Fetch collateral second
  try {
    console.log('📡 Calling getCollateral...');
    const collateralResponse = await api.approval.getCollateral();
    baseStore.setCollateralList(collateralResponse.data);
    console.log('✅ getCollateral completed successfully');
  } catch (error) {
    console.warn('❌ Collateral API failed:', error);
    showNotification('خطا در بارگذاری لیست وثیقه‌ها', 'error');
  }

  // 3. Fetch regions third
  try {
    console.log('📡 Calling getRegions...');
    const regionsResponse = await api.approval.getRegions();
    baseStore.setRegionsList(regionsResponse.data);
    console.log('✅ getRegions completed successfully');
  } catch (error) {
    console.warn('❌ Regions API failed:', error);
    showNotification('خطا در بارگذاری لیست مناطق', 'error');
  }

  // 4. Fetch department levels last
  try {
    console.log('📡 Calling getDepartmentsLevel...');
    const departmentResponse = await api.user.getDepartmentsLevel();
    baseStore.setDepartmentLevel(departmentResponse.data);
    console.log('✅ getDepartmentsLevel completed successfully');
  } catch (error) {
    console.warn('❌ Department Level API failed:', error);
    showNotification('خطا در بارگذاری اطلاعات دپارتمان ها', 'error');
  }

  console.log('🎉 All sequential API calls completed!');
}

export async function initializeApp() {
  // Skip initialization in demo mode
  if (import.meta.env.VITE_APP_ENV === 'demo') {
    console.log('🎭 Demo mode detected - skipping app initialization');
    return Promise.resolve({ demo: true });
  }

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
  // Skip initialization in demo mode
  if (import.meta.env.VITE_APP_ENV === 'demo') {
    console.log('🎭 Demo mode detected - skipping startInitialization');
    return;
  }

  // Check if initialization has already been completed
  if (hasCompletedInitialization) {
    console.log('⚠️ App already initialized, skipping initialization');
    return;
  }
  
  if (!isInitializing) {
    console.log('⚠️ App is not in initializing state, skipping initialization');
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

    // Wait for initializer to complete, then call other APIs
    console.log('✅ Initializer completed, now starting other API calls...');
    
    // Call other APIs sequentially after initializer is done
    await loadOtherAPIs(baseStore);
    
    // Always resolve initialization to prevent app from breaking
    resolveInit?.(userInfo.data);

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
    hasCompletedInitialization = true;
    console.log('✅ App initialization completed successfully');
  }
}

// Function to check if app is initialized
export function isAppInitialized(): boolean {
  return hasCompletedInitialization;
}

// Function to wait for initialization
export function waitForInitialization(): Promise<any> {
  if (initializationPromise) {
    return initializationPromise;
  }
  return Promise.resolve();
}

// Function to reset initialization state (useful for logout)
export function resetInitialization() {
  initializationPromise = null;
  resolveInit = null;
  rejectInit = null;
  isInitializing = false;
  hasCompletedInitialization = false;
  console.log('🔄 App initialization state reset');
} 