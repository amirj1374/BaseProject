<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCustomizerStore } from '@/stores/customizer';
import { useCustomerInfoStore } from '@/stores/customerInfo';
import sidebarItems, { getFilteredSidebarItems } from '../vertical-sidebar/sidebarItem';
import Logo from '../logo/LogoMain.vue';
// Icon Imports
import { IconMenu2, IconSearch, IconBell, IconSettings, IconPalette, IconChevronDown } from '@tabler/icons-vue';

// dropdown imports
import NotificationDD from './NotificationDD.vue';
import ProfileDD from './ProfileDD.vue';
import Searchbar from './SearchBarPanel.vue';
import LogoUser from '../logo/LogoUser.vue';

const customizer = useCustomizerStore();
const customerInfo = useCustomerInfoStore();
const showSearch = ref(false);

function searchbox() {
  showSearch.value = !showSearch.value;
}

// Use filtered menu items based on user permissions
const headerMenu = computed(() => {
  // Only filter menu items if user info is loaded
  if (customerInfo.isUserInfoLoaded) {
    return getFilteredSidebarItems();
  }
  // Return all items if user info is not loaded yet
  return sidebarItems;
});
</script>

<template>
  <v-app-bar elevation="0" height="80">
    <!-- <div class="pa-5">
      <Logo />
    </div> -->
    <v-btn
    v-if="customizer.menuOrientation === 'vertical'"
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
      class="hidden-md-and-down text-secondary mr-2 ml-2"
      color="lightsecondary"
      icon
      rounded="sm"
      variant="flat"
      @click.stop="customizer.SET_CUSTOMIZER_DRAWER(!customizer.Customizer_drawer)"
      size="small"
    >
      <IconPalette size="20" stroke-width="1.5" />
    </v-btn>

    <!-- Menu Items Section - Simple buttons -->
    <div class="header-menu-container" v-if="customizer.menuOrientation === 'horizontal'">
      <template v-for="(item, i) in headerMenu" :key="i">
        <!-- Single Menu Item -->
        <v-btn
          v-if="!item.children && !item.header && !item.divider"
          :to="item.type === 'external' ? '' : item.to"
          :href="item.type === 'external' ? item.to : ''"
          :target="item.type === 'external' ? '_blank' : ''"
          variant="text"
          :disabled="item.disabled"
          class="header-menu-btn mr-3"
          color="primary"
        >
          <component :is="item.icon" v-if="item.icon" class="mr-2" size="18" />
          <span>{{ item.title }}</span>
          <v-chip
            v-if="item.chip"
            :color="item.chipColor"
            :size="item.chipIcon ? 'small' : 'default'"
            :variant="item.chipVariant"
            :prepend-icon="item.chipIcon"
            class="ml-2"
          >
            {{ item.chip }}
          </v-chip>
        </v-btn>

        <!-- Menu Item with Dropdown -->
        <v-menu v-else-if="item.children && item.children.length > 0" offset-y>
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="text"
              :disabled="item.disabled"
              class="header-menu-btn"
              color="primary mr-3"
            >
              <component :is="item.icon" v-if="item.icon" class="mr-2" size="18" />
              <span class="mr-2">{{ item.title }}</span>
              <IconChevronDown size="20" class="ml-2" stroke-width="1.5" />
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              v-for="(child, childIndex) in item.children"
              :key="childIndex"
              :to="child.type === 'external' ? '' : child.to"
              :href="child.type === 'external' ? child.to : ''"
              :target="child.type === 'external' ? '_blank' : ''"
              :disabled="child.disabled"
            >
              <template v-slot:prepend v-if="child.icon">
                <component :is="child.icon" size="18" />
              </template>
              <v-list-item-title>{{ child.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <!-- Divider -->
        <v-divider v-else-if="item.divider" vertical class="mx-2" />
      </template>
    </div>
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
          <IconSettings stroke-width="2" />
        </v-btn>
      </template>
      <v-sheet rounded="md" width="330" elevation="12">
        <ProfileDD />
      </v-sheet>
    </v-menu>
  </v-app-bar>
</template>

<style scoped>
.header-menu-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 16px;
}

.header-menu-btn {
  text-transform: none;
  font-weight: 500;
  height: 40px;
  padding: 0 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.header-menu-btn:hover {
  background-color: rgb(var(--v-theme-primary), 0.1);
  transform: translateY(-1px);
}

.header-menu-btn:active {
  transform: translateY(0);
}
</style>
