<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue';
import { api } from '@/services/api';
import type { CollateralsInfoPayload } from '@/types/approval/approvalType';
import { useApprovalStore } from '@/stores/approval';
import MoneyInput from '@/components/shared/MoneyInput.vue';

const isDialogActive = ref(false);
const loading = ref(false);
const valid = ref(false);
const canSubmit = ref(false);
const error = ref<string | null>(null);
const approvalStore = useApprovalStore();

// Form validation
const form = ref();
const isFormValid = ref<boolean>(false);

// Initial form data structure
const formData = ref<CollateralsInfoPayload>({
  loanRequestId: approvalStore.loanRequestId,
  deposit: {
    customerName: '',
    blockedAmount: 0,
    assignedAmount: 0,
    assignedDate: '',
    id: 0
  },
  estate: {
    customerName: '',
    houseNumberPlate: '',
    type: '',
    evaluatedPrice: 0,
    evaluationDate: '',
    assignedAmount: 0,
    assignedDate: '',
    id: 0
  },
  sharesBond: {
    assignedAmount: 0,
    parsianBankAgency: false,
    assignedDate: '',
    customerName: '',
    id: 0
  },
  stock: {
    stockCount: 0,
    customerName: '',
    assignedAmount: 0,
    assignedDate: '',
    totalAmount: 0,
    companyName: '',
    nationalCode: '',
    id: 0
  },
  otherCollateralAmount: 0,
  id: 0
});

// Computed properties for validation
const isFormComplete = computed(() => {
  return (
    formData.value.deposit.customerName ||
    formData.value.estate.customerName ||
    formData.value.sharesBond.customerName ||
    formData.value.stock.customerName ||
    formData.value.otherCollateralAmount > 0
  );
});

// Load existing data
onMounted(async () => {
  try {
    const response = await api.approval.getCollateralsInfo(approvalStore.loanRequestId);
    if (response.status === 200 && response.data) {
      formData.value = { ...formData.value, ...response.data };
      validateForm();
    }
  } catch (err: any) {
    console.error('Error loading collaterals data:', err);
  }
});

// Validate form
const validateForm = () => {
  canSubmit.value = Boolean(isFormValid.value) && valid.value;
};

// Watch form validation
const watchFormValidation = () => {
  if (form.value) {
    isFormValid.value = Boolean(form.value.isValid);
    validateForm();
  }
};

// Save function
async function save() {
  if (!form.value?.validate()) {
    error.value = 'لطفاً خطاهای فرم را برطرف کنید';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const payload: CollateralsInfoPayload = {
      loanRequestId: approvalStore.loanRequestId,
      deposit: {
        customerName: formData.value.deposit.customerName,
        blockedAmount: Number(formData.value.deposit.blockedAmount) || 0,
        assignedAmount: Number(formData.value.deposit.assignedAmount) || 0,
        assignedDate: formData.value.deposit.assignedDate,
        id: formData.value.deposit.id
      },
      estate: {
        customerName: formData.value.estate.customerName,
        houseNumberPlate: formData.value.estate.houseNumberPlate,
        type: formData.value.estate.type,
        evaluatedPrice: Number(formData.value.estate.evaluatedPrice) || 0,
        evaluationDate: formData.value.estate.evaluationDate,
        assignedAmount: Number(formData.value.estate.assignedAmount) || 0,
        assignedDate: formData.value.estate.assignedDate,
        id: formData.value.estate.id
      },
      sharesBond: {
        assignedAmount: Number(formData.value.sharesBond.assignedAmount) || 0,
        parsianBankAgency: formData.value.sharesBond.parsianBankAgency,
        assignedDate: formData.value.sharesBond.assignedDate,
        customerName: formData.value.sharesBond.customerName,
        id: formData.value.sharesBond.id
      },
      stock: {
        stockCount: Number(formData.value.stock.stockCount) || 0,
        customerName: formData.value.stock.customerName,
        assignedAmount: Number(formData.value.stock.assignedAmount) || 0,
        assignedDate: formData.value.stock.assignedDate,
        totalAmount: Number(formData.value.stock.totalAmount) || 0,
        companyName: formData.value.stock.companyName,
        nationalCode: formData.value.stock.nationalCode,
        id: formData.value.stock.id
      },
      otherCollateralAmount: Number(formData.value.otherCollateralAmount) || 0,
      id: formData.value.id
    };

    const response = await api.approval.editCollateralsInfo(payload);

    if (response.status === 200 && response.data) {
      isDialogActive.value = false;
      valid.value = true;
    } else {
      error.value = `خطا: ${response.statusText}`;
    }
  } catch (err: any) {
    error.value = err.message || 'خطای سرور.';
    canSubmit.value = false;
  } finally {
    loading.value = false;
  }
}

// Submit form
const submitData = async () => {
  await save();
};

// Reset form
const resetForm = () => {
  if (form.value) {
    form.value.reset();
  }
  error.value = null;
};

// Close dialog
const closeDialog = () => {
  isDialogActive.value = false;
  resetForm();
};
</script>

<template>
  <v-btn size="large" :base-color="valid ? 'lightsuccess' : 'lighterror'" @click="isDialogActive = true">
    وثایق
    <AlertCircleIcon v-if="!valid" style="margin-right: 20px" size="20" />
    <SquareRoundedCheckFilledIcon v-if="valid" style="margin-right: 20px" size="20" />
  </v-btn>
  
  <v-dialog v-model="isDialogActive" max-width="1200px" persistent>
    <v-card title="وثایق">
      <v-card-text>
        <v-form ref="form" v-model="isFormValid" @update:model-value="watchFormValidation">
               <!-- Estate Section -->
               <v-card variant="outlined" class="mb-4">
            <v-card-title class="text-h6">املاک</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.estate.customerName"
                    label="ملک / املاک متعلق به"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.estate.houseNumberPlate"
                    label="شماره پلاک ثبتی"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.estate.type"
                    label="نوع کاربری"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <MoneyInput
                    v-model="formData.estate.evaluatedPrice"
                    label="مبلغ ارزیابی"
                    placeholder="0"
                    variant="outlined"
                    density="comfortable"
                    suffix="میلیون ریال"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.estate.evaluationDate"
                    label="تاریخ ارزیابی"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <MoneyInput
                    v-model="formData.estate.assignedAmount"
                    label="مبلغ ترهمین"
                    placeholder="0"
                    variant="outlined"
                    density="comfortable"
                    suffix="میلیون ریال"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.estate.assignedDate"
                    label="تاریخ ترهمین"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
          <!-- Deposit Section -->
          <v-card variant="outlined" class="mb-4">
            <v-card-title class="text-h6">گروه نقد</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.deposit.customerName"
                    label="متعلق به"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <MoneyInput
                    v-model="formData.deposit.assignedAmount"
                    label="مبلغ توثیق"
                    placeholder="0"
                    variant="outlined"
                    density="comfortable"
                    suffix="میلیون ریال"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <MoneyInput
                    v-model="formData.deposit.blockedAmount"
                    label="مبلغ مسدودی"
                    placeholder="0"
                    variant="outlined"
                    density="comfortable"
                    suffix="میلیون ریال"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.deposit.assignedDate"
                    label="تاریخ توثیق"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

            <!-- Stock Section -->
            <v-card variant="outlined" class="mb-4">
            <v-card-title class="text-h6">سهام</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.stock.stockCount"
                    label="تعداد سهام"
                    variant="outlined"
                    density="comfortable"
                    type="number"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.stock.customerName"
                    label="متعلق به"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <MoneyInput
                    v-model="formData.stock.assignedAmount"
                    label="مبلغ توثیق"
                    placeholder="0"
                    variant="outlined"
                    density="comfortable"
                    suffix="میلیون ریال"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.stock.assignedDate"
                    label="تاریخ توثیق"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <MoneyInput
                    v-model="formData.stock.totalAmount"
                    label="ارزش روز هر سهم در زمان توثیق"
                    placeholder="0"
                    variant="outlined"
                    density="comfortable"
                    suffix="میلیون ریال"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.stock.companyName"
                    label="سهام شرکت"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
           
        
       
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Shares/Bonds Section -->
          <v-card variant="outlined" class="mb-4">
            <v-card-title class="text-h6">اوراق مشارکت / سرمایه گذاری</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <MoneyInput
                    v-model="formData.sharesBond.assignedAmount"
                    label="مبلغ توثیق"
                    placeholder="0"
                    variant="outlined"
                    density="comfortable"
                    suffix="میلیون ریال"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-checkbox
                    :model-value="Boolean(formData.sharesBond.parsianBankAgency)"
                    @update:model-value="(value: any) => formData.sharesBond.parsianBankAgency = Boolean(value)"
                    label="سهام شرکت سایر بانک ها"
                    density="comfortable"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Other Collateral Section -->
          <v-card variant="outlined" class="mb-4">
            <v-card-title class="text-h6">سایر وثایق</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <MoneyInput
                    v-model="formData.otherCollateralAmount"
                    label="سایر بانک ها"
                    placeholder="0"
                    variant="outlined"
                    density="comfortable"
                    suffix="میلیون ریال"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Error Display -->
          <v-alert v-if="error" type="error" class="mb-4">
            {{ error }}
          </v-alert>
        </v-form>
      </v-card-text>
      
      <v-card-actions style="display: flex; justify-content: space-evenly; padding: 25px 10px">
        <v-btn 
          color="primary" 
          variant="elevated" 
          text="ذخیره" 
          @click="submitData"
          :loading="loading"
        />
        <v-btn 
          color="error" 
          variant="elevated" 
          text="انصراف" 
          @click="closeDialog"
          :disabled="loading"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.table-scroll {
  overflow-x: auto;
  max-width: 100%;
}

.error {
  color: red;
  margin-top: 0.5em;
}

.radioBtnContainer {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
