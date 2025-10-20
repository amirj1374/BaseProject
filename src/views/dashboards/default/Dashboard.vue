<template>
  <div>
    <v-container fluid>
      <!-- Loading State -->
      <v-row v-if="customerInfoStore.isLoading">
        <v-col cols="12" class="text-center">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="mt-4">در حال بارگذاری اطلاعات کاربر...</p>
        </v-col>
      </v-row>

      <!-- Error State -->
      <v-row v-else-if="customerInfoStore.error">
        <v-col cols="12">
          <v-alert type="error" title="خطا در بارگذاری اطلاعات" :text="customerInfoStore.error"></v-alert>
        </v-col>
      </v-row>

      <!-- Dashboard Content -->
      <div v-else>
        <!-- Welcome Section -->
        <v-row>
          <v-col cols="12">
            <v-card class="mb-4">
              <v-card-title class="d-flex align-center">
              </v-card-title>
              <v-card-text>
                <total-income></total-income>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- User Information Cards -->
        <v-row>
          <!-- Personal Information -->
          <v-col cols="12" md="6" class="d-flex">
            <v-card class="w-100 h-100">
              <v-card-text class="pa-0">
                <total-growth />
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6" class="d-flex">
            <v-card class="w-100 h-100">
              <v-card-text class="pa-0">
                <data-labels />
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Branch Information -->
          <!--          <v-col cols="12" md="6">-->
          <!--            <v-card class="mb-4">-->
          <!--              <v-card-title class="d-flex align-center">-->
          <!--                اطلاعات شعبه-->
          <!--              </v-card-title>-->
          <!--              <v-card-text>-->
          <!--                <total-pay></total-pay>-->
          <!--              </v-card-text>-->
          <!--            </v-card>-->
          <!--          </v-col>-->
        </v-row>
      </div>
    </v-container>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue';
import { useCustomerInfoStore } from '@/stores/customerInfo';
import { IconUserCircle } from '@tabler/icons-vue';

// Lazy load dashboard components for better performance
const TotalIncome = defineAsyncComponent(() => import('@/views/dashboards/default/components/TotalIncome.vue'));
const TotalGrowth = defineAsyncComponent(() => import('@/views/dashboards/default/components/TotalGrowth.vue'));
const DataLabels = defineAsyncComponent(() => import('@/views/dashboards/default/components/DataLabels.vue'));

// Additional components (lazy loaded for non-critical content)
const PopularStocks = defineAsyncComponent(() => import('@/views/dashboards/default/components/PopularStocks.vue'));
const TotalEarning = defineAsyncComponent(() => import('@/views/dashboards/default/components/TotalEarning.vue'));
const TotalPay = defineAsyncComponent(() => import('@/views/dashboards/default/components/TotalPay.vue'));

const customerInfoStore = useCustomerInfoStore();

// Get user info from store
const userInfo = computed(() => customerInfoStore.getUserInfo);

// Format date helper function
const formatDate = (dateString) => {
  if (!dateString) return 'نامشخص';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
};
</script>

<style scoped>
.equal-height {
  display: flex;
  align-items: stretch;
}

.equal-height > * {
  flex: 1;
}
/* Add any custom styles here */
</style>
