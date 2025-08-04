import { api } from '@/services/api';
import { useBaseStore } from '@/stores/base';
import { useCustomerInfoStore } from '@/stores/customerInfo';
import { useCustomizerStore } from '@/stores/customizer';

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
    
    // Sequential API calls - one after another
    const userInfo = await api.user.getUserInfo();
    customerInfoStore.setUserInfo(userInfo.data);
    
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