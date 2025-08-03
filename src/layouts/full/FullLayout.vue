<script setup lang="ts">
import { RouterView } from 'vue-router';
import VerticalSidebarVue from './vertical-sidebar/VerticalSidebar.vue';
import VerticalHeaderVue from './vertical-header/VerticalHeader.vue';
import Customizer from './customizer/CustomizerPanel.vue';
import { useCustomizerStore } from '@/stores/customizer';
import Loading from '@/components/Loading.vue';
const customizer = useCustomizerStore();

</script>

<template>
  <v-locale-provider :rtl="true">
    <v-app
      :theme="customizer.actTheme"
      :class="[customizer.fontTheme, customizer.mini_sidebar ? 'mini-sidebar' : '', customizer.inputBg ? 'inputWithbg' : '']"
    >
      <Customizer />
      <VerticalSidebarVue/>
      <VerticalHeaderVue/>
      <v-main>
        <Loading/>
        <v-container fluid class="page-wrapper">
          <div>
            <RouterView />
<!--            <v-btn-->
<!--              class="customizer-btn"-->
<!--              size="large"-->
<!--              variant="flat"-->
<!--              color="secondary"-->
<!--              @click.stop="customizer.SET_CUSTOMIZER_DRAWER(!customizer.Customizer_drawer)"-->
<!--            >-->
<!--              <SettingsIcon class="icon" />-->
<!--            </v-btn>-->
          </div>
        </v-container>
      </v-main>
    </v-app>
  </v-locale-provider>
</template>
