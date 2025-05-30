<script setup lang="ts">
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import { ref } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import Reference from '@/components/sections/cartable/reference/Reference.vue';
import CartableHistory from '@/components/sections/cartable/cartableHistory/cartableHistory.vue';
import UploadList from '@/components/sections/cartable/uploadList/uploadList.vue';

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
</script>

<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <!-- Custom Data Table Component -->
  <div class="upload-form">
    <CustomDataTable
    :apiResource="`cartable`"
    :headers="header"
    :auto-fetch="true"
    :custom-actions="[
      { title: 'عملیات', component: Reference },
      { title: 'لیست مدارک', component: UploadList },
      { title: 'تاریخچه کارتابل', component: CartableHistory }
    ]"
  />
  </div>
</template>
<style scoped>
.upload-page {
  height: 100vh; /* or 100% if its parent is also 100% */
  display: flex;
  flex-direction: column;
}
.upload-form {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
</style>