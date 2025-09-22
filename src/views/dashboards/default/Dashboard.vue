<template>
  <div>
    <v-container fluid>
      <!-- Loading State -->
      <v-row v-if="customerInfoStore.isLoading">
        <v-col cols="12" class="text-center">

          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          ></v-progress-circular>
          <p class="mt-4">در حال بارگذاری اطلاعات کاربر...</p>
        </v-col>
      </v-row>

      <!-- Error State -->
      <v-row v-else-if="customerInfoStore.error">
        <v-col cols="12">
          <v-alert
            type="error"
            title="خطا در بارگذاری اطلاعات"
            :text="customerInfoStore.error"
          ></v-alert>
        </v-col>
      </v-row>

      <!-- Dashboard Content -->
      <div v-else>
        <!-- Welcome Section -->
        <v-row>
          <v-col cols="12">
            <v-card class="mb-4">
              <v-card-title class="d-flex align-center">
                <IconUserCircle size="32" class="mr-3" color="primary" />
              </v-card-title>
              <v-card-text>
                <h2 class="text-h4 mb-2">{{ userInfo?.fullName || 'کاربر' }}</h2>
                <p class="text-body-1 text-medium-emphasis">
                  خوش آمدید! به داشبورد سیستم مدیریت
                </p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- User Information Cards -->
        <v-row>
          <!-- Personal Information -->
          <v-col cols="12" md="6">
            <v-card class="mb-4">
              <v-card-title class="d-flex align-center">
                اطلاعات شخصی
              </v-card-title>
              <v-card-text>
                <v-list>
                  <v-list-item>
                    <v-list-item-title>نام کاربری</v-list-item-title>
                    <v-list-item-subtitle>{{ userInfo?.username || 'نامشخص' }}</v-list-item-subtitle>
                  </v-list-item>
                  
                  <v-list-item>
                    <v-list-item-title>ایمیل</v-list-item-title>
                    <v-list-item-subtitle>{{ userInfo?.email || 'نامشخص' }}</v-list-item-subtitle>
                  </v-list-item>
                  
                  <v-list-item>
                    <v-list-item-title>موقعیت شغلی</v-list-item-title>
                    <v-list-item-subtitle>{{ userInfo?.position || 'نامشخص' }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Branch Information -->
          <v-col cols="12" md="6">
            <v-card class="mb-4">
              <v-card-title class="d-flex align-center">
                اطلاعات شعبه
              </v-card-title>
              <v-card-text>
                <v-list>
                  <v-list-item>
                    <v-list-item-title>نام شعبه</v-list-item-title>
                    <v-list-item-subtitle>{{ userInfo?.branchName || 'نامشخص' }}</v-list-item-subtitle>
                  </v-list-item>
                  
                  <v-list-item>
                    <v-list-item-title>کد شعبه</v-list-item-title>
                    <v-list-item-subtitle>{{ userInfo?.branchCode || 'نامشخص' }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Roles and Permissions -->
        <v-row>
          <!-- User Roles -->
          <v-col cols="12" md="6">
            <v-card class="mb-4">
              <v-card-title class="d-flex align-center">
                نقش های کاربری
              </v-card-title>
              <v-card-text>
                <div v-if="userInfo?.roles && userInfo.roles.length > 0">
                  <v-chip
                    v-for="role in userInfo.roles"
                    :key="role"
                    class="ma-1"
                    color="primary"
                    variant="outlined"
                  >
                    {{ role }}
                  </v-chip>
                </div>
                <p v-else class="text-body-2 text-medium-emphasis">هیچ نقشی تعریف نشده است</p>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Lotus Roles -->
          <v-col cols="12" md="6">
            <v-card class="mb-4">
              <v-card-title class="d-flex align-center">
                نقش های لوتوس
              </v-card-title>
              <v-card-text>
                <div v-if="userInfo?.lotusRoles && userInfo.lotusRoles.length > 0">
                  <v-chip
                    v-for="role in userInfo.lotusRoles"
                    :key="role"
                    class="ma-1"
                    color="error"
                    variant="outlined"
                  >
                    {{ role }}
                  </v-chip>
                </div>
                <p v-else class="text-body-2 text-medium-emphasis">هیچ نقش لوتوسی تعریف نشده است</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useCustomerInfoStore } from '@/stores/customerInfo';
import { IconUserCircle } from '@tabler/icons-vue';

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
/* Add any custom styles here */
</style> 