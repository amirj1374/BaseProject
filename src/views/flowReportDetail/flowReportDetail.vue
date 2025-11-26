<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <v-row>
    <v-col cols="12" md="12">
      <ApprovalRequestViewer :cartable-id="cartableId" />
    </v-col>
  </v-row>
  <div class="upload-form">
    <CustomDataTable
      class="pa-3"
      ref="dataTableRef"
      :headers="headers"
      api-resource="back/api/v1/report/get-flow-report"
      :queryParams="{ cartableId }"
      :auto-fetch="true"
      :show-pagination="true"
      :height="550"
      group-by="commiteName"
      :page-size="150"
      :group-header-template="getGroupHeaderTemplate"
    />
  </div>
</template>
<script lang="ts" setup>
import { CustomDataTable,BaseBreadcrumb } from '@amirjalili1374/ui-kit';
import { ref } from 'vue';
import ApprovalRequestViewer from '@/components/approval/ApprovalRequestViewer.vue';
import { useRoute } from 'vue-router';

const { id } = useRoute().params;
const cartableId = Array.isArray(id) ? id[0] : id;
const breadcrumbs = ref([
  {
    title: 'درخواست ها',
    disabled: false,
    to: { name: 'Cartable' }
  },
  {
    title: 'گزارش عملیات',
    disabled: false,
    to: { name: 'flowReport' }
  },
  {
    title: 'جزییات گزارش عملیات',
    disabled: false,
    href: '#'
  }
]);
const page = ref({ title: 'گزارش عملیات' });
const headers = [
  {
    title: 'نام امضا دار',
    key: 'name',
    sortable: true,
  },
  {
    title: 'نام کاربری',
    key: 'username',
    sortable: true,
    editable: true,
  },
  {
    title: 'توضیحات',
    key: 'comment',
    sortable: true,
    editable: true,
  },
  {
    title: 'نوع اقدام',
    key: 'actionTypeName',
    sortable: true,
  },
  {
    title: 'تاریخ اقدام',
    key: 'actionDoneAt',
    sortable: true,
    isDate: true
  },
];
const getGroupHeaderTemplate = (groupKey: string | number, groupItems: any[]): string => {
  if (groupItems.length > 0) {
    const firstItem = groupItems[0];
    return `  ${firstItem.groupByItem} : (${groupItems.length} مدرک)`;
  }
  return `(${groupItems.length} مدرک)`;
};
</script>
