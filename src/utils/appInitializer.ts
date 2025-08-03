import { api } from '@/services/api';
import { useBaseStore } from '@/stores/base';
import { useCustomerInfoStore } from '@/stores/customerInfo';
import { useCustomizerStore } from '@/stores/customizer';

// Global initialization promise
let initializationPromise: Promise<any> | null = null;

export async function initializeApp() {
  // If already initializing, return the existing promise
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = new Promise(async (resolve, reject) => {
    const customerInfoStore = useCustomerInfoStore();
    const customizer = useCustomizerStore();
    const baseStore = useBaseStore();

    try {
      console.log('Initializing app...');    
      // Set loading to true at the start
      console.log('Setting loading to true...');
      customizer.SET_LOADING(true);
      console.log('Loading state after setting to true:', customizer.loading);
      customerInfoStore.clearError();
      
      // Sequential API calls - one after another
      console.log('Fetching user info...');
      const userInfo = await api.user.getUserInfo();
      customerInfoStore.setUserInfo(userInfo.data);
      
      console.log('Fetching currencies...');
      const currency = await api.approval.fetchCurrencies();
      baseStore.setCurrencyList(currency.data);
      
      console.log('Fetching collateral...');
      const collateral = await api.approval.getCollateral();
      baseStore.setCollateralList(collateral.data);
      
      console.log('Fetching regions...');
      const regions = await api.approval.getRegions();
      baseStore.setRegionsList(regions.data);

      console.log('Fetching departmentsLevel...');
      const departmentLevel = await api.user.getDepartmentsLevel();
      baseStore.setDepartmentLevel(departmentLevel.data);
      
      console.log('All API calls completed successfully');
      resolve(userInfo.data);
      
    } catch (error) {
      console.error('Failed to initialize app:', error);
      customerInfoStore.setError(error instanceof Error ? error.message : 'Failed to load application data');
      reject(error);
    } finally {
      // Always set loading to false when done
      console.log('Setting loading to false...');
      customizer.SET_LOADING(false);
      console.log('Loading state after setting to false:', customizer.loading);
    }
  });

  return initializationPromise;
}

// Function to check if app is initialized
export function isAppInitialized(): boolean {
  return initializationPromise !== null;
}

// Function to wait for initialization
export function waitForInitialization(): Promise<any> {
  if (initializationPromise) {
    return initializationPromise;
  }
  return Promise.resolve();
} 