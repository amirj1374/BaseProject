<script setup lang="ts">
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import { ref, h } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import Reference from '@/components/sections/cartable/reference/Reference.vue';
import FilterRole from '@/components/sections/roles/filter/FilterRole.vue';
import { BooleanEnumOptions } from '@/types/enums/global';

const breadcrumbs = ref([
  {
    title: 'مدیریت نقش ها',
    disabled: false,
    href: '#'
  }
]);
const page = ref({ title: 'مدیریت نقش ها' });
const header = ref([
  {
    title: 'دپارتمان',
    key: 'departmentLevelName',
    sortable: true,
    editable: true
  },
  {
    title: 'نقش سماپ',
    key: 'samapRole',
    sortable: true,
    nestedKey: 'samapRole.description',
       formatter: (value: any, item: any) => {
      if (item.samapRole && typeof item.samapRole === 'object') {
        return `${item.samapRole.description}`;
      }
      return value;
    }
  },
  {
    title: 'نقش لوتوسی',
    key: 'lotusRoles',
    sortable: true
  },
  {
    title: 'وضعیت',
    key: 'done',
    sortable: true,
    translate: true,
    options: BooleanEnumOptions
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
      :apiResource="`department-role`"
      :headers="header"
      :height="550"
      :auto-fetch="true"
      :show-pagination="true"
      :show-refresh-button="true"
      :custom-actions="[
        { 
          title: 'ویرایش', 
          component: (props) => h(FilterRole, { ...props, onSuccess: handleReferenceSuccess }),
        },
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