<script lang="ts" setup>
import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue';
//utils
//type
import envConfig from '@/config/envConfig';
import { useApprovalStore } from '@/stores/approval';
import { useCustomizerStore } from '@/stores/customizer';
import type { CustomerDto, FacilitiesRequest, GreenLicense, GuaranteeRequest, LcRequest } from '@/types/approval/approvalType';
const customizerStore = useCustomizerStore();
// Use dynamic imports for heavy components
const Facilities = defineAsyncComponent(() => import('./Facilities.vue'));
const LetterOfCredit = defineAsyncComponent(() => import('./LetterOfCredit.vue'));
const Guarantee = defineAsyncComponent(() => import('./Guarantee.vue'));
const GreenLicense = defineAsyncComponent(() => import('./approvalGuaranteeLicense.vue'));
const approvalStore = useApprovalStore();

// Environment detection
const isLiveEnvironment = computed(() => {
  return envConfig.ENVIRONMENT === 'live';
});

// Tab Management
const activeTab = ref('facilities');

// Available tabs based on environment
const availableTabs = computed(() => {
  if (isLiveEnvironment.value) {
    return [{ value: 'facilities', label: 'تسهیلات' }];
  }
  return [
    { value: 'facilities', label: 'تسهیلات' },
    { value: 'guarantee', label: 'ضمانت‌نامه' },
    { value: 'lc', label: 'اعتبار اسنادی' },
    { value: 'greenLicense', label: 'تضامین جواز سبز' }
  ];
});

// Search Section State

const error = ref<string | null>(null);
const showError = ref(false);
const items = ref<CustomerDto[]>([]);
const isValid = ref(false);

// Data Entry Section State
const formData = ref({
  summary: '',
  activityType: '',
  description: ''
});

const facilitiesRef = ref();
const guaranteeRef = ref();
const lcRef = ref();
const greenLicenseRef = ref();

const facilitiesData = ref<FacilitiesRequest[]>([]);
const guaranteeData = ref<GuaranteeRequest[]>([]);
const lcData = ref<LcRequest[]>([]);
const greenLicenseData = ref<GreenLicense[]>([]);

// Computed property to check if any data exists
const hasAnyData = computed(() => {
  if (isLiveEnvironment.value) {
    return facilitiesData.value.length > 0;
  }
  return facilitiesData.value.length > 0 || 
         guaranteeData.value.length > 0 || 
         lcData.value.length > 0 || 
         greenLicenseData.value.length > 0;
});

// Computed property for form validation
const isFormValid = computed(() => {
  return formData.value.summary.trim() !== '' && 
         formData.value.activityType.trim() !== '' && 
         formData.value.description.trim() !== '';
});

onMounted(() => {
  if (approvalStore.loanRequestDetailList) {
    isValid.value = true;
    if (approvalStore.loanRequestDetailList.summaryRequest) {
      formData.value = {
        summary: approvalStore.loanRequestDetailList.summaryRequest.summary,
        activityType: approvalStore.loanRequestDetailList.summaryRequest.activityType,
        description: approvalStore.loanRequestDetailList.summaryRequest.description
      };
    }
  }
});

const submitData = async () => {
  try {
    // Check if any approval data exists
    if (!hasAnyData.value) {
      const errorMsg = 'لطفا درخواست مصوبه را ثبت کنید';
      error.value = errorMsg;
      showError.value = true;
      return Promise.reject(errorMsg);
    }

    // Update store with data based on environment
    if (isLiveEnvironment.value) {
      // In live environment, only handle facilities data as array
      approvalStore.setLoanRequestDetailList({
        summaryRequest: {
          summary: formData.value.summary,
          activityType: formData.value.activityType,
          description: formData.value.description
        },
        facilities: facilitiesData.value,
        guarantee: [],
        lc: [],
        greenLicense: []
      });
    } else {
      // In other environments, handle all data types as arrays
      approvalStore.setLoanRequestDetailList({
        summaryRequest: {
          summary: formData.value.summary,
          activityType: formData.value.activityType,
          description: formData.value.description
        },
        facilities: facilitiesData.value,
        guarantee: guaranteeData.value,
        lc: lcData.value,
        greenLicense: greenLicenseData.value
      });
    }

    return Promise.resolve();
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'خطای ناشناخته در ثبت اطلاعات مشتری';
    error.value = errorMsg;
    showError.value = true;
    return Promise.reject(errorMsg);
  }
};

// Add watch to load data when editing for all data types
watch(() => approvalStore.loanRequestDetailList?.facilities, (newFacilities) => {
  if (Array.isArray(newFacilities) && newFacilities.length > 0) {
    facilitiesData.value = newFacilities;
  }
  // Don't clear local data if store has empty array - this prevents data loss when navigating
}, { immediate: true });

watch(() => approvalStore.loanRequestDetailList?.guarantee, (newGuarantee) => {
  if (Array.isArray(newGuarantee) && newGuarantee.length > 0) {
    guaranteeData.value = newGuarantee;
  }
  // Don't clear local data if store has empty array - this prevents data loss when navigating
}, { immediate: true });

watch(() => approvalStore.loanRequestDetailList?.lc, (newLc) => {
  if (Array.isArray(newLc) && newLc.length > 0) {
    lcData.value = newLc;
  }
  // Don't clear local data if store has empty array - this prevents data loss when navigating
}, { immediate: true });

watch(() => approvalStore.loanRequestDetailList?.greenLicense, (newGreenLicense) => {
  if (Array.isArray(newGreenLicense) && newGreenLicense.length > 0) {
    greenLicenseData.value = newGreenLicense;
  }
  // Don't clear local data if store has empty array - this prevents data loss when navigating
}, { immediate: true });

function isObjectEmpty(obj: any): boolean {
  if (!obj) return true;
  if (typeof obj !== 'object') return true;
  if (Array.isArray(obj)) return obj.length === 0;
  
  // Check if it's an empty object (no own properties)
  const keys = Object.keys(obj);
  if (keys.length === 0) return true;
  
  // Check if all values are empty/null/undefined
  return Object.values(obj).every((v) => {
    if (v === undefined || v === null || v === '') return true;
    if (Array.isArray(v)) return v.length === 0;
    if (typeof v === 'object') return isObjectEmpty(v);
    return false;
  });
}

function handleSaveFacility(data: FacilitiesRequest) {
  facilitiesData.value = [...facilitiesData.value, data];
  approvalStore.updateFacilities(facilitiesData.value);
}

function handleDeleteFacility(item: FacilitiesRequest) {
  const id = (item as any).id;
  facilitiesData.value = id != null
    ? facilitiesData.value.filter((i: any) => i.id !== id)
    : facilitiesData.value.filter((i) => i !== item);
  // Don't update store with empty object, let it remain as is
  // This prevents the watch from clearing data when navigating back
}

function handleSaveLC(data: LcRequest) {
  lcData.value = [...lcData.value, data];
  approvalStore.updateLc(lcData.value);
}

function handleDeleteLC(item: LcRequest) {
  const id = (item as any).id;
  lcData.value = id != null
    ? lcData.value.filter((i: any) => i.id !== id)
    : lcData.value.filter((i) => i !== item);
  // Don't update store with empty object, let it remain as is
  // This prevents the watch from clearing data when navigating back
}

function handleSaveGuarantee(data: GuaranteeRequest) {
  guaranteeData.value = [...guaranteeData.value, data];
  approvalStore.updateGuarantee(guaranteeData.value);
}

function handleDeleteGuarantee(item: GuaranteeRequest) {
  const id = (item as any).id;
  guaranteeData.value = id != null
    ? guaranteeData.value.filter((i: any) => i.id !== id)
    : guaranteeData.value.filter((i) => i !== item);
  // Don't update store with empty object, let it remain as is
  // This prevents the watch from clearing data when navigating back
}

function handleSaveGreenLicense(data: GreenLicense) {
  greenLicenseData.value = [...greenLicenseData.value, data];
  approvalStore.updateGreenLicense(greenLicenseData.value);
}

function handleDeleteGreenLicense(item: GreenLicense) {
  const id = (item as any).id;
  greenLicenseData.value = id != null
    ? greenLicenseData.value.filter((i: any) => i.id !== id)
    : greenLicenseData.value.filter((i) => i !== item);
  // Don't update store with empty object, let it remain as is
  // This prevents the watch from clearing data when navigating back
}

// Method to properly clear all data when needed (e.g., when starting a new request)
function clearAllData() {
  facilitiesData.value = [];
  guaranteeData.value = [];
  lcData.value = [];
  greenLicenseData.value = [];
  formData.value = {
    summary: '',
    activityType: '',
    description: ''
  };
  // Clear the store as well
  approvalStore.setLoanRequestDetailList({
    summaryRequest: {} as any,
    facilities: [],
    guarantee: [],
    lc: [],
    greenLicense: []
  });
}

defineExpose({ submitData, clearAllData });
</script>

<template>
  <div class="approval-section">
    <h4 class="group-title">خلاصه درخواست مشتری</h4>
    <form class="customer-form">
      <v-row class="mt-2">
        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.summary"
            label="خلاصه درخواست"
            variant="outlined"
            density="comfortable"
            :rules="[(v: any) => !!v || 'این فیلد الزامی است']" 
            :disabled="approvalStore.loanRequestStatus === 'CORRECT_FROM_REGION'"
            />
        </v-col>
        <!-- National Code Input -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.activityType"
            label="نوع فعالیت"
            variant="outlined"
            density="comfortable"
            :rules="[(v: any) => !!v || 'این فیلد الزامی است']"
            :disabled="approvalStore.loanRequestStatus === 'CORRECT_FROM_REGION'"
          />
        </v-col>
        <v-col cols="12" md="12">
          <v-textarea
            v-model="formData.description"
            label="توضیحات"
            variant="outlined"
            density="comfortable"
            rows="2"
            :rules="[(v: any) => !!v || 'این فیلد الزامی است']"
            :disabled="approvalStore.loanRequestStatus === 'CORRECT_FROM_REGION'"
          />
        </v-col>
        <v-divider inset></v-divider>
      </v-row>
    </form>
  </div>
  <!-- Render only the active tab's component -->
  <div class="approval-section">
    <h4 class="group-title">درخواست مصوبه</h4>
    <v-tabs v-model="activeTab" class="mb-2" v-if="!isLiveEnvironment">
      <v-tab 
        v-for="tab in availableTabs" 
        :key="tab.value" 
        :value="tab.value"
      >
        {{ tab.label }}
      </v-tab>
    </v-tabs>
    <!-- Use v-show to preserve component state when switching tabs -->
    <Facilities 
      v-show="isLiveEnvironment || activeTab === 'facilities'" 
      ref="facilitiesRef" 
      :loading="customizerStore.loading"
      @save="handleSaveFacility" 
      @delete="handleDeleteFacility" 
      @update:facilities="facilitiesData = $event" 
    />
    <Guarantee 
      v-show="!isLiveEnvironment && activeTab === 'guarantee'" 
      ref="guaranteeRef" 
      :loading="customizerStore.loading"
      @save="handleSaveGuarantee" 
      @delete="handleDeleteGuarantee" 
      @update:guarantee="guaranteeData = $event" 
    />
    <LetterOfCredit 
      v-show="!isLiveEnvironment && activeTab === 'lc'" 
      ref="lcRef" 
      :loading="customizerStore.loading"
      @save="handleSaveLC" 
      @delete="handleDeleteLC" 
      @update:lc="(val) => { lcData = val; approvalStore.updateLc(val); }" 
    />
    <GreenLicense 
      v-show="!isLiveEnvironment && activeTab === 'greenLicense'" 
      ref="greenLicenseRef" 
      :loading="customizerStore.loading"
      @save="handleSaveGreenLicense" 
      @delete="handleDeleteGreenLicense" 
      @update:greenLicense="greenLicenseData = $event" 
    />
  </div>
  <v-snackbar v-model="showError" color="error" timeout="5500">
    {{ error }}
  </v-snackbar>
</template>

<style lang="scss" scoped>
@import '@/scss/components/approval';
</style>