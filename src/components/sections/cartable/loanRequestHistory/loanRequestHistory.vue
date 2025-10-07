<script setup lang="ts">
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import { ref } from 'vue';
import { ActionTypeOptions, LoanRequestStatusOptions } from '@/types/enums/global';
const props = defineProps<{
  item: any;
  onSuccess?: () => void;
}>();
const id = ref(props.item?.id ?? '');
const page = ref({ title: 'تاریخچه درخواست مصوبه' });
const header = ref([
  {
    title: 'کد درخواست',
    key: 'trackingCode',
    sortable: true,
    width: 200,
  },
  {
    title: 'نوع درخواست',
    key: 'requestType',
    sortable: true,
    editable: true,
    width: 200,
  },
  {
    title: 'شماره مشتری',
    key: 'cif',
    sortable: true,
    editable: true,
    width: 200,
  },
  {
    title: 'نام مشتری',
    key: 'customerName',
    sortable: true,
    editable: true,
    width: 200,
  },
  {
    title: 'مبلغ',
    key: 'amount',
    sortable: true,
    width: 200,
  },
  {
    title: 'نوع بازپرداخت',
    key: 'repaymentType',
    sortable: true,
    width: 200,
  },
  {
    title: 'نام شعبه',
    key: 'branchName',
    sortable: true,
    isDate: true,
    width: 200,
  },
  {
    title: 'کد شعبه',
    key: 'branchCode',
    sortable: true,
    width: 200,
  },
  {
    title: 'وضعیت',
    key: 'status',
    sortable: true,
    width: 200,
    translate: true,
    options: LoanRequestStatusOptions,
  },
  {
    title: 'ایجاد شده توسط',
    key: 'createdBy',
    sortable: true,
    width: 200,
  },
  {
    title: 'تاریخ ایجاد',
    key: 'createdAt',
    sortable: true,
    width: 200,
    isDate: true,
  },
  {
    title: 'تاریخ ویرایش',
    key: 'updatedAt',
    sortable: true,
    isDate: true,
    width: 200,
  },
  {
    title: 'ویرایش شده توسط',
    key: 'updatedBy',
    sortable: true,
    width: 200,
  }
]);
</script>

<template>
  <!-- Custom Data Table Component -->
  <CustomDataTable
    :apiResource="`cartable/${id}/request-history`"
    :headers="header"
    :auto-fetch="true"
    :height="300"
  />
</template>
