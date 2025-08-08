<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <AppStepper
    v-model="stepper" 
    :steps="steps" 
    :step-props="stepProps" 
    contentMinHeight="60vh"
    ref="stepperRef" 
  />

  <div class="actions">
    <v-btn v-if="stepper < totalSteps" color="secondary" @click="nextStep" :loading="submitting">
      مرحله بعد
    </v-btn>
    <v-btn v-else color="secondary" @click="handleSubmit" :loading="submitting">
      ثبت گزارش
    </v-btn>
    <v-btn @click="prevStep" :disabled="stepper === 1">
      مرحله قبلی
    </v-btn>
  </div>

  <v-snackbar v-model="showError" color="error" timeout="2500">
    {{ error }}
  </v-snackbar>
</template>

<script lang="ts" setup>
import { ref, computed, defineAsyncComponent, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '@/services/api';
import AppStepper from '@/components/common/AppStepper.vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';

const { id } = useRoute().params;
const stepper = ref(1);
const stepperRef = ref();
const submitting = ref(false);
const error = ref<string | null>(null);
const showError = ref(false);
const loanRequestId = ref<string>('');

// Steps array for AppStepper
const steps = [
  {
    title: 'خلاصه وضعیت مالی و عملکرد متقاضی',
    section: defineAsyncComponent(() => import('./summaryPerformance/summaryPerformance.vue'))
  },
  {
    title: 'مشخصات پيشنهاد اعتباري',
    section: defineAsyncComponent(() => import('./creditOffer/creditOffer.vue'))
  },
  {
    title: 'وضعيت سپرده های مشتري',
    section: defineAsyncComponent(() => import('./depositStatus/depositStatus.vue'))
  },
  {
    title: 'وضعيت تسهيلات و تعهدات مشتري',
    section: defineAsyncComponent(() => import('./facilityStatus/facilityStatus.vue'))
  },
  {
    title: 'مصوبات اخیر',
    section: defineAsyncComponent(() => import('./recentApproval/recentApproval.vue'))
  },
  {
    title: 'ساير شرايط و ملاحظات',
    section: defineAsyncComponent(() => import('./comments/comments.vue'))
  },
  {
    title: 'مشاهده گزارش پیش مصوبه',
    section: defineAsyncComponent(() => import('./pdfPreview/pdfPreview.vue'))
  }
];

const totalSteps = steps.length;

// Props to pass to all step components
const stepProps = computed(() => ({
  loanRequestId: loanRequestId.value,
  cartableId: id as string,
  currentStep: stepper.value,
  totalSteps: totalSteps
}));

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
    }
  } catch (err) {
    error.value = `${err}`;
    showError.value = true;
  } finally {
    submitting.value = false;
  }
};

const prevStep = () => {
  if (stepper.value > 1) stepper.value--;
};

// Final submission
const handleSubmit = async () => {
  submitting.value = true;
  try {
    // Call submitData on the current step component if it exists
    const currentStepComponent = stepperRef.value?.currentStepComponentRef;
    if (currentStepComponent && typeof currentStepComponent.submitData === 'function') {
      await currentStepComponent.submitData();
    }
    
    // Here you can add logic to submit the entire report
    console.log('Submitting pre-approval report for loan request:', loanRequestId.value);
    
    // You can navigate back to cartable or show success message
    // await router.push('/cartable');
    
  } catch (err) {
    error.value = typeof err === 'string' ? err : 'خطا در ثبت گزارش';
    showError.value = true;
  } finally {
    submitting.value = false;
  }
};

const breadcrumbs = ref([
  {
    title: 'کارتابل ها',
    disabled: false,
    href: '/cartable'
  },
  {
    title: 'گزارش پیش مصوبه',
    disabled: false,
    href: '#'
  }
]);

const page = ref({ title: 'گزارش پیش مصوبه' });

onMounted(async () => {
  try {
    const response = await api.cartable.getLoanRequestId(id as string);
    if (response.status === 200 && response.data) {
      loanRequestId.value = response.data;
      console.log('Loan Request ID:', loanRequestId.value);
    }
  } catch (err) {
    console.error('Error fetching loan request ID:', err);
    error.value = 'خطا در دریافت شناسه درخواست';
    showError.value = true;
  }
});
</script>

<style scoped>
.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  flex-direction: row-reverse;
}
</style>