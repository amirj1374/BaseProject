<template>
  <CustomDataTable
    ref="dataTableRef"
    :headers="headers"
    api-resource="deposit-info"
    :queryParams="{ loanRequestId: props.loanRequestId }"
    :auto-fetch="true"
    :show-pagination="true"
    :height="550"
  />
</template>
<script lang="ts" setup>
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import { useApprovalStore } from '@/stores/approval';

const props = defineProps({
  loanRequestId: {
    type: String,
    required: true
  }
})
const approvalStore = useApprovalStore();

const headers = [
  {
    title: 'شماره حساب',
    key: 'accountNo',
    sortable: true,
    width: 250
  },
  {
    title: 'عنوان حساب',
    key: 'accountTitle',
    sortable: true,
    width: 250
  },
  {
    title: 'تاریخ افتتاح',
    key: 'openingDate',
    sortable: true,
    isDate: true,
    width: 250
  },
  {
    title: 'نوع حساب',
    key: 'accountType',
    sortable: true,
    width: 250
  },
  {
    title: 'شعبه',
    key: 'branch',
    sortable: true,
    width: 250
  },
  {
    title: 'میانگین موجودی شش ماه گذشته',
    key: 'avgBalanceHalf',
    sortable: true,
    width: 400,
    isDate: true
  },
  {
    title: 'مبلغ گردش بدهکار',
    key: 'creditTurnoverHalf',
    sortable: true,
    width: 400
  },
  {
    title: 'تعداد گردش بدهکار',
    key: 'countCreditTurnoverHalf',
    sortable: true,
    width: 400
  },
  {
    title: 'تعداد گردش بستانکار',
    key: 'countDebitTurnoverHalf',
    sortable: true,
    width: 400
  },
  {
    title: 'مبلغ گردش بستانکار',
    key: 'debitTurnoverHalf',
    sortable: true,
    width: 250
  },
  {
    title: 'مانده موجودی',
    key: 'finalBalance',
    sortable: true,
    width: 250
  }
];
</script>
