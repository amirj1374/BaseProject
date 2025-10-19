<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <div class="upload-form">
    <CustomDataTable
      ref="dataTableRef"
      :headers="headers"
      api-resource="report"
      :auto-fetch="true"
      :show-pagination="true"
      :height="550"
      :show-refresh-button="true"
      :routes="routes"
      :filter-component="FilterFlowReport"
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
import { CartableStatusTypeOptions, LoanRequestStatusOptions } from '@/types/enums/global';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import ApprovalEdit from '@/components/sections/approval/approvalEdit/approvalEdit.vue';
import FilterFlowReport from '@/components/sections/flowReport/FilterFlowReport.vue';

const routes = {
  'جزییات بیشتر⬅️': '/flowReportDetail/{id}'
};
const { requirePermission } = useRouteGuard();
const breadcrumbs = ref([
  {
    title: 'گزارش عملیات',
    disabled: false,
    href: '#'
  }
]);
const page = ref({ title: 'گزارش عملیات' });
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
    width: 200
  },
  {
    title: 'شماره مشتری',
    key: 'customerCode',
    sortable: true,
    width: 200
  },
  {
    title: 'نام مشتری',
    key: 'customerName',
    sortable: true,
    width: 200
  },
  {
    title: 'گروه مشتری',
    key: 'customerGroup',
    sortable: true,
    width: 200
  },
  {
    title: 'تاریخ ایجاد',
    key: 'creationDate',
    sortable: true,
    width: 200,
    isDate: true
  },
  {
    title: 'کاربر ایجاد کننده',
    key: 'createByName',
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
    options: CartableStatusTypeOptions,
    translate: true
  }
];
</script>
