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
import { fakeBackend } from '@/utils/helpers/fake-backend';

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
fakeBackend();
const pinia = createPinia();
app.use(pinia);

// Choose authentication mode
const authMode = envConfig.AUTH_MODE ?? 'keycloak';

async function bootstrap() {
  if (authMode === 'keycloak') {
    // Setup Keycloak first so router guards can rely on it
    setupKeycloak(app);
  } else {
    // App initializer flow
    await initializeApp();
    // Kick off actual data loading in background; router can await if needed
    startInitialization();
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


