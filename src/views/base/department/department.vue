<template>
  <div class="section-header">
    <h3 class="group-title">مدیریت دپارتمان ها</h3>
    <div class="header-actions">
      <v-btn color="primary" @click="loadCustomJsonData">
        <v-icon left>mdi-json</v-icon>
        بارگذاری JSON سفارشی
      </v-btn>
      <v-btn color="secondary" @click="refreshData" :loading="refreshing">
        <v-icon left>mdi-refresh</v-icon>
        بروزرسانی
      </v-btn>
    </div>
  </div>
  
  <v-card class="department-card">
    <v-card-text>
      <CustomDataTable
        ref="dataTableRef"
        :headers="headers"
        api-resource="referral-config-template"
        :auto-fetch="false"
        :show-pagination="true"
        :height="600"
        :actions="['create', 'edit', 'delete']"
        :form-component="CreateActionType"
        @item-created="onItemCreated"
        @item-updated="onItemUpdated"
        @item-deleted="onItemDeleted"
      />
    </v-card-text>
  </v-card>
  
  <!-- Success/Error Messages -->
  <v-snackbar v-model="showSnackbar" :color="snackbarColor" timeout="3000">
    {{ snackbarMessage }}
  </v-snackbar>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRouteGuard } from '@/composables/useRouteGuard';
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import CreateActionType from '@/components/sections/actionType/CreateActionType.vue';

const { requirePermission } = useRouteGuard();

// Reactive data
const dataTableRef = ref();
const refreshing = ref(false);
const showSnackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');

// Headers configuration with custom JSON support
const headers = [
  { 
    title: 'نقش مبدا', 
    key: 'fromRole', 
    sortable: true, 
    width: 200,
    // Example of nested key usage
    nestedKey: 'fromRole.name',
    // Custom formatter example
    formatter: (value: any, item: any) => {
      if (item.fromRole && typeof item.fromRole === 'object') {
        return `${item.fromRole.name} (${item.fromRole.code})`;
      }
      return value;
    }
  },
  { 
    title: 'نقش مقصد', 
    key: 'toRole', 
    sortable: true, 
    width: 200,
    nestedKey: 'toRole.name',
    formatter: (value: any, item: any) => {
      if (item.toRole && typeof item.toRole === 'object') {
        return `${item.toRole.name} (${item.toRole.code})`;
      }
      return value;
    }
  },
  { 
    title: 'نوع عملیات', 
    key: 'actionType', 
    sortable: true, 
    width: 200,
    options: [
      { title: 'تایید', value: 'APPROVE' },
      { title: 'رد', value: 'REJECT' },
      { title: 'بازگشت', value: 'RETURN' },
      { title: 'ارجاع', value: 'REFER' }
    ],
    translate: true
  },
  { 
    title: 'وضعیت', 
    key: 'status', 
    sortable: true, 
    width: 120,
    options: [
      { title: 'فعال', value: 'ACTIVE' },
      { title: 'غیرفعال', value: 'INACTIVE' }
    ],
    translate: true
  },
  { 
    title: 'کاربر ایجاد کننده', 
    key: 'createdBy', 
    sortable: true, 
    width: 200,
    nestedKey: 'createdBy.fullName',
    customRenderer: (item: any) => {
      if (item.createdBy && typeof item.createdBy === 'object') {
        return `${item.createdBy.fullName} - ${item.createdBy.email}`;
      }
      return item.createdBy || 'نامشخص';
    }
  },
  { 
    title: 'تاریخ ایجاد', 
    key: 'createdAt', 
    sortable: true, 
    width: 150, 
    isDate: true 
  }
];


const refreshData = async () => {
  refreshing.value = true;
  try {
    await dataTableRef.value?.fetchData();
    showSnackbar.value = true;
    snackbarMessage.value = 'داده ها با موفقیت بروزرسانی شد';
    snackbarColor.value = 'success';
  } catch (error) {
    showSnackbar.value = true;
    snackbarMessage.value = 'خطا در بروزرسانی داده ها';
    snackbarColor.value = 'error';
  } finally {
    refreshing.value = false;
  }
};

// Load sample custom JSON data
const loadCustomJsonData = () => {
  const customJsonData = [
    {
      id: 1,
      fromRole: {
        id: 1,
        name: 'مدیر سیستم',
        code: 'SYSTEM_ADMIN',
        department: 'IT'
      },
      toRole: {
        id: 2,
        name: 'مدیر دپارتمان',
        code: 'DEPT_MANAGER',
        department: 'HR'
      },
      actionType: 'APPROVE',
      status: 'ACTIVE',
      createdBy: {
        id: 101,
        fullName: 'احمد محمدی',
        email: 'ahmad@example.com',
        username: 'ahmad.m'
      },
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      fromRole: {
        id: 2,
        name: 'مدیر دپارتمان',
        code: 'DEPT_MANAGER',
        department: 'Finance'
      },
      toRole: {
        id: 3,
        name: 'کارشناس',
        code: 'EXPERT',
        department: 'Finance'
      },
      actionType: 'REFER',
      status: 'ACTIVE',
      createdBy: {
        id: 102,
        fullName: 'فاطمه احمدی',
        email: 'fateme@example.com',
        username: 'fateme.a'
      },
      createdAt: '2024-01-14T14:20:00Z'
    },
    {
      id: 3,
      fromRole: {
        id: 3,
        name: 'کارشناس',
        code: 'EXPERT',
        department: 'Operations'
      },
      toRole: {
        id: 4,
        name: 'کاربر عادی',
        code: 'REGULAR_USER',
        department: 'Operations'
      },
      actionType: 'RETURN',
      status: 'INACTIVE',
      createdBy: {
        id: 103,
        fullName: 'علی رضایی',
        email: 'ali@example.com',
        username: 'ali.r'
      },
      createdAt: '2024-01-13T09:15:00Z'
    }
  ];
  
  // Update the table data directly
  if (dataTableRef.value) {
    dataTableRef.value.items = customJsonData;
    dataTableRef.value.totalSize = customJsonData.length;
  }
  
  showSnackbar.value = true;
  snackbarMessage.value = 'داده های JSON سفارشی بارگذاری شد';
  snackbarColor.value = 'success';
};

// Event handlers
const onItemCreated = (item: any) => {
  showSnackbar.value = true;
  snackbarMessage.value = 'آیتم جدید با موفقیت ایجاد شد';
  snackbarColor.value = 'success';
};

const onItemUpdated = (item: any) => {
  showSnackbar.value = true;
  snackbarMessage.value = 'آیتم با موفقیت بروزرسانی شد';
  snackbarColor.value = 'success';
};

const onItemDeleted = (item: any) => {
  showSnackbar.value = true;
  snackbarMessage.value = 'آیتم با موفقیت حذف شد';
  snackbarColor.value = 'success';
};



onMounted(() => {
  // Check if user has permission to access this page
  requirePermission('admin');
});
</script>