<template>
  <div class="approval-section">
    <v-form ref="formRef" v-model="isValid" lazy-validation>
      <!-- Financial Metrics -->
      <v-row>
        <v-col cols="12" md="3">
          <v-text-field v-model="form.letterNo" label="شماره نامه" variant="outlined" density="comfortable" />
        </v-col>
        <v-col cols="12" md="3">
          <ShamsiDatePicker
            v-model="form.letterDate"
            label="تاریخ نامه"
            variant="outlined"
            density="comfortable"
            mode="single"
            format="YYYY-MM-DD"
            displayFormat="jYYYY/jMM/jDD"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field v-model="form.reqDescription" label="توضیحات" variant="outlined" density="comfortable" />
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/services/api';
import type { ApplicantRequestDTO } from '@/types/preApproval/preApprovalTypes';
import ShamsiDatePicker from '@/components/shared/ShamsiDatePicker.vue';

const props = defineProps<{
  cartableId: string;
  loanRequestId: string;
  currentStep: number;
  totalSteps: number;
  loanRequestTypeOptions?: string[];
}>();

const formRef = ref();
const isValid = ref(false);

// Local form data - only updates store on submit
const form = ref({
  // شماره نامه
  letterNo: '',
  // تاریخ نامه
  letterDate: '',
  // توضیحات
  reqDescription: ''
});

onMounted(async () => {
  try {
    const res = await api.cartable.getApplicantRequest(props.cartableId);
    if (res?.status === 200 && res.data) {
      // Populate local form with store data
      const financialData = res.data;
      if (financialData) {
        form.value = {
          letterNo: financialData.letterNo || '',
          letterDate: financialData.letterDate || '',
          reqDescription: financialData.reqDescription || ''
        };
      }
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
      ...form.value,
    } as unknown as ApplicantRequestDTO;

    // Call saveCreditApproval API
    const res = await api.cartable.saveApplicantRequest(props.cartableId, payload);

    if (res?.status === 200 && res.data) {
      console.log('Credit approval data saved successfully:', res.data);
      return Promise.resolve();
    }

    return Promise.reject('خطا در ثبت اطلاعات');
  } catch (e) {
    console.error('Error saving credit approval data:', e);
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
