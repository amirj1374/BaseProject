<template>
  <div class="approval-section">
    <v-form ref="formRef" v-model="isValid" lazy-validation>
      <!-- Credit Approval Last Decision Section -->
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="lastDecisionForm.finalApprovalReference"
            label="مرجع تصویب نهایی"
            variant="outlined"
            density="comfortable"
            placeholder="شماره مرجع تصویب نهایی"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="lastDecisionForm.attachedByLetterNo"
            label="منضم به نامه شماره"
            variant="outlined"
            density="comfortable"
            placeholder="شماره نامه ضمیمه"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="6">
          <ShamsiDatePicker
            v-model="lastDecisionForm.attachedByLetterNoDate"
            label="تاریخ نامه"
            variant="outlined"
            density="comfortable"
            mode="single"
            format="YYYY-MM-DD"
            displayFormat="jYYYY/jMM/jDD"
            placeholder="تاریخ نامه را انتخاب کنید"
            emitWithTimezone
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-textarea
            v-model="lastDecisionForm.regionOrCorpBankingSuggestion"
            label="پیشنهاد سرپرستی منطقه/ مدیریت بانکداری شرکتی"
            variant="outlined"
            density="comfortable"
            placeholder="پیشنهادات و توضیحات"
            rows="3"
            auto-grow
          />
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/services/api';
import type { CreditApprovalLastDecisionDTO } from '@/types/preApproval/preApprovalTypes';
import ShamsiDatePicker from '@/components/shared/ShamsiDatePicker.vue';

const props = defineProps<{ cartableId: string; loanRequestId: string; currentStep: number; totalSteps: number; loanRequestTypeOptions?: string[] }>();

const formRef = ref();
const isValid = ref(false);

// Last Decision form data
const lastDecisionForm = ref({
  // مرجع تصویب نهایی
  finalApprovalReference: '',
  // منضم به نامه شماره
  attachedByLetterNo: '',
  // تاریخ نامه
  attachedByLetterNoDate: '',
  // پیشنهاد سرپرستی منطقه/ مدیریت بانکداری شرکتی
  regionOrCorpBankingSuggestion: '',
});

onMounted(async () => {
  try {
    const res = await api.cartable.getCreditApproval(props.cartableId);
    if (res?.status === 200 && res.data) {


      // Populate last decision form with store data
      const lastDecisionData = res.data.creditApprovalLastDecisionDTO;
      if (lastDecisionData) {
        lastDecisionForm.value = {
          finalApprovalReference: lastDecisionData.finalApprovalReference || '',
          attachedByLetterNo: lastDecisionData.attachedByLetterNo || '',
          attachedByLetterNoDate: lastDecisionData.attachedByLetterNoDate || '',
          regionOrCorpBankingSuggestion: lastDecisionData.regionOrCorpBankingSuggestion || '',
        };
      }

      console.log('Credit approval data loaded to store and form:', res.data);
    }
  } catch (e) {
    console.error('Error loading credit approval data:', e);
  } finally {
  }
});

const submitData = async () => {
  const result = await formRef.value?.validate();
  if (result?.valid === false) return Promise.reject('لطفاً خطاهای فرم را برطرف کنید');
  try {
    // Use local form data for submission
    const payload = {
      ...lastDecisionForm.value,
      cartableId: parseInt(props.cartableId),
      // Add required fields with default values
      createdAt: null,
      updatedAt: null,
      createdBy: null,
      updatedBy: null,
      id: null,
    } as unknown as CreditApprovalLastDecisionDTO;

    // Call saveLastDecision API
    const res = await api.cartable.saveLastDecision(props.cartableId, payload);

    if (res?.status === 200 && res.data) {
      console.log('Last decision data saved successfully:', res.data);

      return Promise.resolve();
    }

    return Promise.reject('خطا در ثبت اطلاعات');
  } catch (e) {
    console.error('Error saving last decision data:', e);
    return Promise.reject('خطا در ثبت اطلاعات');
  }
};

defineExpose({ submitData });
</script>

<style scoped>
.credit-approval-form {
  padding: 8px;
}
</style>
