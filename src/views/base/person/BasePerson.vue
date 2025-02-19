<script setup lang="ts">
import { h, ref } from 'vue';
import DataTable from '@/components/shared/DataTable.vue';
import LinkableText from '@/components/shared/LinkableText.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(<boolean>false);
const header = ref([
  {
    title: 'نام',
    align: 'center',
    sortable: true,
    key: 'firstName'
  },
  {
    title: 'نام خانوادگی',
    align: 'center',
    sortable: true,
    key: 'lastName'
  },
  {
    title: 'کد ملی',
    align: 'center',
    sortable: true,
    key: 'nationalCode'
  },
  {
    title: 'شبای سجامی',
    align: 'center',
    sortable: true,
    key: 'sejamIban'
  },
  {
    title: 'کد بورسی',
    align: 'center',
    sortable: true,
    key: 'exchangeCode'
  },
  {
    title: 'مبلغ دریافتنی',
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
    title: 'وضعیت',
    align: 'center',
    sortable: true,
    key: 'status'
  },
  { title: 'عملیات', value: 'actions', align: 'center' }
]);
const items = ref([
  {
    id: 1,
    firstName: 'محمد',
    lastName: 'جلیلی',
    nationalCode: '123456789',
    amountDue: 1000000,
    sejamIban: 'IR12321372132',
    exchangeCode: '23ج3243',
    amountAchieved: 10000,
    amountPaid: 14541241,
    status: 'فوت شده'
  },
  {
    id: 2,
    firstName: 'امیر',
    lastName: 'جلیلی',
    nationalCode: '78787485',
    sejamIban: 'IR12321372132',
    exchangeCode: '23ج3243',
    amountDue: 454521,
    amountAchieved: 1524,
    amountPaid: 2541,
    status: 'مسدود قضایی'
  }
]);
const input = ref([
  {
    label: 'نام',
    key: 'firstName'
  },
  {
    label: 'نام خانوادگی',
    key: 'lastName'
  },
  {
    label: 'کد ملی',
    key: 'nationalCode'
  },
  {
    label: 'شبای سجامی',
    key: 'sejamIban'
  },
  {
    label: 'کد بورسی',
    key: 'exchangeCode'
  },
  {
    label: 'مبلغ دریافتنی',
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
    label: 'وضعیت',
    key: 'status'
  }
]);

function updateList(_items: any) {
  items.value = _items;
}

const actionComponents = ref([
  (item: any) =>
    h(LinkableText, {
      title: 'دارایی',
      emitFunc: onClickFinancialYear,
      rowData: item // Pass row data if needed
    })
]);

function onClickFinancialYear(item: any) {
  router.push(`/base/person/${item.rowData.lastName}/payment`);
}
</script>

<template>
  <DataTable
    :actionComponents="actionComponents"
    :title="'سهام دار'"
    :loading="loading"
    :headers="header"
    :items="items"
    :table-input="input"
    @update="updateList"
  />
</template>
