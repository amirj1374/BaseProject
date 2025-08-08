<script setup lang="ts">
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import { ref } from 'vue';
import { ActionTypeOptions } from '@/types/enums/global';
const props = defineProps<{
  item: any;
  onSuccess?: () => void;
}>();
const id = ref(props.item?.id ?? '');
const page = ref({ title: 'تاریخچه درخواست مصوبه' });
const header = ref([
  {
    title: 'عملیات',
    key: 'action',
    sortable: true,
    editable: true,
    translate: true,
    options: ActionTypeOptions
  },
  {
    title: 'توضیحات',
    key: 'comments',
    sortable: true,
    editable: true
  },
  {
    title: 'تاریخ تکمیل',
    key: 'completedAt',
    sortable: true,
    isDate: true
  },
  {
    title: 'تاریخ ایجاد',
    key: 'createdAt',
    sortable: true,
    isDate: true
  },
  {
    title: 'ایجاد شده توسط',
    key: 'createdBy',
    sortable: true
  },
  {
    title: 'نقش',
    key: 'roleName',
    sortable: true
  },
  {
    title: 'ویرایش شده توسط',
    key: 'updatedAt',
    sortable: true,
    isDate: true
  },
  {
    title: 'تاریخ ویرایش',
    key: 'updatedBy',
    sortable: true
  }
]);
</script>

<template>
  <!-- Custom Data Table Component -->
  <CustomDataTable
    :apiResource="`cartable/${id}/request-history`"
    :headers="header"
    :auto-fetch="true"
    :height="300"
  />
</template>
