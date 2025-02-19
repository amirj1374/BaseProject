<script lang="ts" setup>
import { ref } from 'vue';
import DataTable from '@/components/shared/DataTable.vue';

const loading = ref(false);
const header = ref([
  {
    title: 'عنوان',
    align: 'center',
    sortable: true,
    key: 'title'
  },
  {
    title: 'تاریخ شروع',
    align: 'center',
    sortable: true,
    key: 'startDate'
  },
  {
    title: 'تاریخ پایان',
    align: 'center',
    sortable: true,
    key: 'endDate'
  },
  {
    title: 'مبلغ پرداختنی',
    align: 'center',
    sortable: true,
    key: 'amountDue'
  },
  {
    title: 'تعداد',
    align: 'center',
    sortable: true,
    key: 'quantity'
  },
  {
    title: 'مبلغ محقق شده',
    align: 'center',
    sortable: true,
    key: 'amountAchieved'
  },
  {
    title: 'مبلغ پرداخت شده',
    align: 'center',
    sortable: true,
    key: 'amountPaid'
  },
  { title: 'عملیات', value: 'actions', align: 'center' }
]);

const input = ref([
  {
    label: 'عنوان',
    key: 'title',
    value: '',
    editable: false
  },
  {
    label: 'تاریخ شروع',
    value: '',
    key: 'startDate'
  },
  {
    label: 'تاریخ پایان',
    value: '',
    key: 'endDate'
  },
  {
    label: 'مبلغ پرداختنی',
    value: '',
    key: 'amountDue'
  },
  {
    label: 'تعداد',
    value: '',
    key: 'quantity'
  },
  {
    label: 'مبلغ محقق شده',
    value: '',
    key: 'amountAchieved'
  },
  {
    label: 'مبلغ پرداخت شده',
    value: '',
    key: 'amountPaid'
  }
]);

const items = ref([
  {
    title: 'دوره(سال مالی) 1399',
    id: 1,
    startDate: '1399/01/01',
    endDate: '1399/12/29',
    amountDue: 1000000,
    quantity: 100000,
    amountAchieved: 1000000,
    amountPaid: 500000
  },
  {
    title: 'دوره(سال مالی) 1400',
    id: 2,
    startDate: '1400/01/01',
    endDate: '1400/12/29',
    amountDue: 2000000,
    quantity: 200000,
    amountAchieved: 2000000,
    amountPaid: 1000000
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
    :title="`دوره(سال مالی) ${$route.params.stockId}`"
    @update="updateList"
  />
</template>
