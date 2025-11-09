import envConfig from '@/config/envConfig';
import DigitLimit from '@/directives/v-digit-limit';
import { vPermission } from '@/directives/v-permission';
import '@/scss/style.scss';
import { api } from '@/services/api';
import { fakeBackend } from '@/utils/helpers/fake-backend';
import { initializeApp, startInitialization } from '@/utils/samapAppInitializer';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import { PerfectScrollbarPlugin } from 'vue3-perfect-scrollbar';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import { router } from './router';

// Keycloak
import type { VueKeycloakInstance } from '@dsb-norge/vue-keycloak-js';
import { setupKeycloak } from './plugins/key-clock';

// print
import print from 'vue3-print-nb';

// Persian Date Picker
import Vue3PersianDatetimePicker from 'vue3-persian-datetime-picker';

const app = createApp(App);
fakeBackend();

const pinia = createPinia();
app.use(pinia);

const authMode = envConfig.AUTH_MODE ?? 'keycloak';
console.log('🔐 Resolved auth mode:', authMode);

async function bootstrap() {
  console.log('🚀 Bootstrap starting with authMode:', authMode);

  if (authMode === 'keycloak') {
    setupKeycloak(app);
  } else if (authMode === 'jwt') {
    try {
      const response = await api.user.getUserInfo();
      if (response?.data) {
        const { useAuthStore } = await import('@/stores/auth');
        const authStore = useAuthStore();
        authStore.user = response.data;
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error: any) {
      if (error?.response?.status !== 401) {
        console.warn('⚠️ getAccount API call failed:', error?.message ?? error);
      }
    }
  } else {
    console.log('📱 Initializing app via AppInitializer...');

    const initPromise = initializeApp();

    const { useCustomizerStore } = await import('@/stores/customizer');
    const customizer = useCustomizerStore();
    customizer.SET_LOADING(true);

    try {
      await startInitialization();
      await initPromise;
    } catch (error) {
      console.error('App initialization failed:', error);
      const { router } = await import('@/router');
      if (router.currentRoute.value.path !== '/auth/login') {
        router.push('/auth/login');
      }
      return;
    }

    if (authMode === 'dev') {
      console.log('🔧 Dev mode: forcing loading false');
      customizer.SET_LOADING(false);
      setTimeout(() => customizer.SET_LOADING(false), 100);
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

  app.use(vuetify).mount('#app');
}

bootstrap().catch((error) => {
  console.error('Bootstrap error:', error);
});

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $keycloak: VueKeycloakInstance;
  }
}
