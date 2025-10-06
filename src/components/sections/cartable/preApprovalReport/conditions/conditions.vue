<template>
  <div class="approval-section">
    <v-form ref="formRef" v-model="isValid" lazy-validation>
      <!-- Financial Metrics -->
      <v-row>
        <v-col cols="12" md="12">
          <DescriptionInput
            v-model="form.otherConditionsAndObservations"
            label="پیشنهادات و توضیحات"
            placeholder="لطفا توضیحات را وارد کنید..."
            :start-number="1"
            :auto-numbering="true"
            :rows="8"
            :maxlength="2000"
          />
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/services/api';
import type { ConditionsDTO } from '@/types/preApproval/preApprovalTypes';
import DescriptionInput from '@/components/shared/DescriptionInput.vue';

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
  // توضیحات پروژه
  otherConditionsAndObservations: ''
});

const nonNegative = (v: any) => v == null || v === '' || Number(v) >= 0 || 'باید ≥ 0 باشد';
const ratio = (v: any) => v == null || v === '' || (Number(v) >= 0 && Number(v) <= 9999) || 'مقدار نامعتبر';

onMounted(async () => {
  try {
    const res = await api.cartable.getConditions(props.cartableId);
    if (res?.status === 200 && res.data) {
      // Populate local form with store data
      const financialData = res.data;
      if (financialData) {
        form.value = {
          otherConditionsAndObservations: financialData.otherConditionsAndObservations || ''
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
      ...form.value,
      cartableId: parseInt(props.cartableId),
    } as unknown as ConditionsDTO;

    // Call saveCreditApproval API
    const res = await api.cartable.saveConditions(props.cartableId, payload);

    if (res?.status === 200 && res.data) {
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
