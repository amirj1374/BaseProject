<template>
  <div class="dashboard-container">
    <!-- Critical LCP Content - Show immediately -->
    <div class="dashboard-skeleton" v-if="customerInfoStore.isLoading">
      <!-- Skeleton for faster perceived loading -->
      <div class="skeleton-card">
        <div class="skeleton-title"></div>
        <div class="skeleton-content"></div>
      </div>
      <div class="skeleton-card">
        <div class="skeleton-title"></div>
        <div class="skeleton-content"></div>
      </div>
    </div>

    <!-- Error State -->
    <v-container v-else-if="customerInfoStore.error">
      <v-row>
        <v-col cols="12">
          <v-alert type="error" title="خطا در بارگذاری اطلاعات" :text="customerInfoStore.error"></v-alert>
        </v-col>
      </v-row>
    </v-container>

    <!-- Dashboard Content - Load after critical content -->
    <v-container v-else fluid>
      <!-- Welcome Section - Critical LCP element -->
      <v-row>
        <v-col cols="12">
          <v-card class="mb-4 welcome-card">
            <v-card-text>
              <total-income />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- User Information Cards - Defer loading -->
      <v-row>
        <v-col cols="12" md="6" class="d-flex">
          <v-card class="w-100 h-100 info-card">
            <v-card-text class="pa-0">
              <total-growth />
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6" class="d-flex">
          <v-card class="w-100 h-100 info-card">
            <v-card-text class="pa-0">
              <data-labels />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { useCustomerInfoStore } from '@/stores/customerInfo';
import { computed, defineAsyncComponent } from 'vue';

// Lazy load dashboard components for better performance
const TotalIncome = defineAsyncComponent(() => import('@/views/dashboards/default/components/TotalIncome.vue'));
const TotalGrowth = defineAsyncComponent(() => import('@/views/dashboards/default/components/TotalGrowth.vue'));
const DataLabels = defineAsyncComponent(() => import('@/views/dashboards/default/components/DataLabels.vue'));
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
/* LCP Optimization Styles */
.dashboard-container {
  min-height: 85vh;
}


.welcome-title {
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
}


/* Skeleton loading styles */
.skeleton-title {
  height: 24px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 16px;
  width: 60%;
}

.skeleton-content {
  height: 120px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 8px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Performance optimizations */
.equal-height {
  display: flex;
  align-items: stretch;
}

.equal-height > * {
  flex: 1;
}

/* Critical content optimization */
.welcome-card {
  contain: layout style paint;
}

.info-card {
  contain: layout style paint;
}
</style>
