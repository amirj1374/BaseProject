<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <div class="upload-form">
      <CustomDataTable
        ref="dataTableRef"
        :headers="headers"
        api-resource="loan-requests/all"
        :auto-fetch="true"
        :show-pagination="true"
        :height="550"
        :show-refresh-button="true"
        :routes="routes"
        :filter-component="ApprovalEdit"
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
import { LoanRequestStatusOptions } from '@/types/enums/global';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import ApprovalEdit from '@/components/sections/approval/approvalEdit/approvalEdit.vue';

const routes = {
  'جزییات بیشتر ⬅️':'/approval/{id}'
};
const { requirePermission } = useRouteGuard();
const breadcrumbs = ref([
]);
const page = ref({ title: 'ویرایش مصوبه ها' });
// Reactive data
const dataTableRef = ref();
const showSnackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');

// Headers configuration with custom JSON support
const headers = [
  {
    title: 'نام شعبه',
    key: 'branchName',
    sortable: true,
    width: 200,
  },
  {
    title: 'شماره مشتری',
    key: 'cif',
    sortable: true,
    width: 200,
  },
  {
    title: 'کد ملی',
    key: 'nationalCode',
    sortable: true,
    width: 200,
  },
  {
    title: 'کاربر ایجاد کننده',
    key: 'createdBy',
    sortable: true,
    width: 200
  },
  {
    title: 'کد رهگیری',
    key: 'trackingCode',
    sortable: true,
    width: 200
  },
  {
    title: 'تاریخ درخواست',
    key: 'requestDate',
    sortable: true,
    width: 150,
    isDate: true
  },
  {
    title: 'وضعیت',
    key: 'status',
    sortable: true,
    width: 150,
    options: LoanRequestStatusOptions,
    translate: true
  }
];
onMounted(() => {
  // Check if user has permission to access this page
  requirePermission('admin');
});
</script>
