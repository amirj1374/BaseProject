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
import { initializeApp } from '@/utils/appInitializer';

import { fakeBackend } from '@/utils/helpers/fake-backend';

// print
import print from 'vue3-print-nb';

const app = createApp(App);
fakeBackend();
app.use(createPinia());
app.use(router);
app.use(PerfectScrollbarPlugin);
app.use(print);
app.use(VueApexCharts);

// Register directives
app.directive('digit-limit', DigitLimit);
app.directive('permission', vPermission);

// Initialize app and call getUserInfo on startup
initializeApp()
  .then(() => {
    console.log('App initialized successfully');
  })
  .catch((error) => {
    console.error('App initialization failed:', error);
  })
  .finally(() => {
    app.use(vuetify).mount('#app');
  });


