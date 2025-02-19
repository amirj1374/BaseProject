<script lang="ts" setup>
import {ref} from 'vue';
import DataTable from '@/components/shared/DataTable.vue';

const loading = ref(false);
const header = ref([
  {
    title: 'تاریخ بارگزاری',
    align: 'center',
    sortable: true,
    key: 'uploadDate'
  }, {
    title: 'نوع فایل',
    align: 'center',
    sortable: true,
    key: 'fileType'
  }, {
    title: 'نام فایل',
    align: 'center',
    sortable: true,
    key: 'fileName'
  }, {
    title: 'تعداد رکورد',
    align: 'center',
    sortable: true,
    key: 'recordCount'
  }, {
    title: 'تعداد رکورد موفقیت آمیز',
    align: 'center',
    sortable: true,
    key: 'successfulRecordCount'
  }, {
    title: 'تعداد رکورد خطا دار',
    align: 'center',
    sortable: true,
    key: 'errorRecordCount'
  }
]);

const items = ref([
  {
    id: 1,
    uploadDate: '1403/09/10',
    fileType: 'اکسل',
    fileName: 'Year-1403.xlsx',
    recordCount: 1000000,
    successfulRecordCount: 900000,
    errorRecordCount: 100000,
  },{
    id: 1,
    uploadDate: '1401/10/16',
    fileType: 'متنی',
    fileName: 'Year-1401.txt',
    recordCount: 2000000,
    successfulRecordCount: 1900000,
    errorRecordCount: 100000,
  },

]);
const input = [
  {
    label: 'عنوان',
    key: 'title',
    value: '',
    editable: true
  },
  {
    label: 'کد بانک ',
    key: 'code',
    value: '',
    editable: false
  }
];

function updateList(_items: any) {
  items.value = _items;
}
</script>

<template>
  <DataTable
      :headers="header"
      :items="items"
      :loading="loading"
      :table-input="input"
      :title="'بارگزاری فایل'"
      hide-delete
      hide-edit
      hide-create
      has-upload
      @update="updateList"
  />
</template>
