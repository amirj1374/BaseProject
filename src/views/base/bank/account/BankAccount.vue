<script lang="ts" setup>
import { h, ref } from 'vue';
import DataTable from '@/components/shared/DataTable.vue';
import { RefreshIcon } from 'vue-tabler-icons';
import BaseIcon from '@/components/shared/BaseIcon.vue';
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
    title: 'شماره حساب',
    align: 'center',
    sortable: true,
    key: 'accountNumber'
  },
  {
    title: 'شماره شبا',
    align: 'center',
    sortable: true,
    key: 'iBanNumber'
  },
  {
    title: 'نوع حساب',
    align: 'center',
    sortable: true,
    key: 'accountType'
  } /*
  {
    title: 'بازه سود',
    align: 'center',
    sortable: true,
    key: 'profitPeriod'
  },*/,
  {
    title: 'موجودی کل',
    align: 'center',
    sortable: true,
    key: 'totalBalance'
  },
  {
    title: 'موجودی بدون سود',
    align: 'center',
    sortable: true,
    key: 'netBalance'
  },
  {
    title: 'سود دریافتی',
    align: 'center',
    sortable: true,
    key: 'profitBalance'
  },
  {
    title: 'سود',
    align: 'center',
    sortable: true,
    key: 'profitBalancePercent'
  },
  {
    title: 'موجودی آنلاین',
    align: 'center',
    sortable: true,
    key: 'onlineBalance'
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
    label: 'شماره حساب',
    key: 'accountNumber'
  },
  {
    label: 'شماره شبا',
    key: 'iBanNumber'
  },
  {
    label: 'نوع حساب',
    key: 'accountType'
  },
  {
    label: 'موجودی کل',
    key: 'totalBalance'
  },
  {
    label: 'موجودی بدون سود',
    key: 'netBalance'
  },
  {
    label: 'سود دریافتی',
    key: 'profitBalance'
  },
  {
    label: 'سود',
    key: 'profitBalancePercent'
  },
  {
    label: 'موجودی آنلاین',
    key: 'onlineBalance'
  }
]);

const items = ref([
  {
    title: 'سهام عدالت',
    accountNumber: 1403112233,
    iBanNumber: 'IR153453412',
    accountType: 'کوتاه مدت',
    // profitPeriod: "روز شمار",
    totalBalance: '6,500,000,000',
    netBalance: '5,500,000,000',
    profitBalancePercent: 23,
    profitBalance: '1,000,000,000',
    id: 1,
    onlineBalance: '6,500,000,000'
  },
  {
    title: 'اوراق',
    accountNumber: 1401112233,
    iBanNumber: 'IR153453412',
    accountType: 'کوتاه مدت',
    // profitPeriod: "ماه شمار",
    totalBalance: '2,000,000,000',
    netBalance: '1,500,000,000',
    profitBalancePercent: 19,
    profitBalance: '500,000,000',
    id: 2,
    onlineBalance: '2,000,000,000'
  }
]);

function updateList(_items: any) {
  items.value = _items;
}

// Define your action components
const actionComponents = ref([
  (item: any) =>
    h(BaseIcon, {
      icon: RefreshIcon, // Pass the icon as a prop
      emitFunc: onClickUpdateIcon,
      rowData: item
    }), // Slot content for button text

  (item: any) =>
    h(LinkableText, {
      title: 'تراکنش ها',
      emitFunc: onClickAccountTransaction,
      rowData: item // Pass row data if needed
    }), // Slot content for button text

  (item: any) =>
    h(LinkableText, {
      title: 'صورت حساب آنلاین',
      emitFunc: onClickAccountOnlineTransaction,
      rowData: item // Pass row data if needed
    })
]);

function onClickUpdateIcon(item: any) {
  console.log(item.rowData.id);
}

function onClickAccountTransaction(item: any) {
  router.push(`account/${item.rowData.id}/transaction`);
}
function onClickAccountOnlineTransaction(item: any) {
  router.push(`account/${item.rowData.id}/online-account-transaction`);
}
</script>

<template>
  <DataTable
    :actionComponents="actionComponents"
    :headers="header"
    :items="items"
    :loading="loading"
    :table-input="input"
    :title="`حساب بانکی ${$route.params.bankId}`"
    @update="updateList"
  />
</template>
