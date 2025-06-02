<script lang="ts" setup>
import { ref } from 'vue';
import type { CurrenciesDto } from '@/types/approval/approvalType';
import BaseApprovalForm from './BaseApprovalForm.vue';
import { IconAlertCircle, IconSquareRoundedCheckFilled } from '@tabler/icons-vue';

const props = defineProps<{
  currencies: CurrenciesDto[];
  initialData?: any;
  disabled?: boolean;
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

const openForm = async (initialData?: any) => {
  console.log('Facilities - openForm called with:', initialData);
  console.log('Facilities - formRef:', formRef.value);
  
  valid.value = false;
  if (formRef.value) {
    formRef.value.isDialogActive = true;
    if (initialData) {
      await formRef.value.setInitialData(initialData);
    }
  } else {
    console.log('Facilities - formRef is not available');
  }
};

// Define field configuration for Facilities
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
  percentDeposit: false,
  advancePayment: false
};

defineExpose({
  openForm,
  valid,
  formRef
});
</script>

<template>
  <div>
    <v-btn 
      size="large" 
      color="primary" 
      variant="tonal"
      @click="openForm()"
      class="add-button"
      :disabled="disabled"
    >
      افزودن تسهیلات
      <IconAlertCircle v-if="!valid" class="ml-2" size="20" />
      <IconSquareRoundedCheckFilled v-if="valid" class="ml-2" size="20" />
    </v-btn>

    <BaseApprovalForm
      ref="formRef"
      :currencies="currencies"
      :initial-data="initialData"
      :show-fields="showFields"
      request-type="ContractCode"
      @save="handleSave"
      @cancel="handleCancel"
    />
  </div>
</template>

<style scoped>
.add-button {
  min-width: 160px;
}

.ml-2 {
  margin-left: 8px;
}
</style>
