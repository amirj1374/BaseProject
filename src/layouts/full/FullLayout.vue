<script setup lang="ts">
import Loading from '@/components/Loading.vue';
import { useCustomizerStore } from '@/stores/customizer';
import { onMounted, onUnmounted, ref } from 'vue';
import { RouterView } from 'vue-router';
import Customizer from './customizer/CustomizerPanel.vue';
import VerticalHeaderVue from './vertical-header/VerticalHeader.vue';
import VerticalSidebarVue from './vertical-sidebar/VerticalSidebar.vue';

const customizer = useCustomizerStore();

// Global notification system
const showNotification = ref(false);
const notificationMessage = ref('');
const notificationType = ref<'success' | 'error' | 'warning'>('error');

function handleGlobalNotification(event: CustomEvent) {
  const { message, type } = event.detail;
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;
}

onMounted(() => {
  window.addEventListener('show-notification', handleGlobalNotification as EventListener);
});

onUnmounted(() => {
  window.removeEventListener('show-notification', handleGlobalNotification as EventListener);
});

</script>

<template>
  <v-locale-provider :rtl="true">
    <v-app
      :theme="customizer.actTheme"
      :class="[customizer.fontTheme, customizer.mini_sidebar ? 'mini-sidebar' : '', customizer.inputBg ? 'inputWithbg' : '']"
    >
      <Customizer />
      <!-- Show sidebar when menu orientation is vertical -->
      <VerticalSidebarVue v-if="customizer.menuOrientation === 'vertical'"/>
      <VerticalHeaderVue/>
      <v-main>
        <Loading/>
        <v-container fluid class="page-wrapper">
          <div>
            <RouterView />
            <!-- <v-btn
              class="customizer-btn"
              size="small"
              variant="flat"
              color="secondary"
              @click.stop="customizer.SET_CUSTOMIZER_DRAWER(!customizer.Customizer_drawer)"
            >
              <IconSettings/>
            </v-btn> -->
          </div>
        </v-container>
      </v-main>
      
      <!-- Global Notification Snackbar -->
      <v-snackbar 
        v-model="showNotification" 
        :color="notificationType === 'error' ? 'error' : notificationType === 'warning' ? 'warning' : 'success'"
        :timeout="5000" 
        location="top"
      >
        {{ notificationMessage }}
        <template v-slot:actions>
          <v-btn color="white" variant="text" @click="showNotification = false">
            بستن
          </v-btn>
        </template>
      </v-snackbar>
    </v-app>
  </v-locale-provider>
</template>
