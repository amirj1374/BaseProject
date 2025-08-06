<script lang="ts" setup>
import { ref, computed, defineAsyncComponent, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '@/services/api';
import { useApprovalStore } from '@/stores/approval';
import AppStepper from '@/components/common/AppStepper.vue';
import { useBaseStore } from '@/stores/base';
import type { LoanRequestDetail, GuarantorDto } from '@/types/approval/approvalType';

const router = useRouter();
const approvalStore = useApprovalStore();
const baseStore = useBaseStore();
const submitting = ref(false);
const error = ref<string | null>(null);
const showError = ref(false);
const showSuccess = ref(false);
const stepper = ref(1);
const stepperRef = ref();

const { id } = useRoute().params;

onMounted(async () => {
  // Only call API if id parameter exists
  if (id) {
    try {
      const res = await api.approval.getApprovalEdit(id as string);
      if (res.status === 200) {
        console.log('API Response:', res.data); // Debug log
        
        // Set basic info
        approvalStore.loanRequestId = res.data.loanRequestId?.toString() || '';
        approvalStore.trackingCode = res.data.trackingCode || '';
        
        // Set customer info - API returns customerInfoDTO
        if (res.data.customerInfoDTO) {
          approvalStore.setCustomerInfo(res.data.customerInfoDTO);
        }
        
        // Set loan request detail list - API returns loanRequestDetailDTO.loanRequestDetailList
        if (res.data.loanRequestDetailDTO?.loanRequestDetailList) {
          // Take the first item from the array since our store expects a single object
          const firstDetail = res.data.loanRequestDetailDTO.loanRequestDetailList[0];
          if (firstDetail) {
            approvalStore.setLoanRequestDetailList(firstDetail);
          }
        }
        
        // Set guarantor - API returns guarantorInfoDTO
        if (res.data.guarantorInfoDTO && Array.isArray(res.data.guarantorInfoDTO)) {
          approvalStore.setGuarantor(res.data.guarantorInfoDTO);
        } else {
          // If no guarantor data, set empty array
          approvalStore.setGuarantor([]);
        }
        
        console.log('Store after update:', {
          customerInfo: approvalStore.customerInfo,
          loanRequestDetailList: approvalStore.loanRequestDetailList,
          guarantor: approvalStore.guarantor
        });
      }
    } catch (err) {
      console.error('Error fetching approval data:', err);
      error.value = 'خطا در بارگذاری اطلاعات مصوبه';
      showError.value = true;
    }
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
    
    // Move to next step without calling submitData again
    if (stepper.value < totalSteps) {
      stepper.value++;
    } 
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

// Reset approval store when leaving the component
onBeforeUnmount(() => {
  approvalStore.resetAll();
});
</script>

<template>
  <AppStepper v-model="stepper" :steps="steps" contentMinHeight="70vh" ref="stepperRef" />

  <div class="actions">
    <v-btn v-if="stepper < totalSteps" color="secondary" @click="handleSubmit" :loading="submitting"> مرحله بعد</v-btn>
    <v-btn v-else color="secondary" @click="handleCartable" :loading="submitting"> ایجاد کارتابل</v-btn>
    <v-chip v-if="approvalStore.trackingCode" size="x-large" color="secondary" variant="tonal" readonly>  کد درخواست :  {{approvalStore.trackingCode}}</v-chip>
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
