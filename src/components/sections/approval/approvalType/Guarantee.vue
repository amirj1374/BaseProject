<script lang="ts" setup>
import { ref } from 'vue';
import type { CurrenciesDto } from '@/types/approval/approvalType';
import BaseApprovalForm from './BaseApprovalForm.vue';
import { AlertCircleIcon, SquareRoundedCheckFilledIcon } from 'vue-tabler-icons';

const props = defineProps<{
  currencies: CurrenciesDto[];
  initialData?: any;
}>();

const emit = defineEmits<{
  (e: 'save', data: any): void;
}>();

const formRef = ref();
const valid = ref(false);

const handleSave = (data: any) => {
  emit('save', data);
  valid.value = true;
};

const handleCancel = () => {
  valid.value = false;
};

const openForm = () => {
  formRef.value.isDialogActive = true;
};

// Define field configuration for Guarantee
const showFields = {
  approvalType: true,
  currency: true,
  contractType: true,
  repaymentType: true,
  facility: true,
  amount: true,
  formAmount: false,
  duration: true,
  other: true,
  collateral: true,
  intermediatePayment: false,
  advancePayment: false,
  percentDeposit: true
};

defineExpose({
  openForm,
  valid
});
</script>

<template>
  <div>
    <v-btn size="large" :base-color="valid ? 'lightsuccess' : 'lighterror'" @click="openForm">
      ضمانت نامه
      <AlertCircleIcon v-if="!valid" style="margin-right: 20px" size="20" />
      <SquareRoundedCheckFilledIcon v-if="valid" style="margin-right: 20px" size="20" />
    </v-btn>

    <BaseApprovalForm
      ref="formRef"
      :currencies="currencies"
      :initial-data="initialData"
      :show-fields="showFields"
      request-type="GuaranteeType"
      @save="handleSave"
      @cancel="handleCancel"
    />
  </div>
</template>
