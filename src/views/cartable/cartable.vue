<script setup lang="ts">
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import { ref } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { BooleanEnumOptions, RequestTypeStatusOptions } from '@/types/enums/global';

const breadcrumbs = ref([
  {
    title: 'درخواست ها',
    disabled: false,
    href: '#'
  }
]);
const page = ref({ title: 'کارتابل ها' });
const header = ref([
  {
    title: 'تاریخ ایجاد',
    key: 'createdAt',
    sortable: true,
    editable: true,
    isDate: true
  },
  {
    title: 'ایجاد شده توسط',
    key: 'createdBy',
    sortable: true,
    editable: true
  },
  {
    title: 'کد رهگیری',
    key: 'trackingCode',
    sortable: true
  }
]);
const routes = {
  'جزییات کارتابل': '/cartable/{id}/detail',
};
// Define the filter component
</script>

<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <!-- Custom Data Table Component -->
  <CustomDataTable :apiResource="`cartable`" :headers="header" :auto-fetch="true" :routes="routes" />
</template>
