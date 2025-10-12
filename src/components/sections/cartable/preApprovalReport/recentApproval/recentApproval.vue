<template>
  <div class="approval-section">
    <CustomDataTable
      ref="dataTableRef"
      :headers="headers"
      :api-resource="`recently-approved/${props.cartableId}`"
      :auto-fetch="true"
      :height="250"
      :form-component="FilterRecentApproval"
      :actions="['create', 'edit']"
      :date-with-timezone="true"
    />
    <v-divider />
    <v-row class="mt-2">
      <v-col cols="12" md="4">
        <v-text-field
          label="شرح مصوبات اخیر"
          v-model="formData.recentApprovalsDesc"
          variant="outlined"
          density="comfortable"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          label="مانده بدهی و تعهدات گروه نزد بانک پارسیان"
          v-model="formData.remainDebtParsian"
          variant="outlined"
          density="comfortable"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          label="ظرفیت سنجی اعتباری"
          v-model="formData.creditEstimation"
          variant="outlined"
          density="comfortable"
        />
      </v-col>
    </v-row>
  </div>
</template>
<script lang="ts" setup>
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import FilterRecentApproval from '@/components/sections/cartable/preApprovalReport/recentApproval/FilterRecentApproval.vue';
import { onMounted, reactive } from 'vue';
import { api } from '@/services/api';
import { number } from 'yup';

onMounted(async () => {
  const response = await api.cartable.getRecentlyApproved(props.cartableId);
  if (response.status === 200) {
    formData.recentApprovalsDesc = response.data.recentApprovalsDesc;
    formData.remainDebtParsian = response.data.remainDebtParsian;
    formData.creditEstimation = response.data.creditEstimation;
  }
})

const formData = reactive({
  recentApprovalsDesc: '',
  remainDebtParsian: '',
  creditEstimation: '',
});
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
    type: 'number',
    editable: true,
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
    title: 'چک / وثیقه',
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
    const response = await api.cartable.addRecentlyApproved(props.cartableId, formData);
    if (response.status === 200) {
      return Promise.resolve();
    } else {
      return Promise.reject(response.data.message);
    }
    // Example: Validate data before proceeding
    // if (!someRequiredData) {
    //   throw new Error('اطلاعات الزامی وارد نشده است');
    // }
    
  } catch (error) {
    return Promise.reject(error);
  }
};

// Expose the submitData method for the stepper
defineExpose({ submitData });
</script>
