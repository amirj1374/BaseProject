import DigitLimit from '@/directives/v-digit-limit';
import { vPermission } from '@/directives/v-permission';
import '@/scss/style.scss';
import { initializeApp, startInitialization } from '@/utils/samapAppInitializer';
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

// Mount the app first so loading component can be rendered
app.use(vuetify).mount('#app');

// Set loading to true and start initialization after nextTick
nextTick(async () => {
  // Import and use store after pinia is installed
  const { useCustomizerStore } = await import('@/stores/customizer');
  const customizer = useCustomizerStore();
  
  // Check if we're in demo mode
  if (import.meta.env.VITE_APP_ENV === 'demo') {
    // Skip initialization and set loading to false immediately
    console.log('🎭 Demo mode detected - skipping initialization');
    customizer.SET_LOADING(false);
  } else {
    // Set loading to true BEFORE starting initialization
    customizer.SET_LOADING(true);
    
    // Start the actual API calls
    startInitialization();
    
    // Wait for initialization to complete
    initPromise
      .then(() => {
        // App initialized successfully
      })
      .catch((error) => {
        // App initialization failed
      });
  }
});


