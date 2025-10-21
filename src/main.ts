import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';
import vuetify from './plugins/vuetify';
import '@/scss/style.scss';
import { PerfectScrollbarPlugin } from 'vue3-perfect-scrollbar';
import VueApexCharts from 'vue3-apexcharts';
import DigitLimit from '@/directives/v-digit-limit'
import { vPermission } from '@/directives/v-permission';
import { initializeApp, startInitialization } from '@/utils/appInitializer';
import { nextTick } from 'vue';

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
});


