<template>
  <CustomDataTable
    ref="dataTableRef"
    :headers="headers"
    api-resource="cartable-report"
    :auto-fetch="true"
    :show-pagination="true"
    :height="550"
    :filter-component="FilterCartable"
    :custom-actions="customActions"
  />
</template>
<script lang="ts" setup>
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import FilterCartable from '@/views/reports/cartableReport/cartableReportFilter.vue';
import { CartableStatusTypeOptions, CustomerTypeOptions } from '@/types/enums/global';
import Details from '@/components/sections/report/details/Details.vue';
import { computed, h} from 'vue';

// Computed property for custom actions to ensure reactivity
const customActions = computed(() => [
  {
    title: '🔍️ نمایش اطلاعات بیشتر',
    component: (props: any) => h(Details, { ...props }),
  },
]);

const headers = [
  {
    title: 'کد درخواست',
    key: 'trackingCode',
    sortable: true,
    width: 200
  },
  {
    title: 'کد مشتری',
    key: 'customerCode',
    sortable: true,
    editable: true,
    width: 200
  },
  {
    title: 'نام مشتری',
    key: 'customerName',
    sortable: true,
    editable: true,
    width: 200
  },
  {
    title: 'گروه مشتری',
    key: 'customerGroup',
    sortable: true,
    width: 200
  },
  {
    title: 'نوع مشتری',
    key: 'customerType',
    sortable: true,
    width: 200,
    translate: true,
    options: CustomerTypeOptions
  },
  {
    title: 'وضعیت',
    key: 'status',
    sortable: true,
    translate: true,
    options: CartableStatusTypeOptions,
    width: 200
  },
  {
    title: 'شعبه ثبت کننده درخواست',
    key: 'branchName',
    sortable: true,
    editable: true,
    width: 200
  },
  {
    title: 'ایجاد شده توسط',
    key: 'createByName',
    sortable: true,
    editable: true,
    width: 200
  },
  {
    title: 'تاریخ ایجاد',
    key: 'creationDate',
    sortable: true,
    editable: true,
    isDate: true,
    width: 200
  },
  {
    title: 'رکن مسئول',
    key: 'departmentLevelName',
    sortable: true,
    editable: true,
    width: 200
  },
  {
    title: 'نقش مسئول',
    key: 'roleDescription',
    sortable: true,
    editable: true,
    width: 200
  }
];
</script>
