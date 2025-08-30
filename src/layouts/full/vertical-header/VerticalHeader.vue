<script setup lang="ts">
import { ref } from 'vue';
import { useCustomizerStore } from '@/stores/customizer';
// Icon Imports
import { IconMenu2, IconSearch, IconBell, IconSettings, IconPalette } from '@tabler/icons-vue';

// dropdown imports
import NotificationDD from './NotificationDD.vue';
import ProfileDD from './ProfileDD.vue';
import Searchbar from './SearchBarPanel.vue';
import LogoUser from '../logo/LogoUser.vue';

const customizer = useCustomizerStore();
const showSearch = ref(false);
function searchbox() {
  showSearch.value = !showSearch.value;
}
</script>

<template>
  <v-app-bar elevation="0" height="80">
    <v-btn
      class="hidden-md-and-down text-secondary"
      color="lightsecondary"
      icon
      rounded="sm"
      variant="flat"
      @click.stop="customizer.SET_MINI_SIDEBAR(!customizer.mini_sidebar)"
      size="small"
    >
      <IconMenu2 size="20" stroke-width="1.5" />
    </v-btn>
    <v-btn
      class="hidden-lg-and-up text-secondary ms-3"
      color="lightsecondary"
      icon
      rounded="sm"
      variant="flat"
      @click.stop="customizer.SET_SIDEBAR_DRAWER"
      size="small"
    >
      <IconMenu2 size="20" stroke-width="1.5" />
    </v-btn>

    <v-btn
      class="hidden-md-and-down text-secondary mr-2"
      color="lightsecondary"
      icon
      rounded="sm"
      variant="flat"
      @click.stop="customizer.SET_CUSTOMIZER_DRAWER(!customizer.Customizer_drawer)"
      size="small"
    >
      <IconPalette size="20" stroke-width="1.5" />
    </v-btn>
    <!-- search mobile -->
<!--    <v-btn-->
<!--      class="hidden-lg-and-up text-secondary mr-3"-->
<!--      color="lightsecondary"-->
<!--      icon-->
<!--      rounded="sm"-->
<!--      variant="flat"-->
<!--      size="small"-->
<!--      @click="searchbox"-->
<!--    >-->
<!--      <IconSearch size="17" stroke-width="1.5" />-->
<!--    </v-btn>-->

<!--    <v-sheet v-if="showSearch" class="search-sheet v-col-12">-->
<!--      <Searchbar :closesearch="searchbox" />-->
<!--    </v-sheet>-->

    <!-- ---------------------------------------------- -->
    <!-- Search part -->
    <!-- ---------------------------------------------- -->
<!--    <v-sheet class="mx-3 v-col-3 v-col-xl-2 v-col-lg-4 d-none d-lg-block">-->
<!--      <Searchbar />-->
<!--    </v-sheet>-->

    <!---/Search part -->

    <v-spacer />
    <!-- ---------------------------------------------- -->
    <!---right part -->
    <!-- ---------------------------------------------- -->

    <!-- ---------------------------------------------- -->
    <!-- Notification -->
    <!-- ---------------------------------------------- -->
    <v-menu :close-on-content-click="false">
      <template v-slot:activator="{ props }">
        <v-btn icon class="text-secondary mx-3" color="lightsecondary" rounded="sm" size="small" variant="flat" v-bind="props">
          <IconBell stroke-width="1.5" size="22" />
        </v-btn>
      </template>
      <v-sheet rounded="md" width="330" elevation="12">
        <NotificationDD />
      </v-sheet>
    </v-menu>

    <!-- ---------------------------------------------- -->
    <!-- User Profile -->
    <!-- ---------------------------------------------- -->
    <v-menu :close-on-content-click="false">
      <template v-slot:activator="{ props }">
        <v-btn class="profileBtn text-primary" color="lightprimary" variant="flat" rounded="pill" v-bind="props">
          <v-avatar size="30" class="ml-2 d-flex align-items-center">
            <LogoUser/>
          </v-avatar>
          <IconSettings stroke-width="2.5" />
        </v-btn>
      </template>
      <v-sheet rounded="md" width="330" elevation="12">
        <ProfileDD />
      </v-sheet>
    </v-menu>
  </v-app-bar>
</template>
