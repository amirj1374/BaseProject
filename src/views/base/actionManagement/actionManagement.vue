<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <div class="upload-form">
      <CustomDataTable
        ref="dataTableRef"
        :headers="headers"
        api-resource="referral-config-template"
        :auto-fetch="true"
        :show-pagination="true"
        :height="550"
        :actions="['create', 'edit', 'delete']"
        :form-component="CreateActionManagement"
        :show-refresh-button="true"
        @item-created="onItemCreated"
        @item-updated="onItemUpdated"
        @item-deleted="onItemDeleted"
      />
    </div>
  <!-- Success/Error Messages -->
  <v-snackbar v-model="showSnackbar" :color="snackbarColor" timeout="3000">
    {{ snackbarMessage }}
  </v-snackbar>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRouteGuard } from '@/composables/useRouteGuard';
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import CreateActionManagement from '@/components/sections/actionManagement/CreateActionManagement.vue';
import { ActionTypeOptions, DepartmentTypeOptions } from '@/types/enums/global';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';

const { requirePermission } = useRouteGuard();
const breadcrumbs = ref([
  {
    title: 'اطلاعات پایه',
    disabled: false,
    href: '#'
  }
]);
const page = ref({ title: 'مدیریت عملیات' });
// Reactive data
const dataTableRef = ref();
const showSnackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');

// Headers configuration with custom JSON support
const headers = [
  {
    title: 'رکن مبدا',
    key: 'fromDepartmentLevel',
    sortable: true,
    width: 200,
    translate: true,
    options: DepartmentTypeOptions,
  },
  {
    title: 'رکن مقصد',
    key: 'toDepartmentLevel',
    sortable: true,
    width: 200,
    translate: true,
    options: DepartmentTypeOptions,
  },
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
        return `${item.fromRole.description}`;
      }
      return value;
    }
  },
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
        return `${item.fromRole.description}`;
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
        return `${item.toRole.description}`;
      }
      return value;
    }
  },
  {
    title: 'نوع عملیات',
    key: 'actionType',
    sortable: true,
    width: 200,
    options: ActionTypeOptions,
    translate: true
  },
  {
    title: 'کاربر ایجاد کننده',
    key: 'createdBy',
    sortable: true,
    width: 200
  },
  {
    title: 'تاریخ ایجاد',
    key: 'createdAt',
    sortable: true,
    width: 150,
    isDate: true
  }
];

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
