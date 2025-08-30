<template>
  <div class="approval-section">
    <CustomDataTable
      ref="dataTableRef"
      :headers="headers"
      :api-resource="`recently-approved/${props.cartableId}`"
      :auto-fetch="true"
      :height="350"
      :actions="['create', 'edit']"
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
    title: 'شماره مصوبه',
    key: 'creditApprovalNo',
    sortable: true,
    width: 250
  },
  {
    title: 'تاریخ مصوبه',
    key: 'creditApprovalDate',
    sortable: true,
    isDate: true,
    width: 250
  },
  {
    title: 'تعهدات / تسهیلات',
    key: 'loanRequestType',
    sortable: true,
    isDate: true,
    width: 250
  },
  {
    title: 'سپرده نقدی',
    key: 'cashDeposit',
    sortable: true,
    width: 250
  },
  {
    title: 'وثایق طبق مصوبه',
    key: 'approvalCollaterals',
    sortable: true,
    width: 250
  },
  {
    title: 'مانده فعال',
    key: 'activeRemainAmount',
    sortable: true,
    width: 200,
  },
  {
    title: 'ضمانت نامه / سپرده',
    key: 'depositAmount',
    sortable: true,
    width: 350
  },
  {
    title: 'وثیقه غیر منقول',
    key: 'estateAmount',
    sortable: true,
    width: 200
  },
  {
    title: 'جک / وثیقه',
    key: 'chequeAmount',
    sortable: true,
    width: 400
  },
  {
    title: 'وثیقه - سفته',
    key: 'promissoryNoteAmount',
    sortable: true,
    width: 250
  },
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
