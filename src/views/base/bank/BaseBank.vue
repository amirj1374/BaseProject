<script lang="ts" setup>
import { h, ref } from 'vue';
import DataTable from '@/components/shared/DataTable.vue';
import LinkableText from '@/components/shared/LinkableText.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(false);
const header = ref([
  {
    title: 'عنوان',
    align: 'center',
    sortable: true,
    key: 'title'
  },
  {
    title: 'کد بانک',
    align: 'center',
    sortable: true,
    key: 'code'
  },
  { title: 'عملیات', value: 'actions', align: 'center' }
]);
const items = ref([
  {
    id: 1,
    title: 'پارسیان',
    code: '123'
  },
  {
    id: 2,
    title: 'ملت',
    code: '456'
  },
  {
    id: 3,
    title: 'ملی',
    code: '789'
  }
]);
const input = ref([
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
]);

function updateList(_items: any) {
  items.value = _items;
}

const actionComponents = ref([
  (item: any) =>
    h(LinkableText, {
      title: 'حساب های بانکی',
      emitFunc: onClickBankAccount,
      rowData: item // Pass row data if needed
    })
]);

function onClickBankAccount(item: any) {
  router.push(`/base/bank/${item.rowData.title}/account`);
}
</script>

<template>
  <DataTable
    :actionComponents="actionComponents"
    :headers="header"
    :items="items"
    :loading="loading"
    :table-input="input"
    :title="'بانک ها'"
    @update="updateList"
  />
</template>
