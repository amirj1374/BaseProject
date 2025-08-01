<script setup lang="ts">
import { ref } from 'vue';
import { IconSettings, IconLogout, IconUser } from '@tabler/icons-vue';
import { useAuthStore } from '@/stores/auth';
import { useCustomerInfoStore } from '@/stores/customerInfo';

const swt1 = ref(true);
const swt2 = ref(false);
const authStore = useAuthStore();
const customerInfoStore = useCustomerInfoStore();
</script>

<template>
  <!-- ---------------------------------------------- -->
  <!-- profile DD -->
  <!-- ---------------------------------------------- -->
  <div class="pa-4">
    <h4 class="mb-n1">صبح بخیر, <span class="font-weight-regular">{{ customerInfoStore.userInfo?.fullName }}</span></h4>
    <span class="text-subtitle-2 text-medium-emphasis">{{ customerInfoStore.userInfo?.position }}</span>

    <v-text-field persistent-placeholder placeholder="جستجو" class="my-3" color="primary" variant="outlined" hide-details>
<!--      <template v-slot:prepend-inner>-->
<!--        <SearchIcon stroke-width="1.5" size="20" class="text-lightText SearchIcon" />-->
<!--      </template>-->
    </v-text-field>

    <v-divider></v-divider>
    <perfect-scrollbar style="height: calc(100vh - 300px); max-height: 515px">
      <div class="bg-lightprimary rounded-md px-5 py-3 my-3">
        <div class="d-flex align-center justify-space-between">
          <h5 class="text-h5">فعال سازی اعلان ها</h5>
          <div>
            <v-switch v-model="swt2" color="primary" hide-details></v-switch>
          </div>
        </div>
      </div>

      <v-divider></v-divider>

      <v-list class="mt-3">
        <v-list-item color="secondary" rounded="md">
          <template v-slot:prepend>
            <IconSettings size="20" class="ml-2" />
          </template>

          <v-list-item-title class="text-subtitle-2">تنظیمات کاربری</v-list-item-title>
        </v-list-item>

        <v-list-item color="secondary" rounded="md">
          <template v-slot:prepend>
            <IconUser size="20" class="ml-2" />
          </template>

          <v-list-item-title class="text-subtitle-2"> پروفایل</v-list-item-title>

          <template v-slot:append>
            <v-chip color="warning" class="text-white" text="02" variant="flat" size="small" />
          </template>
        </v-list-item>

        <v-list-item @click="authStore.logout()" color="secondary" rounded="md">
          <template v-slot:prepend>
            <IconLogout size="20" class="ml-2" />
          </template>

          <v-list-item-title class="text-subtitle-2"> خروج</v-list-item-title>
        </v-list-item>
      </v-list>
    </perfect-scrollbar>
  </div>
</template>
