import DigitLimit from '@/directives/v-digit-limit';
import { vPermission } from '@/directives/v-permission';
import '@/scss/style.scss';
import { initializeApp, startInitialization } from '@/utils/appInitializer';
import { createPinia } from 'pinia';
import { createApp, nextTick } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import { PerfectScrollbarPlugin } from 'vue3-perfect-scrollbar';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import { router } from './router';

import { fakeBackend } from '@/utils/helpers/fake-backend';

// print
import print from 'vue3-print-nb';

// Persian Date Picker
import Vue3PersianDatetimePicker from 'vue3-persian-datetime-picker';

const app = createApp(App);
fakeBackend();
const pinia = createPinia();
app.use(pinia);

// Create initialization promise BEFORE setting up router
const initPromise = initializeApp();

app.use(router);
app.use(PerfectScrollbarPlugin);
app.use(print);
app.use(VueApexCharts);
app.component('Vue3PersianDatetimePicker', Vue3PersianDatetimePicker);

// Register directives
app.directive('digit-limit', DigitLimit);
app.directive('permission', vPermission);

// Mount the app immediately for faster initial render
app.use(vuetify).mount('#app');

// Optimize initialization - show UI first, then load data
nextTick(async () => {
  // Import and use store after pinia is installed
  const { useCustomizerStore } = await import('@/stores/customizer');
  const customizer = useCustomizerStore();
  
  // Show minimal loading state briefly, then start data loading
  customizer.SET_LOADING(true);
  
  // Use requestIdleCallback or setTimeout to defer heavy operations
  const loadData = () => {
    startInitialization();
    
    // Wait for initialization to complete
    initPromise
      .then(() => {
        // App initialized successfully
      })
      .catch((error) => {
        // App initialization failed
      });
  };

  // Defer data loading to allow initial render
  if (window.requestIdleCallback) {
    window.requestIdleCallback(loadData, { timeout: 100 });
  } else {
    setTimeout(loadData, 50);
  }
});


