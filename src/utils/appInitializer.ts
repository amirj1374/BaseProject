import { api } from '@/services/api';
import { useCustomerInfoStore } from '@/stores/customerInfo';

export async function initializeApp() {
  try {
    console.log('Initializing app...');
    
    const customerInfoStore = useCustomerInfoStore();
    customerInfoStore.setLoading(true);
    
    // Call getUserInfo on app startup
    const userInfo = await api.user.getUserInfo();
    console.log('User info loaded:', userInfo.data);
    
    // Store the user info in the customerInfo store
    customerInfoStore.setUserInfo(userInfo.data);
    customerInfoStore.setLoading(false);
    
    return userInfo.data;
  } catch (error) {
    console.error('Failed to initialize app:', error);
    const customerInfoStore = useCustomerInfoStore();
    customerInfoStore.setError(error instanceof Error ? error.message : 'Failed to load user info');
    // Handle error appropriately - maybe redirect to login or show error message
    throw error;
  }
} 