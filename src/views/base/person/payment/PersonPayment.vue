<script lang="ts" setup>
import { h, ref } from 'vue';
import DataTable from '@/components/shared/DataTable.vue';
import { useRouter } from 'vue-router';
import LinkableText from '@/components/shared/LinkableText.vue';

const router = useRouter();
const loading = ref(false);
const header = ref([
  {
    title: 'مبلغ پرداختنی',
    align: 'center',
    sortable: true,
    key: 'amountDue'
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
    amountDue: 10000,
    amountAchieved: 9000,
    amountPaid: 1000,
    financialYear: 'سال مالی 1399'
  },
  {
    id: 2,
    amountDue: 20000,
    amountAchieved: 8000,
    amountPaid: 3000,
    financialYear: 'سال مالی 1399'
  },
  {
    id: 1,
    amountDue: 90000,
    amountAchieved: 90000,
    amountPaid: 6000,
    financialYear: 'سود'
  }
]);
const input = ref([
  {
    label: 'مبلغ پرداختنی',
    key: 'amountDue'
  },
  {
    label: 'مبلغ محقق شده',
    key: 'amountAchieved'
  },
  {
    label: 'مبلغ پرداخت شده',
    key: 'amountPaid'
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
      title: 'تراکنش ها',
      emitFunc: onClickPersonTransaction,
      rowData: item // Pass row data if needed
    })
]);

function onClickPersonTransaction(item: any) {
  router.push(`payment/${item.rowData.id}/transaction`);
}
</script>

<template>
  <DataTable
    :actionComponents="actionComponents"
    :headers="header"
    :items="items"
    :loading="loading"
    :table-input="input"
    :title="`دارایی های سهام دار ${$route.params.personId}`"
    @update="updateList"
  />
</template>
