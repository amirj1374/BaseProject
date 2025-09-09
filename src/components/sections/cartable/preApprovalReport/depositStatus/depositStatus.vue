<template>
  <div class="approval-section">
    <CustomDataTable
      ref="dataTableRef"
      :headers="headers"
      api-resource="deposit-info"
      :queryParams="{ loanRequestId: props.loanRequestId }"
      :auto-fetch="true"
      :height="380"
    />
  </div>
</template>
<script lang="ts" setup>
import CustomDataTable from '@/components/shared/CustomDataTable.vue';

const props = defineProps({
  loanRequestId: {
    type: String,
    required: true
  },
  cartableId: {
    type: String,
    required: true
  },
  currentStep: {
    type: Number,
    required: true
  },
  totalSteps: {
    type: Number,
    required: true
  }
})

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
    key: 'finalBalance',
    sortable: true,
    width: 500,
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

// Submit data method for stepper
const submitData = async () => {
  try {
    // Add your validation and submission logic here
    console.log('Submitting deposit status data for loan request:', props.loanRequestId);
    
    // Example: Validate data before proceeding
    // if (!someRequiredData) {
    //   throw new Error('اطلاعات الزامی وارد نشده است');
    // }
    
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
};

// Expose the submitData method for the stepper
defineExpose({ submitData });
</script>
