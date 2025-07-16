<script lang="ts" setup>
import { ref, computed, defineAsyncComponent, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '@/services/api';
import { useApprovalStore } from '@/stores/approval';
import AppStepper from '@/components/common/AppStepper.vue';
import { useBaseStore } from '@/stores/base';

const router = useRouter();
const approvalStore = useApprovalStore();
const baseStore = useBaseStore();
const submitting = ref(false);
const error = ref<string | null>(null);
const showError = ref(false);
const showSuccess = ref(false);
const stepper = ref(1);
const stepperRef = ref();
onMounted(async () => {
  const res = await api.approval.fetchCurrencies();
  if (res.status === 200) {
    baseStore.setCurrencyList(res.data);
  }
  const res2 = await api.approval.getCollateral();
  if (res2.status === 200) {
    baseStore.setCollateralList(res2.data);
  }
});
// Steps array for AppStepper
const steps = [
  {
    title: 'ثبت درخواست مشتری',
    section: defineAsyncComponent(() => import('@/components/sections/approval/customers/customers.vue'))
  },
  {
    title: 'اطلاعات نوع درخواست',
    section: defineAsyncComponent(() => import('@/components/sections/approval/approvalType/approvalType.vue'))
  },
  {
    title: 'اطلاعات ضامن / ضامنین',
    section: defineAsyncComponent(() => import('@/components/sections/approval/guarantor/guarantor.vue'))
  },
  {
    title: 'استعلام',
    section: defineAsyncComponent(() => import('@/components/sections/approval/inquiry/inquiry.vue'))
  },
  {
    title: 'بارگذاری مدارک',
    section: defineAsyncComponent(() => import('@/components/sections/approval/upload/upload.vue'))
  },
  {
    title: 'پیشنویس',
    section: defineAsyncComponent(() => import('@/components/sections/approval/draft/draft.vue'))
  },
  {
    title: 'نمایش فرم',
    section: defineAsyncComponent(() => import('@/components/sections/approval/preview/preview.vue'))
  }
];

const totalSteps = steps.length;

// Navigation handlers
const nextStep = async () => {
  submitting.value = true;
  try {
    // Try to call submitData on the current step component if it exists
    const currentStepComponent = stepperRef.value?.currentStepComponentRef;
    if (currentStepComponent && typeof currentStepComponent.submitData === 'function') {
      await currentStepComponent.submitData();
    }
    if (stepper.value < totalSteps) {
      stepper.value++;
    } else {
      await router.push('/test/test');
    }
  } catch (err) {
    error.value = `${err}`;
  } finally {
    submitting.value = false;
  }
};

const prevStep = () => {
  if (stepper.value > 1) stepper.value--;
};

// Form submission
const handleSubmit = async () => {
  submitting.value = true;
  try {
    // Access the current step's component instance via the stepper ref
    const currentStepComponent = stepperRef.value?.currentStepComponentRef;
    if (currentStepComponent && typeof currentStepComponent.submitData === 'function') {
      await currentStepComponent.submitData();
    }
    await nextStep();
  } catch (err) {
    showSuccess.value = false;
    error.value = typeof err === 'string' ? err : (err && (err as any).message ? (err as any).message : 'لطفا اطلاعات را بررسی کنید');
    showError.value = true;
  } finally {
    submitting.value = false;
  }
};

// Submit all data to cartable
const handleCartable = async () => {
  submitting.value = true;
  try {
    const res = await api.cartable.saveCartable(approvalStore.trackingCode);
    if (res.status === 200) {
      await router.push('/cartable');
    }
  } catch (err) {
    error.value = `${err}`;
    showError.value = true;
  } finally {
    submitting.value = false;
  }
};

// Get current component
const currentComponent = computed(() => steps[stepper.value - 1].section);
</script>

<template>
  <AppStepper v-model="stepper" :steps="steps" contentMinHeight="70vh" ref="stepperRef" />

  <div class="actions">
    <v-btn v-if="stepper < totalSteps" color="secondary" @click="handleSubmit" :loading="submitting"> مرحله بعد</v-btn>
    <v-btn v-else color="secondary" @click="handleCartable" :loading="submitting"> ایجاد کارتابل</v-btn>
    <v-btn @click="prevStep" :disabled="stepper === 1">مرحله قبلی</v-btn>
  </div>

  <v-snackbar v-model="showError" color="error" timeout="2500">
    {{ error }}
  </v-snackbar>
</template>

<style scoped>
.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  flex-direction: row-reverse;
}
</style>
