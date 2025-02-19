<script lang="ts" setup>
import { h, ref } from 'vue';
import DataTable from '@/components/shared/DataTable.vue';
import { useRouter } from 'vue-router';
import LinkableText from '@/components/shared/LinkableText.vue';

const router = useRouter();
const loading = ref(false);
const header = ref([
  {
    title: 'شماره سند',
    align: 'center',
    sortable: true,
    key: 'dealReference'
  },
  {
    title: 'مقدار',
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
    title: 'پردازش شده',
    align: 'center',
    sortable: true,
    key: 'processed'
  },
  {
    title: 'توضیحات',
    align: 'center',
    sortable: true,
    key: 'description'
  },
  { title: 'عملیات', value: 'actions', align: 'center' }
]);
const items = ref([
  {
    id: 1,
    dealReference: 1122,
    amount: 15000,
    transactionDate: '1403/06/12',
    processed: 'خیر',
    description: 'واریز سود آذرماه',
    type: 'سود',
    financialYear: '-'
  },
  {
    id: 2,
    dealReference: 3344,
    amount: 25000,
    transactionDate: '1399/11/22',
    processed: 'بلی',
    description: 'واریز سهام',
    type: 'خالص',
    financialYear: 'دوره(سال مالی) 1399'
  },
  {
    id: 1,
    dealReference: 5566,
    amount: -35000,
    transactionDate: '1402/08/12',
    processed: 'خیر',
    description: 'تبدیل',
    type: 'تسفیه',
    financialYear: '-'
  }
]);
const input = ref([
  {
    label: 'شماره سند',
    key: 'dealReference'
  },
  {
    label: 'مقدار',
    key: 'amount'
  },
  {
    label: 'تاریخ',
    key: 'transactionDate'
  },
  {
    label: 'پردازش شده',
    key: 'processed'
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

const actionComponents = ref([
  (item: any) =>
    h(LinkableText, {
      title: 'ارسال به سامانه',
      emitFunc: function () {},
      rowData: item // Pass row data if needed
    }) // Slot content for button text
]);
</script>

<template>
  <DataTable
    :actionComponents="actionComponents"
    hide-delete
    hide-edit
    hide-create
    :headers="header"
    :items="items"
    :loading="loading"
    :table-input="input"
    :title="'تراکنش های حساب'"
    @update="updateList"
  />
</template>
