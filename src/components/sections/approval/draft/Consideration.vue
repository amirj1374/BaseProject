<script lang="ts" setup>
import { IconAlertCircle, IconCircleCheck } from '@tabler/icons-vue';
import { onMounted, ref, watch, computed } from 'vue';
import { api } from '@/services/api';
import type { ConsiderationPayload } from '@/types/approval/approvalType';
import { useApprovalStore } from '@/stores/approval';
import ShamsiDatePicker from '@/components/shared/ShamsiDatePicker.vue';
import MoneyInput from '@/components/shared/MoneyInput.vue';

const isDialogActive = ref(false);
const loading = ref(false);
const valid = ref(false);
const canSubmit = ref(false);
const error = ref<string | null>(null);
const approvalStore = useApprovalStore();

// initial data
const formData = ref({
  loanRequestId: approvalStore.loanRequestId,
  previousLoanAppropriate: false,
  havePromissoryNote: false,
  signatory: '',
  currentOffersAmount: 0,
  creditLimitDate: ''
});

// Load existing data when dialog opens
watch(isDialogActive, async (newValue) => {
  if (newValue === true) {
    try {
      const response = await api.approval.getConsideration(approvalStore.loanRequestId);
      if (response.status === 200 && response.data) {
        // Handle date conversion if creditLimitDate is a Date object or ISO string
        const data = response.data;
        if (data.creditLimitDate) {
          console.log('Original creditLimitDate from server:', data.creditLimitDate);
          // Keep the full ISO string format for consistency
          let dateStr = data.creditLimitDate;
          if (dateStr instanceof Date) {
            dateStr = dateStr.toISOString();
          } else if (typeof dateStr === 'string') {
            // If it's already an ISO string, keep it as is
            if (!dateStr.includes('T')) {
              // If it's just YYYY-MM-DD, convert to full ISO
              dateStr = dateStr + 'T00:00:00.000Z';
            }
          }
          console.log('Processed creditLimitDate:', dateStr);
          data.creditLimitDate = dateStr;
        }
        formData.value = data;
      }
    } catch (err: any) {
      console.error('Error loading consideration data:', err);
    }
  }
});

// get customer
async function save() {
  loading.value = true;
  error.value = null;

  try {
    const payload: ConsiderationPayload = {
      loanRequestId: approvalStore.loanRequestId,
      previousLoanAppropriate: formData.value.previousLoanAppropriate,
      havePromissoryNote: formData.value.havePromissoryNote,
      signatory: formData.value.signatory,
      currentOffersAmount: formData.value.currentOffersAmount,
      creditLimitDate: formData.value.creditLimitDate
    };

    const response = await api.approval.saveConsideration(payload);

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

// submit form
const submitData = async () => {
  await save();
};

// Check if editing is disabled
const isEditingDisabled = computed(() => {
  return approvalStore.loanRequestStatus === 'CORRECT_FROM_REGION';
});

// Check if consideration data exists on mount
onMounted(async () => {
  try {
    const response = await api.approval.getConsideration(approvalStore.loanRequestId);
    if (response.status === 200 && response.data) {
      valid.value = true;
    }
  } catch (err) {
    console.log('No existing consideration data found');
  }
});

// Expose validation state to parent
defineExpose({ valid });
</script>

<template>
  <v-btn size="large" :base-color="valid ? 'lightsuccess' : 'lighterror'" @click="isDialogActive = true">
    ملاحظات
    <IconAlertCircle v-if="!valid" style="margin-right: 20px" size="20"/>
    <IconCircleCheck v-if="valid" style="margin-right: 20px" size="20" />
  </v-btn>
  <v-dialog min-width="full" min-height="full" v-model="isDialogActive">
    <v-card title="ملاحظات">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-radio-group inline label="بازپرداخت تسهیلات دریافتی قبلی" v-model="formData.previousLoanAppropriate" :disabled="isEditingDisabled">
              <v-radio label="مناسب نبوده است" :value="false"></v-radio>
              <v-radio label="مناسب بوده است" :value="true"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="12" md="6">
            <v-radio-group inline label="سفته واخواستی" v-model="formData.havePromissoryNote" :disabled="isEditingDisabled">
              <v-radio label="ندارد" :value="false"></v-radio>
              <v-radio label="دارد" :value="true"></v-radio>
            </v-radio-group>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="12">
            <MoneyInput
              v-model="formData.currentOffersAmount"
              density="comfortable"
              hide-details="auto"
              variant="outlined"
              color="primary"
              label="پیشنهادات در جریان به مبلغ"
              suffix="قبلا ارسال ولیکن هنوز مصوبه دریافت نشده است"
              :disabled="isEditingDisabled"
            />
          </v-col>
          <v-col cols="12" md="12">
            <ShamsiDatePicker
              v-model="formData.creditLimitDate"
              label="حد اعتباریه سالانه / سقف اعتباری مشتری در تاریخ"
              color="black"
              density="comfortable"
              hide-details="auto"
              variant="outlined"
              :disabled="isEditingDisabled"
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions style="display: flex; justify-content: space-evenly; padding: 25px 10px">
        <v-btn color="primary" variant="elevated" text="ذخیره" @click="submitData" :disabled="isEditingDisabled" />
        <v-btn color="error" variant="elevated" text="انصراف" @click="isDialogActive = false"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
