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
const showDeleteConfirm = ref(false);
const collateralToDelete = ref<number | null>(null);
const error = ref<string | null>(null);
const showError = ref(false);

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

const removeCollateralItem = (index: number) => {
  collateralToDelete.value = index;
  showDeleteConfirm.value = true;
};

const confirmDeleteCollateral = () => {
  if (collateralToDelete.value === null || !formRef.value) return;
  
  try {
    const currentCollaterals = formRef.value.selectedCollaterals?.value || [];
    const deletedCollateral = currentCollaterals[collateralToDelete.value];
    
    // Remove the collateral
    const updatedCollaterals = [...currentCollaterals];
    updatedCollaterals.splice(collateralToDelete.value, 1);
    formRef.value.setFieldValue('selectedCollaterals', updatedCollaterals);
    
    // Show success message
    error.value = `وثیقه ${deletedCollateral.collateral.description} با موفقیت حذف شد`;
    showError.value = true;
  } catch (err) {
    error.value = 'خطا در حذف وثیقه';
    showError.value = true;
  } finally {
    // Reset the state
    collateralToDelete.value = null;
    showDeleteConfirm.value = false;
  }
};

const cancelDeleteCollateral = () => {
  collateralToDelete.value = null;
  showDeleteConfirm.value = false;
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
  formRef,
  removeCollateralItem
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

    <!-- Confirmation Dialog -->
    <v-dialog v-model="showDeleteConfirm" max-width="400">
      <v-card>
        <v-card-title class="text-h5">
          حذف وثیقه
        </v-card-title>
        <v-card-text>
          آیا از حذف این وثیقه اطمینان دارید؟
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="text"
            @click="confirmDeleteCollateral"
          >
            حذف
          </v-btn>
          <v-btn
            color="primary"
            variant="text"
            @click="cancelDeleteCollateral"
          >
            انصراف
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Error Snackbar -->
    <v-snackbar v-model="showError" color="error" timeout="3000">
      {{ error }}
    </v-snackbar>
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
