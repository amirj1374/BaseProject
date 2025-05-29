<script setup lang="ts">
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
const breadcrumbs = ref([
  {
    title: 'کارتابل',
    disabled: false,
    href: '#'
  },
  {
    title: 'جزییات کارتابل',
    disabled: false,
    href: '#'
  },
]);

const page = ref({ title: 'جزییات کارتابل' });
const route = useRoute();
const header = ref([
  { title: 'تاریخ ایجاد', key: 'createdAt', sortable: true, editable: true, isDate: true },
  { title: 'ایجاد شده توسط', key: 'createdBy', sortable: true, editable: true },
  { title: 'وضعیت', key: 'status', sortable: true, editable: true },
  { title: 'کد رهگیری', key: 'trackingCode', sortable: true, editable: true },
  { title: 'تاریخ ویرایش', key: 'updatedAt', sortable: true, editable: true, isDate: true },
  { title: 'ویرایش شده توسط', key: 'updatedBy', sortable: true, editable: true },
  { title: 'کد نقش', key: 'roleCode', sortable: true, editable: true },
  { title: 'نقش', key: 'roleName', sortable: true, editable: true },
  { title: 'کد شعبه', key: 'branchCode', sortable: true, editable: true },
  { title: 'نام شعبه', key: 'branchName', sortable: true, editable: true },
]);
console.log(route.params.id);
const routes = {
};
</script>

<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <!-- Custom Data Table Component -->
  <CustomDataTable
    :apiResource="`cartable/${route.params.id}`"
    :headers="header"

  />
</template>
