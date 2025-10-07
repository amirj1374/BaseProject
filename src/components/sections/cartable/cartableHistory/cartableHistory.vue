<script setup lang="ts">
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import { ref } from 'vue';
import { ActionTypeOptions, RoleTypeOptions } from '@/types/enums/global';
const props = defineProps<{
  item: any;
  onSuccess?: () => void;
}>();
const id = ref(props.item?.id ?? '');
const page = ref({ title: 'تاریخچه کارتابل' });
const header = ref([
  {
    title: 'عملیات',
    key: 'action',
    sortable: true,
    editable: true,
    translate: true,
    options: ActionTypeOptions,
    width: 200,
  },
  {
    title: 'توضیحات',
    key: 'comments',
    sortable: true,
    editable: true,
    width: 200,
  },
  {
    title: 'نقش',
    key: 'roleName',
    sortable: true,
    width: 200,
    translate: true,
    options: RoleTypeOptions,
  },
  {
    title: 'ایجاد شده توسط',
    key: 'createdBy',
    sortable: true,
    width: 200,
  },
  {
    title: 'تاریخ ایجاد',
    key: 'createdAt',
    sortable: true,
    isDate: true,
    width: 200,
  },
  {
    title: 'ویرایش شده توسط',
    key: 'updatedBy',
    sortable: true,
    width: 200,
  },
  {
    title: 'تاریخ ویرایش',
    key: 'updatedAt',
    sortable: true,
    width: 200,
    isDate: true,

  }
]);
</script>

<template>
  <!-- Custom Data Table Component -->
  <CustomDataTable
    :apiResource="`cartable/${id}/history`"
    :headers="header"
    :auto-fetch="true"
    :height="300"
  />
</template>
