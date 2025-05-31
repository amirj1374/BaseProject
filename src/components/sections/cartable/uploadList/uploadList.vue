<script setup lang="ts">
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import { ref } from 'vue';
import { FileTypeOptions } from '@/types/enums/global';
const props = defineProps<{
  item: any;
  onSuccess?: () => void;
}>();
const id = ref(props.item?.id ?? '');

const header = ref([
  {
    title: 'نام فایل',
    key: 'fileName',
    sortable: true,
    editable: true,
    isDate: true
  },
  {
    title: 'نوع فایل',
    key: 'fileType',
    sortable: true,
    editable: true,
    translate: true,
    options: FileTypeOptions
  },
  {
    title: 'توضیحات',
    key: 'description',
    sortable: true
  },
  {
    title: 'بارگذارنده فایل',
    key: 'uploaderUsername',
    sortable: true
  },
  {
    title: 'تاریخ آخرین ویرایش',
    key: 'updatedAt',
    sortable: true
  },
]);
const downloadLink = {
  'دانلود فایل': 'filePath'
};
</script>

<template>
  <!-- Custom Data Table Component -->
  <CustomDataTable
    :apiResource="`cartable/${id}/attachment`"
    :headers="header"
    :auto-fetch="true"
    :height="300"
    :download-link="downloadLink"
  />
</template>
