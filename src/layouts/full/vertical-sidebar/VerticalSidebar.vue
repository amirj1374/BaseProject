<script setup lang="ts">
import { useCustomerInfoStore } from '@/stores/customerInfo';
import { useCustomizerStore } from '@/stores/customizer';
import { computed } from 'vue';
import sidebarItems, { getFilteredSidebarItems } from './sidebarItem';

import Logo from '../logo/LogoMain.vue';
import NavCollapse from './NavCollapse/NavCollapse.vue';
import NavGroup from './NavGroup/NavGroup.vue';
import NavItem from './NavItem/NavItem.vue';

const customizer = useCustomizerStore();
const customerInfo = useCustomerInfoStore();

// Use filtered menu items based on user permissions
const sidebarMenu = computed(() => {
  // Only filter menu items if user info is loaded and has roles
  if (customerInfo.isUserInfoLoaded && customerInfo.getUserRoles.length > 0) {
    const filteredItems = getFilteredSidebarItems();
    console.log('Sidebar: Filtered menu items:', filteredItems.length, 'out of', sidebarItems.length);
    return filteredItems;
  }
  // Return all items if user info is not loaded yet or has no roles
  // This ensures sidebar is always visible during loading or if permissions fail
  console.log('Sidebar: Using all menu items (user info not loaded or no roles)');
  return sidebarItems;
});
</script>

<template>
  <v-navigation-drawer
    right
    v-model="customizer.Sidebar_drawer"
    elevation="0"
    rail-width="80"
    mobile-breakpoint="lg"
    app
    :class="['rightSidebar', { 'sidebar-closed': !customizer.Sidebar_drawer }]"
    :rail="customizer.mini_sidebar"
  >
    <!---Logo part -->

    <div class="pa-5">
      <Logo />
    </div>
    <!-- ---------------------------------------------- -->
    <!---Navigation -->
    <!-- ---------------------------------------------- -->
    <perfect-scrollbar class="scrollnavbar">
      <v-list class="pa-4">
        <!---Menu Loop -->
        <template v-for="(item, i) in sidebarMenu" :key="i">
          <!---Item Sub Header -->
          <NavGroup :item="item" v-if="item.header" :key="item.title" />
          <!---Item Divider -->
          <v-divider class="my-3" v-else-if="item.divider" />
          <!---If Has Child -->
          <NavCollapse class="leftPadding" :item="item" :level="0" v-else-if="item.children" />
          <!---Single Item-->
          <NavItem :item="item" v-else class="leftPadding" />
          <!---End Single Item-->
        </template>
      </v-list>
      <div v-if="customizer.Sidebar_drawer" class="pa-4 text-center">
        <v-chip color="inputBorder" size="small">نمایشی</v-chip>
      </div>
    </perfect-scrollbar>
  </v-navigation-drawer>
</template>

<style>
/* Completely hide text when sidebar is closed */
.rightSidebar.sidebar-closed .v-list-item-title,
.rightSidebar.sidebar-closed .v-list-item-subtitle,
.rightSidebar.sidebar-closed .v-list-subheader {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
}

/* Also hide when in rail mode */
.rightSidebar.v-navigation-drawer--rail .v-list-item-title,
.rightSidebar.v-navigation-drawer--rail .v-list-item-subtitle,
.rightSidebar.v-navigation-drawer--rail .v-list-subheader {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
}
</style>
