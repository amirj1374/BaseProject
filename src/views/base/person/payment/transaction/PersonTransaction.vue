<script lang="ts" setup>
import { ref } from 'vue';
import DataTable from '@/components/shared/DataTable.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(false);
const header = ref([
  {
    title: 'مبلغ',
    align: 'center',
    sortable: true,
    key: 'amount'
  },
  {
    title: 'تاریخ',
    align: 'center',
    sortable: true,
    key: 'transactionDate'
  },
  {
    title: 'توضیحات',
    align: 'center',
    sortable: true,
    key: 'description'
  },
  {
    title: 'نوع تراکنش',
    align: 'center',
    sortable: true,
    key: 'type'
  },
  {
    title: 'دوره(سال مالی)',
    align: 'center',
    sortable: true,
    key: 'financialYear'
  },
  { title: 'عملیات', value: 'actions', align: 'center' }
]);
const items = ref([
  {
    id: 1,
    amount: 15000,
    transactionDate: '1403/06/12',
    description: 'واریز سود آذرماه',
    type: 'سود',
    financialYear: 'سال مالی 1400'
  },
  {
    id: 2,
    amount: 25000,
    transactionDate: '1399/11/22',
    description: 'واریز سهام',
    type: 'خالص',
    financialYear: 'سال مالی 1398'
  },
  {
    id: 1,
    amount: 35000,
    transactionDate: '1402/08/12',
    description: 'تبدیل',
    type: 'تبدیل',
    financialYear: 'سال مالی 1399'
  }
]);
const input = ref([
  {
    label: 'مبلغ',
    key: 'amount'
  },
  {
    label: 'تاریخ',
    key: 'transactionDate'
  },
  {
    label: 'توضیحات',
    key: 'description'
  },
  {
    label: 'نوع تراکنش',
    key: 'type'
  },
  {
    label: 'دوره(سال مالی)',
    key: 'financialYear'
  }
]);

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
    :title="`تراکنش های سهام دار ${$route.params.personId}`"
    @update="updateList"
  />
</template>
