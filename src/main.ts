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

// print
import print from 'vue3-print-nb';

// Persian Date Picker
import Vue3PersianDatetimePicker from 'vue3-persian-datetime-picker';
// Keycloak
import type { VueKeycloakInstance } from '@dsb-norge/vue-keycloak-js'
import { setupKeycloak } from './plugins/key-clock'
import envConfig from '@/config/envConfig'
import { initializeApp, startInitialization } from '@/utils/appInitializer'

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

// Choose authentication mode
const authMode = envConfig.AUTH_MODE ?? 'keycloak';

async function bootstrap() {
  console.log('🚀 Bootstrap starting with authMode:', authMode);
  
  if (authMode === 'keycloak') {
    // Setup Keycloak first so router guards can rely on it
    setupKeycloak(app);
  } else {
    // App initializer flow
    console.log('📱 Initializing app...');
    await initializeApp();
    // Kick off actual data loading in background; router can await if needed
    startInitialization();
    
    // In dev mode, immediately set loading to false to show content
    if (authMode === 'dev') {
      console.log('🔧 Dev mode: setting loading to false');
      const { useCustomizerStore } = await import('@/stores/customizer');
      const customizer = useCustomizerStore();
      customizer.SET_LOADING(false);
      console.log('✅ Loading set to false, current state:', customizer.loading);
      
      // Force loading to false after a short delay to override any components that set it to true
      setTimeout(() => {
        customizer.SET_LOADING(false);
        console.log('🔄 Forced loading to false again');
      }, 100);
    }
  }

  app.use(router);
  app.use(PerfectScrollbarPlugin);
  app.use(print);
  app.use(VueApexCharts);
  app.component('Vue3PersianDatetimePicker', Vue3PersianDatetimePicker);

  // Register directives
  app.directive('digit-limit', DigitLimit);
  app.directive('permission', vPermission);

  // Mount the app
  app.use(vuetify).mount('#app');
}

bootstrap();

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $keycloak: VueKeycloakInstance
  }
}


