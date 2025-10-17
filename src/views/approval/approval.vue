<script lang="ts" setup>
import { ref, computed, defineAsyncComponent, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '@/services/api';
import { useApprovalStore } from '@/stores/approval';
import AppStepper from '@/components/common/AppStepper.vue';
import { useBaseStore } from '@/stores/base';
import type { GuarantorInfoDTO, SaveGeneralPayload } from '@/types/approval/approvalType';
import { useCustomizerStore } from '@/stores/customizer';

const router = useRouter();
const approvalStore = useApprovalStore();
const baseStore = useBaseStore();
const submitting = ref(false);
const error = ref<string | null>(null);
const showError = ref(false);
const showSuccess = ref(false);
const successMessage = ref<string | null>(null);
const stepper = ref(1);
const stepperRef = ref();
const customizerStore = useCustomizerStore();
const route = useRoute();
const { id } = route.params;

// Watch for id parameter changes
watch(
  () => route.params.id,
  (newId, oldId) => {
    if (!newId && oldId) {
      // ID was removed from URL - reset store and go to first step
      approvalStore.resetAll();
      stepper.value = 1;
      error.value = null;
      showError.value = false;
      showSuccess.value = false;
    }
  },
  { immediate: true }
);

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
        approvalStore.loanRequestStatus = res.data.loanRequestStatus || '';

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

const prevStep = () => {
  if (stepper.value > 1) stepper.value--;
};

const handleSave = async () => {
  submitting.value = true;
  try {
    // First, save current step component data to store
    const currentStepComponent = stepperRef.value?.currentStepComponentRef;
    if (currentStepComponent && typeof currentStepComponent.submitData === 'function') {
      await currentStepComponent.submitData();
    }

    const guarantorInfoDTO: GuarantorInfoDTO[] = approvalStore.guarantor
      .filter((guarantor) => guarantor.nationalCode && guarantor.guarantorName)
      .map((guarantor) => ({
        nationalCode: guarantor.nationalCode!,
        guarantorName: guarantor.guarantorName!,
        createdAt: guarantor.createdAt!,
        label: guarantor.label!,
        sapInquiryStatus: guarantor.sapInquiryStatus!,
        value: guarantor.value!
      }));
    customizerStore.loading = true;
    // Get loan request details from store
    const loanRequestDetailList = approvalStore.loanRequestDetailList;

    // Create the complete payload
    const payload: SaveGeneralPayload = {
      customerInfoDTO: approvalStore.customerInfo,
      loanRequestDetailDTO: {
        loanRequestDetailList: loanRequestDetailList ? [loanRequestDetailList] : []
      },
      guarantorInfoDTO: guarantorInfoDTO,
      loanRequestId: approvalStore.loanRequestId,
      trackingCode: approvalStore.trackingCode
    };
    
    const res = await api.approval.saveGeneral(payload);
    if (res.status === 200) {
      customizerStore.loading = false
      showSuccess.value = true
      successMessage.value = 'مصوبه با موفقیت بروزرسانی شد'
      await router.push('/approval/edit');
    }
  } catch (err) {
    console.error('Error in handleSave:', err);
    error.value = typeof err === 'string' ? err : err && (err as any).message ? (err as any).message : 'خطا در ذخیره‌سازی اطلاعات';
    showError.value = true;
  } finally {
    submitting.value = false;
    customizerStore.loading = false;
  }
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
    error.value = typeof err === 'string' ? err : err && (err as any).message ? (err as any).message : 'لطفا اطلاعات را بررسی کنید';
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
    <div class="d-flex gap-2" v-if="stepper < totalSteps">
      <v-btn v-if="id && approvalStore.trackingCode" color="primary" @click="handleSave" :loading="submitting"> ذخیره و خروج</v-btn>
      <v-btn color="secondary" @click="handleSubmit" :loading="submitting"> مرحله بعد</v-btn>
    </div>
    <v-btn v-else color="secondary" @click="handleCartable" :loading="submitting"> ایجاد کارتابل</v-btn>
    <v-chip v-if="approvalStore.trackingCode" size="x-large" color="secondary" variant="tonal" readonly>
      کد درخواست : {{ approvalStore.trackingCode }}</v-chip
    >
    <v-btn @click="prevStep" :disabled="stepper === 1">مرحله قبلی</v-btn>
  </div>

  <v-snackbar v-model="showError" color="error" timeout="2500">
    {{ error }}
  </v-snackbar>

  <v-snackbar v-model="showSuccess" color="success" timeout="2500">
    {{ successMessage }}
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
