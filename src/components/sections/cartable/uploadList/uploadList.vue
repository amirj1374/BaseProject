<script setup lang="ts">
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import { ref } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import Reference from '@/components/sections/cartable/Reference/Reference.vue';
import UploadList from '@/components/sections/cartable/uploadList/uploadList.vue';
import CartableHistory from '@/components/sections/cartable/cartableHistory/cartableHistory.vue';
const props = defineProps<{
  item: any;
  onSuccess?: () => void;
}>();
const id = ref(props.item?.id ?? '');

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
  <!-- Custom Data Table Component -->
  <CustomDataTable
    :apiResource="`cartable/${id}/history`"
    :headers="header"
    :auto-fetch="true"
  />
</template>
