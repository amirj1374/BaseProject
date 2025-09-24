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
import { CartableStatusTypeOptions, CustomerTypeOptions } from '@/types/enums/global';
import { usePermissionsStore } from '@/stores/permissions';
import SignList from '@/components/sections/cartable/signList/SignList.vue';
import ExpertReport from '@/components/sections/cartable/expertReport/ExpertReport.vue';

const permissionsStore = usePermissionsStore();

const breadcrumbs = ref([
  {
    title: 'محصولات',
    disabled: false,
    href: '#'
  }
]);
const page = ref({ title: 'محصول' });
const header = ref([
  {
    title: 'نام محصول',
    key: 'name',
    sortable: true,
    editable: true,
  },
  {
    title: 'توضیحات',
    key: 'description',
    sortable: true,
    editable: true,
  },
  {
    title: 'قیمت',
    key: 'price',
    type: 'money',
    sortable: true,
    editable: true,
  },
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
      :apiResource="`products`"
      :headers="header"
      :height="300"
      :actions="['create', 'edit', 'delete']"
      :auto-fetch="true"
      :show-pagination="true"
      :show-refresh-button="true"
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
