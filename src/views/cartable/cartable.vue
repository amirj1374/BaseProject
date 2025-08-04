<script setup lang="ts">
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import { ref, h } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import Reference from '@/components/sections/cartable/reference/Reference.vue';
import CartableHistory from '@/components/sections/cartable/cartableHistory/cartableHistory.vue';
import UploadList from '@/components/sections/cartable/uploadList/uploadList.vue';
import LoanRequestHistory from '@/components/sections/cartable/loanRequestHistory/loanRequestHistory.vue';
import FilterCartable from '@/components/sections/cartable/FilterCartable.vue';
import Sign from '@/components/sections/cartable/sign/Sign.vue';

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
  },
  {
    title: 'نقش',
    key: 'roleName',
    sortable: true
  }
]);

const tableRef = ref();

function handleReferenceSuccess() {
  tableRef.value?.fetchData();
}
</script>

<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <!-- Custom Data Table Component -->
  <div class="upload-form">
    <CustomDataTable
      ref="tableRef"
      :apiResource="`cartable`"
      :headers="header"
      :height="550"
      :filter-component="FilterCartable"
      :auto-fetch="true"
      :show-pagination="true"
      :show-refresh-button="true"
      :custom-actions="[
        { 
          title: 'عملیات', 
          component: (props) => h(Reference, { ...props, onSuccess: handleReferenceSuccess }),
          condition: (item) => item.mainAssignee === true
        },
        { 
          title: 'امضا', 
          component: (props) => h(Sign, { ...props, onSuccess: handleReferenceSuccess }),
          condition: (item) => item.hasSignPermission === true
        },
        { 
          title: 'لیست مدارک', 
          component: UploadList,
        },
        { 
          title: 'تاریخچه کارتابل', 
          component: CartableHistory,
        },
        { 
          title: 'تاریخچه درخواست مصوبه', 
          component: LoanRequestHistory,
        }
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